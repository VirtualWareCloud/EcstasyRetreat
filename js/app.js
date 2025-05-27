<script>
  function toggleMenu() {
    const navList = document.querySelector("nav ul");
    navList.classList.toggle("active");
  }

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

  let slideIndex = 0;
  const slides = document.querySelectorAll(".slide");

  function showSlides() {
    slides.forEach(slide => slide.classList.remove("active"));
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("active");
  }

  function changeSlide(n) {
    slides[slideIndex].classList.remove("active");
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    slides[slideIndex].classList.add("active");
  }

  setInterval(showSlides, 4000); // Change every 4 seconds
</script>
