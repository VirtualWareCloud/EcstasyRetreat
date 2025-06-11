// Toggles the hamburger menu
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("active");
}

// Enables native share if available
async function shareWebsite() {
  if (navigator.share) {
    await navigator.share({
      title: 'Ecstasy Retreat',
      text: 'Relax with premium mobile massage services',
      url: window.location.href
    });
  } else {
    alert("Sharing not supported on this device.");
  }
}

// Slideshow control
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}
