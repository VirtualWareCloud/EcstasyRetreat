// === Toggle Mobile Menu ===
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("active");
}

// === iOS Style Share Website Button ===
async function shareWebsite() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ecstasy Retreat',
        text: 'Relax with premium mobile massage services',
        url: window.location.href
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  } else {
    alert("Sharing not supported on this device.");
  }
}

// === Auto-Fading Carousel ===
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-carousel img');
const totalSlides = slides.length;
const intervalTime = 4000;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.opacity = i === index ? '1' : '0';
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  showSlide(currentSlide);
}

// Manual nav arrows
document.querySelector('.arrow.left')?.addEventListener('click', previousSlide);
document.querySelector('.arrow.right')?.addEventListener('click', nextSlide);

// Auto-slide every 4 seconds
setInterval(nextSlide, intervalTime);

// Initial slide on load
document.addEventListener("DOMContentLoaded", () => {
  showSlide(currentSlide);
});
