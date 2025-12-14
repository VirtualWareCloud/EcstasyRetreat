(function (global) {
  // Store lightweight metadata for future reporting or debugging
  const errorStore = [];
  const listenerMap = new WeakMap();
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  let toastContainer;
  let styleInjected = false;

  const defaultMessages = {
    network: "Network error. Please check your connection.",
    auth: "Authentication issue. Please sign in again.",
    generic: "Something went wrong. Please try again.",
    timeout: "Request timed out. Please retry.",
  };

  function normalizeError(err) {
    if (!err) return { message: defaultMessages.generic, original: err };
    if (typeof err === "string") return { message: err, original: err };
    const message =
      err.message || err.error_description || err.description || defaultMessages.generic;
    return { message, original: err };
  }

  function mapUserMessage(err, fallback) {
    const raw = (err && err.message ? err.message : fallback || "").toLowerCase();
    if (raw.includes("network") || raw.includes("fetch")) return defaultMessages.network;
    if (raw.includes("auth") || raw.includes("token")) return defaultMessages.auth;
    if (raw.includes("timeout") || raw.includes("time out")) return defaultMessages.timeout;
    return fallback || defaultMessages.generic;
  }

  function ensureStyles() {
    if (styleInjected) return;
    const style = document.createElement("style");
    style.textContent = `
      #ui-error-container {
        position: fixed;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 32px);
        max-width: 480px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .ui-error-toast {
        background: rgba(24, 24, 27, 0.9);
        color: #fff;
        border: 1px solid rgba(244, 114, 182, 0.6);
        box-shadow: 0 10px 30px rgba(0,0,0,0.45);
        border-radius: 14px;
        padding: 12px 14px;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: auto;
      }
      .ui-error-toast.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .ui-error-toast button {
        background: transparent;
        border: none;
        color: #f472b6;
        font-weight: 700;
        cursor: pointer;
      }
      .ui-error-disabled {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
      }
    `;
    document.head.appendChild(style);
    styleInjected = true;
  }

  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    ensureStyles();
    toastContainer = document.createElement("div");
    toastContainer.id = "ui-error-container";
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showError(message, options = {}) {
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = "ui-error-toast";
    toast.textContent = message || defaultMessages.generic;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Dismiss error");
    closeBtn.textContent = "×";
    closeBtn.style.float = "right";
    closeBtn.onclick = (event) => {
      event.stopPropagation();
      toast.remove();
    };
    toast.prepend(closeBtn);

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));

    const duration = options.duration || 4500;
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function handleError(err, context) {
    const { message, original } = normalizeError(err);
    const userMessage = mapUserMessage(original, message);
    errorStore.push({
      timestamp: Date.now(),
      context: context || "Unhandled",
      error: original,
      userMessage,
    });
    console.error(`[UI ERROR${context ? ` - ${context}` : ""}]`, original || message);
    showError(userMessage);
  }

  function normalizeTargets(targets, event, fallbackTarget) {
    if (!targets) return [];
    if (typeof targets === "function") {
      const result = targets(event, fallbackTarget);
      return Array.isArray(result) ? result.filter(Boolean) : result ? [result] : [];
    }
    return Array.isArray(targets) ? targets.filter(Boolean) : [targets];
  }

  function wrapHandler(handler, options = {}) {
    if (typeof handler !== "function") return handler;
    if (handler.__uiSafeWrapped) return handler;

    const wrapped = async function () {
      const event = arguments[0];
      const disableTargets = normalizeTargets(
        options.disableTargets || options.disableTarget,
        event,
        this
      );

      disableTargets.forEach((el) => {
        if (!el) return;
        el.dataset.prevDisabled = el.disabled ? "1" : "0";
        el.disabled = true;
        el.classList.add("ui-error-disabled");
      });

      try {
        return await handler.apply(this, arguments);
      } catch (e) {
        handleError(e, options.context || (event && event.type ? `${event.type} handler` : "Action"));
      } finally {
        disableTargets.forEach((el) => {
          if (!el) return;
          const wasDisabled = el.dataset.prevDisabled === "1";
          el.disabled = wasDisabled;
          el.classList.remove("ui-error-disabled");
          delete el.dataset.prevDisabled;
        });
      }
    };

    wrapped.__uiSafeWrapped = true;
    wrapped.__uiOriginal = handler;
    return wrapped;
  }

  function safeBind(element, event, handler, options = {}) {
    if (!element || !event || !handler) return null;
    const wrapped = wrapHandler(handler, options);
    element.addEventListener(event, wrapped, options.listenerOptions || false);
    return wrapped;
  }

  function patchAddEventListener() {
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (typeof listener !== "function" || listener.__uiSafeWrapped) {
        return originalAddEventListener.call(this, type, listener, options);
      }
      const wrapped = wrapHandler(listener, { context: `${type} handler` });
      listenerMap.set(listener, wrapped);
      return originalAddEventListener.call(this, type, wrapped, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      const wrapped = listenerMap.get(listener);
      return originalRemoveEventListener.call(this, type, wrapped || listener, options);
    };
  }

  function patchInlineHandler(property, proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, property);
    if (!descriptor || typeof descriptor.set !== "function") return;

    Object.defineProperty(proto, property, {
      get: function () {
        return descriptor.get ? descriptor.get.call(this) : undefined;
      },
      set: function (fn) {
        if (typeof fn === "function") {
          descriptor.set.call(this, wrapHandler(fn, { context: `${property} handler` }));
        } else {
          descriptor.set.call(this, fn);
        }
      },
      configurable: true,
      enumerable: descriptor.enumerable,
    });
  }

  function patchInlineHandlers() {
    [HTMLElement.prototype, Document.prototype, Window.prototype].forEach((proto) => {
      ["onclick", "onsubmit", "onchange", "oninput", "onfocus", "onblur"].forEach((prop) =>
        patchInlineHandler(prop, proto)
      );
    });
  }

  function attachGlobalErrorListeners() {
    window.onerror = function (message, source, lineno, colno, error) {
      handleError(error || message, "Global error");
      return true;
    };

    window.onunhandledrejection = function (event) {
      handleError(event.reason || event, "Unhandled promise");
      return true;
    };
  }

  function init() {
    if (global.uiErrorHandlerInitialized) return;
    global.uiErrorHandlerInitialized = true;
    ensureStyles();
    patchAddEventListener();
    patchInlineHandlers();
    attachGlobalErrorListeners();
  }

  init();

  global.uiErrorHandler = {
    handleError,
    showError,
    wrapHandler,
    safeBind,
    errorStore,
  };
})(window);
