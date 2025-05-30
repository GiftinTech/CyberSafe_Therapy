import "./tailwind.css";

// Menu toggle functionaliity
const initToggle = () => {
  const hamburgerBtn = document.getElementById(
    "hamburger-button",
  ) as HTMLButtonElement;
  const mobileMenu = document.getElementById(
    "mobile-menu",
  ) as HTMLButtonElement;

  const toggleMenu = () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
    hamburgerBtn.classList.toggle("toggle-btn");
  };

  hamburgerBtn.addEventListener("click", toggleMenu);
  mobileMenu.addEventListener("click", toggleMenu);
};

// Tab functionality for Resources section
function initResourceTabs() {
  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active/inactive classes from all buttons
      tabButtons.forEach((btn) => {
        btn.classList.remove("tab-active");
        btn.classList.add("tab-inactive");
      });
      // Add active class to clicked button
      button.classList.add("tab-active");
      button.classList.remove("tab-inactive");

      // Hide all tab contents
      tabContents.forEach((content) => content.classList.add("hidden"));

      // Show the selected tab content
      const tab = button.getAttribute("data-tab");
      const activeTab = document.getElementById("tab-" + tab);
      if (activeTab) activeTab.classList.remove("hidden");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Toggle Menu
  initToggle();

  // Canvas Animation for Hero Section
  const canvas = document.getElementById("heroCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  let particlesArray: Particle[] = [];
  const heroSection = document.querySelector(".hero-section") as HTMLElement;

  // Function to set canvas dimensions
  function resizeCanvas(): void {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }

  // Call resizeCanvas initially and on window resize
  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });

  // Particle class
  class Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;

    constructor(
      x: number,
      y: number,
      size: number,
      color: string,
      speedX: number,
      speedY: number,
    ) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.speedX = speedX;
      this.speedY = speedY;
    }

    draw(): void {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update(): void {
      if (this.x + this.size > canvas.width || this.x - this.size < 0) {
        this.speedX = -this.speedX;
      }
      if (this.y + this.size > canvas.height || this.y - this.size < 0) {
        this.speedY = -this.speedY;
      }
      this.x += this.speedX;
      this.y += this.speedY;
      this.draw();
    }
  }

  // Initialize particles
  function initParticles(): void {
    particlesArray = [];
    const numberOfParticles = 50;
    const baseColor = { r: 139, g: 92, b: 246 };

    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const alpha = Math.random() * 0.3 + 0.1;
      const color = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
      const speedX = Math.random() * 0.4 - 0.2;
      const speedY = Math.random() * 0.4 - 0.2;
      particlesArray.push(new Particle(x, y, size, color, speedX, speedY));
    }
  }
  initParticles();

  // Animation loop
  function animateParticles(): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(139, 92, 246, 1)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Star Ratings for Testimonials
  const testimonialCards = document.querySelectorAll(
    '.grid.md\\:grid-cols-3.gap-8.md\\:gap-12 > div[class*="bg-white"]',
  ) as NodeListOf<HTMLDivElement>;

  testimonialCards.forEach((card) => {
    const starsContainer = card.querySelector(
      "div[data-rating]",
    ) as HTMLElement | null;
    if (starsContainer) {
      const rating = parseInt(starsContainer.dataset.rating || "0", 10);
      starsContainer.innerHTML = "";

      for (let i = 1; i <= 5; i++) {
        const starSvg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        starSvg.setAttribute(
          "class",
          `w-5 h-5 ${i <= rating ? "star-filled" : "star-empty"}`,
        );
        starSvg.setAttribute("viewBox", "0 0 20 20");
        starSvg.setAttribute("fill", "currentColor");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute(
          "d",
          "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
        );

        starSvg.appendChild(path);
        starsContainer.appendChild(starSvg);
      }
    }
  });

  //Tab Switching for Resources section functionality
  initResourceTabs();

  // Active nav links functionality
  const sections = document.querySelectorAll(
    "section",
  ) as NodeListOf<HTMLElement>;
  const navLinks = document.querySelectorAll(
    ".nav-link",
  ) as NodeListOf<HTMLAnchorElement>;

  window.addEventListener("scroll", () => {
    let currentSection = "";
    const scrollYWidthOffset = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollYWidthOffset >= sectionTop - sectionHeight / 3 &&
        scrollYWidthOffset < sectionTop + sectionHeight - sectionHeight / 3
      ) {
        currentSection = section.getAttribute("id") ?? "";
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("nav-active");
      if (link.getAttribute("href")?.includes(currentSection))
        link.classList.add("nav-active");
    });
  });

  // Smooth scroll for Home nav link
  document.querySelectorAll('a[href="#home"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Simple FAQ toggle logic
  document.querySelectorAll(".faq-toggle").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const button = event.currentTarget as HTMLElement;
      const answer = button.parentElement?.querySelector(
        ".faq-answer",
      ) as HTMLElement;
      const icon = button.querySelector(".faq-icon") as HTMLElement;
      const isOpen = !answer.classList.contains("hidden");
      document
        .querySelectorAll(".faq-answer")
        .forEach((a) => a.classList.add("hidden"));
      document
        .querySelectorAll(".faq-icon")
        .forEach((i) => i.classList.remove("rotate-180"));
      if (!isOpen) {
        answer.classList.remove("hidden");
        icon.classList.add("rotate-180");
      }
    });
  });

  // Show button after scrolling down
  window.addEventListener("scroll", () => {
    const btn = document.getElementById("backToTop") as HTMLButtonElement;
    if (window.scrollY > 200) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  });
  // Scroll to top on click
  document.getElementById("backToTop")!.onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
});
