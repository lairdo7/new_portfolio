// Typing effect
const typingElement = document.getElementById("typing-text");
const helloText = "Hey!";
const nameText = "I'm Laird Scabar :)";
let index = 0;
let phase = "typing-hello";

function typeEffect() {
  if (phase === "typing-hello") {
    if (index < helloText.length) {
      typingElement.textContent += helloText.charAt(index);
      index++;
      setTimeout(typeEffect, 80);
    } else {
      phase = "pause";
      setTimeout(typeEffect, 600);
    }
  } else if (phase === "pause") {
    phase = "deleting";
    index = helloText.length;
    setTimeout(typeEffect, 100);
  } else if (phase === "deleting") {
    if (index > 0) {
      typingElement.textContent = typingElement.textContent.slice(0, -1);
      index--;
      setTimeout(typeEffect, 50);
    } else {
      phase = "typing-name";
      index = 0;
      setTimeout(typeEffect, 300);
    }
  } else if (phase === "typing-name") {
    if (index < nameText.length) {
      typingElement.textContent += nameText.charAt(index);
      index++;
      setTimeout(typeEffect, 80);
    }
  }
}

// Start typing effect after a brief delay
setTimeout(() => {
  typeEffect();
}, 500);

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const text = document.querySelector(".theme-text");

  if (document.body.classList.contains("dark-mode")) {
    text.textContent = "light";
    localStorage.setItem("theme", "dark");
  } else {
    text.textContent = "dark";
    localStorage.setItem("theme", "light");
  }
}

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  document.querySelector(".theme-text").textContent = "light";
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offset = 80;
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Project hover functionality - shows stats card
function setupProjectPreviews() {
  const projectItems = document.querySelectorAll(".project-item");
  const statsCard = document.querySelector(".project-stats-card");

  console.log("Setting up project previews...");
  console.log("Found project items:", projectItems.length);
  console.log("Found stats card:", !!statsCard);

  if (!statsCard) {
    console.error(
      'Stats card not found! Make sure you have <div class="project-stats-card"> in your HTML',
    );
    return;
  }

  projectItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      const projectId = this.getAttribute("data-project");
      console.log("Hovering over project:", projectId);
      showProjectStats(projectId);
    });

    item.addEventListener("mouseleave", function () {
      console.log("Left project");
      hideProjectStats();
    });
  });

  console.log("Project previews setup complete!");
}

// Project data
const projectData = {
  submarine: {
    title: "SUBC Submarine Drivetrain",
    date: "September 2025 - January 2026",
    technologies: ["SolidWorks", "3D Printing", "FEA", "CNC", "Machining"],
    description:
      "Designed, manufactured, and optimized the human-powered drivetrain for the competition submarine.",
    image: "assets/Drivetrain.jpg",
  },
  wedoo: {
    title: "Wedoo - nwHacks 26'",
    date: "January 2026",
    technologies: ["React Native", "Expo", "Superbase", "Figma", "Git"],
    description:
      "Collaborative to-do and habit tracking app built in 24 hours during nwHacks (largest collegiate hackathon in Western Canada)",
    image: "assets/wedo1.png",
  },
  claw: {
    title: "Autonomous Robotic Claw",
    date: "January 2026",
    technologies: ["Solidworks", "C++", "Arduino", "Ultrasonic Sensor", "Servo Motors"],
    description:
      "Arduino-based robotic claw that detects and grips objects using ultrasonic sensing and servo actuation.",

    image: "assets/Clawphoto.jpeg",
  },
  scraper: {
    title: "Python Internship Scraper",
    date: "December 2025",
    technologies: ["Python", "Requests (API data retrieval)", "Pandas", "Streamlit", "REST APIs (Greenhouse & Lever)"],
    description:
      "Python-based scraper that collects internships from Greenhouse & Lever APIs and displays filtered results in Streamlit.",

    image: "assets/InternshipTracker.png",
  },
};

function showProjectStats(projectId) {
  const statsCard = document.querySelector(".project-stats-card");
  if (!statsCard) {
    console.error("Stats card not found in showProjectStats");
    return;
  }

  const data = projectData[projectId];
  if (!data) {
    console.error("No data found for project:", projectId);
    return;
  }

  console.log("Showing stats for:", projectId, data);

  // Update card content with image preview
  statsCard.innerHTML = `
        <div class="project-preview-image-container">
            <img src="${data.image}" alt="${data.title}" class="project-preview-img">
        </div>
        <div class="project-stats-content">
            <h3>${data.title}</h3>
            
            <div class="stat-item">
                <div class="stat-label">Date</div>
                <div class="stat-value">${data.date}</div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Technologies</div>
                <div class="tech-icons">
                    ${data.technologies.map((tech) => `<span class="tech-icon">${tech}</span>`).join("")}
                </div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">About</div>
                <div class="stat-value">${data.description}</div>
            </div>
        </div>
    `;

  // Force reflow before adding visible class
  void statsCard.offsetWidth;

  // Show card
  statsCard.classList.add("visible");
  console.log("Stats card should now be visible");
}

function hideProjectStats() {
  const statsCard = document.querySelector(".project-stats-card");
  if (statsCard) {
    statsCard.classList.remove("visible");
  }
}

// Initialize project previews when DOM is loaded
document.addEventListener("DOMContentLoaded", setupProjectPreviews);

// Also try to run it immediately in case DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupProjectPreviews);
} else {
  setupProjectPreviews();
}

// Project modal functions
function openProject(projectId) {
  const modal = document.getElementById(projectId + "-modal");
  if (!modal) return;

  // Reset all images first
  const allImages = modal.querySelectorAll(".modal-image");
  allImages.forEach((img) => img.classList.remove("active"));

  // Set first image as active immediately
  const firstMedia = modal.querySelector(".modal-image");
  if (firstMedia) {
    firstMedia.classList.add("active");
  }

  // Show modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Update counter
  updateSlideCounter(projectId);
}

function closeProject(projectId) {
  const modal = document.getElementById(projectId + "-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    // Reset all images to inactive
    const images = modal.querySelectorAll(".modal-image");
    images.forEach((img) => img.classList.remove("active"));
  }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("project-modal")) {
    const modalId = e.target.id.replace("-modal", "");
    closeProject(modalId);
  }
});

// Close modal with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".project-modal.active");
    if (activeModal) {
      const modalId = activeModal.id.replace("-modal", "");
      closeProject(modalId);
    }
  }
});

// Carousel navigation
function changeSlide(projectId, direction) {
  const modal = document.getElementById(projectId + "-modal");
  const images = modal.querySelectorAll(".modal-image");
  let currentIndex = 0;

  // Find current active slide
  images.forEach((img, idx) => {
    if (img.classList.contains("active")) {
      currentIndex = idx;
    }
  });

  // Remove active class from current
  images[currentIndex].classList.remove("active");

  // Calculate new index with wrapping
  currentIndex = (currentIndex + direction + images.length) % images.length;

  // Add active class to new slide
  images[currentIndex].classList.add("active");

  // Update counter
  updateSlideCounter(projectId);
}

function updateSlideCounter(projectId) {
  const modal = document.getElementById(projectId + "-modal");
  const images = modal.querySelectorAll(".modal-image");
  const counter = modal.querySelector(".current-slide");
  const total = modal.querySelector(".total-slides");

  if (counter && total) {
    let currentIndex = 0;
    images.forEach((img, idx) => {
      if (img.classList.contains("active")) {
        currentIndex = idx;
      }
    });

    counter.textContent = currentIndex + 1;
    total.textContent = images.length;
  }
}

// Cursor trail effect
const trailCount = 12;
const trails = [];

// Create trail elements
for (let i = 0; i < trailCount; i++) {
  const trail = document.createElement("div");
  trail.className = "cursor-trail";
  document.body.appendChild(trail);
  trails.push({
    element: trail,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateTrails() {
  let prevX = mouseX;
  let prevY = mouseY;

  trails.forEach((trail, index) => {
    // Smooth follow with delay
    const delay = (index + 1) * 0.08;
    trail.targetX = prevX;
    trail.targetY = prevY;

    trail.x += (trail.targetX - trail.x) * (1 - delay);
    trail.y += (trail.targetY - trail.y) * (1 - delay);

    trail.element.style.left = trail.x + "px";
    trail.element.style.top = trail.y + "px";

    // Fade out trailing dots
    const opacity = 0.4 - (index / trailCount) * 0.35;
    trail.element.style.opacity = opacity;

    // Scale down trailing dots
    const scale = 1 - (index / trailCount) * 0.5;
    trail.element.style.transform = `scale(${scale})`;

    prevX = trail.x;
    prevY = trail.y;
  });

  requestAnimationFrame(animateTrails);
}

animateTrails();

// Profile photo carousel
const profilePhotos = [
  "assets/Me2.jpeg",
  "assets/face.jpg",
  "assets/surfing.jpeg",
  "assets/italy.jpeg",
  "assets/whistler.jpeg",
  "assets/snowboard.jpeg",
  "assets/littleme.jpeg"
];

let currentProfileIndex = 0;
let profileCarouselInterval = null;

function initProfileCarousel() {
  const container = document.querySelector(".profile-pics-container");
  if (!container) return;

  // Create image elements for each photo
  profilePhotos.forEach((photo, index) => {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = "Laird Scabar";
    img.className = "profile-pic";
    if (index === 0) {
      img.classList.add("active");
    }
    container.appendChild(img);
  });

  // Create navigation dots
  const nav = document.querySelector(".profile-nav");
  if (nav) {
    profilePhotos.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "profile-dot";
      if (index === 0) {
        dot.classList.add("active");
      }
      dot.addEventListener("click", () => goToProfileSlide(index));
      nav.appendChild(dot);
    });
  }

  // Auto-rotate every 4 seconds
  startProfileCarousel();
}

function goToProfileSlide(index) {
  const pics = document.querySelectorAll(".profile-pic");
  const dots = document.querySelectorAll(".profile-dot");

  // Remove active class from all
  pics.forEach((pic) => pic.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  // Add active to selected
  pics[index].classList.add("active");
  dots[index].classList.add("active");

  currentProfileIndex = index;
}

function startProfileCarousel() {
  profileCarouselInterval = setInterval(() => {
    currentProfileIndex = (currentProfileIndex + 1) % profilePhotos.length;
    goToProfileSlide(currentProfileIndex);
  }, 4000); // Change photo every 4 seconds
}

function stopProfileCarousel() {
  if (profileCarouselInterval) {
    clearInterval(profileCarouselInterval);
  }
}

// Pause carousel on hover
document.addEventListener("DOMContentLoaded", () => {
  const profileCard = document.querySelector(".profile-card");
  if (profileCard) {
    profileCard.addEventListener("mouseenter", stopProfileCarousel);
    profileCard.addEventListener("mouseleave", startProfileCarousel);
  }

  // Initialize carousel
  initProfileCarousel();
});
