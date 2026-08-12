/* ==========================================================================
   Laird Scabar — portfolio
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------ *
   * Theme
   * ------------------------------------------------------------------ */

  function initTheme() {
    // The inline head script sets .pre-dark to avoid a flash; mirror it onto
    // <body> so the toggle has a single class to work with.
    if (document.documentElement.classList.contains("pre-dark")) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.remove("pre-dark");
    }

    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  /* ------------------------------------------------------------------ *
   * Navigation
   * ------------------------------------------------------------------ */

  function initNav() {
    const topbar = document.getElementById("topbar");
    const navToggle = document.getElementById("nav-toggle");
    const topnav = document.getElementById("topnav");

    if (navToggle && topnav) {
      navToggle.addEventListener("click", () => {
        const open = topnav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });

      topnav.addEventListener("click", (e) => {
        if (!e.target.closest("a")) return;
        topnav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }

    if (topbar) {
      const onScroll = () => topbar.classList.toggle("is-stuck", window.scrollY > 8);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll("#topnav a")).filter((a) =>
      (a.getAttribute("href") || "").startsWith("#")
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            )
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------ *
   * Hero typing effect
   * ------------------------------------------------------------------ */

  function initTyping() {
    const el = document.getElementById("typing-text");
    if (!el) return;

    const hello = "Hey!";
    const headline = "I'm Laird :)";

    if (prefersReducedMotion) {
      el.textContent = headline;
      return;
    }

    let index = 0;
    let phase = "typing-hello";

    function step() {
      if (phase === "typing-hello") {
        if (index < hello.length) {
          el.textContent += hello.charAt(index);
          index++;
          setTimeout(step, 80);
        } else {
          phase = "pause";
          setTimeout(step, 650);
        }
      } else if (phase === "pause") {
        phase = "deleting";
        index = hello.length;
        setTimeout(step, 100);
      } else if (phase === "deleting") {
        if (index > 0) {
          el.textContent = el.textContent.slice(0, -1);
          index--;
          setTimeout(step, 50);
        } else {
          phase = "typing-headline";
          index = 0;
          setTimeout(step, 320);
        }
      } else if (phase === "typing-headline" && index < headline.length) {
        el.textContent += headline.charAt(index);
        index++;
        setTimeout(step, 75);
      }
    }

    setTimeout(step, 450);
  }

  /* ------------------------------------------------------------------ *
   * Skills carousel — continuous drift + arrows + drag
   * ------------------------------------------------------------------ */

  function initLogosCarousel() {
    const carousel = document.getElementById("logos-carousel");
    if (!carousel) return;

    const track = carousel.querySelector(".logos-track");
    if (!track || track.querySelector(".logos-group")) return;

    // Wrap the cards in a group and clone it, so scrolling past the halfway
    // point can be reset invisibly for an endless loop.
    const group = document.createElement("div");
    group.className = "logos-group";
    while (track.firstChild) group.appendChild(track.firstChild);
    track.appendChild(group);

    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    track.appendChild(clone);

    function normalize() {
      const half = track.scrollWidth / 2;
      if (half > 0 && carousel.scrollLeft >= half) carousel.scrollLeft -= half;
    }

    let paused = false;
    let resumeTimer = null;

    function holdFor(ms) {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, ms);
    }

    carousel.addEventListener("mouseenter", () => {
      paused = true;
    });
    carousel.addEventListener("mouseleave", () => {
      paused = false;
    });
    carousel.addEventListener("focusin", () => holdFor(2500));
    carousel.addEventListener("pointerdown", () => holdFor(2500));
    carousel.addEventListener("touchstart", () => holdFor(2500), { passive: true });
    carousel.addEventListener("scroll", normalize, { passive: true });

    // Measure rather than hardcode — the card width changes with the viewport.
    function itemStep() {
      const card = track.querySelector(".logo-card");
      if (!card) return 164;
      const gap = parseFloat(getComputedStyle(card.parentElement).columnGap) || 14;
      return card.getBoundingClientRect().width + gap;
    }

    document.querySelectorAll("[data-logos-dir]").forEach((btn) => {
      btn.addEventListener("click", () => {
        holdFor(2500);
        carousel.scrollBy({
          left: Number(btn.dataset.logosDir) * itemStep() * 2,
          behavior: "smooth",
        });
      });
    });

    if (prefersReducedMotion) return;

    let last = performance.now();
    const SPEED = 24; // px per second

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused) {
        carousel.scrollLeft += SPEED * dt;
        normalize();
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ *
   * Project media carousels
   * ------------------------------------------------------------------ */

  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
      if (!slides.length) return;

      const current = carousel.querySelector(".current-slide");
      const total = carousel.querySelector(".total-slides");
      if (total) total.textContent = String(slides.length);

      function show(index) {
        slides.forEach((slide) => slide.classList.remove("active"));
        slides[index].classList.add("active");
        if (current) current.textContent = String(index + 1);
        carousel.querySelectorAll("video").forEach((v) => v.pause());
        // Let the 3D viewer know it may have become visible or hidden.
        document.dispatchEvent(new Event("cad:refresh"));
      }

      function move(direction) {
        let index = slides.findIndex((s) => s.classList.contains("active"));
        if (index < 0) index = 0;
        show((index + direction + slides.length) % slides.length);
      }

      carousel.querySelectorAll("[data-carousel-dir]").forEach((btn) => {
        btn.addEventListener("click", () => move(Number(btn.dataset.carouselDir)));
      });

      // Scoped to the carousel rather than the document: arrow keys are how
      // people scroll a long page, so hijacking them globally is hostile.
      carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
      });

      // Kick the CAD viewer once on load in case it starts on the first slide.
      document.dispatchEvent(new Event("cad:refresh"));
    });
  }

  /* ------------------------------------------------------------------ *
   * Deep dive toggle
   * ------------------------------------------------------------------ */

  function initDeepDive() {
    const toggle = document.getElementById("deep-toggle");
    const deepDive = document.getElementById("deep-dive");
    const simple = document.getElementById("simple-section");
    const label = document.getElementById("deep-toggle-label");
    if (!toggle || !deepDive) return;

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-pressed") !== "true";

      toggle.setAttribute("aria-pressed", String(open));
      deepDive.classList.toggle("is-open", open);
      if (simple) simple.classList.toggle("is-collapsed", open);
      if (label) label.textContent = open ? "Deep dive on" : "Deep dive off";

      // Keep the switch itself in view — collapsing the quick explanation
      // removes a chunk of page above the fold and would otherwise jump.
      const panel = document.getElementById("project-mode");
      if (panel) {
        panel.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    let anyRevealed = false;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          anyRevealed = true;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    items.forEach((item) => observer.observe(item));

    // Failsafe: if the observer never reports anything the content would stay
    // invisible forever, so show it all rather than ship a blank page.
    setTimeout(() => {
      if (anyRevealed) return;
      observer.disconnect();
      items.forEach((item) => item.classList.add("is-visible"));
    }, 1500);
  }

  /* ------------------------------------------------------------------ *
   * Photo lightbox
   * ------------------------------------------------------------------ */

  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-img");
    const caption = document.getElementById("lightbox-caption");
    if (!lightbox || !image) return;

    let group = [];
    let position = 0;

    function render() {
      const item = group[position];
      if (!item) return;
      const img = item.querySelector("img");
      const cap = item.querySelector(".cap");
      image.src = img.src;
      image.alt = img.alt || "";
      // Only an explicit .cap becomes a visible caption — alt stays for screen
      // readers but is never shown, so caption-free photos stay caption-free.
      if (caption) caption.textContent = cap ? cap.textContent : "";
    }

    function open(item) {
      const gallery = item.closest("[data-gallery]");
      group = gallery
        ? Array.from(gallery.querySelectorAll(".photo")).filter(
            (el) => !el.classList.contains("img-missing")
          )
        : [item];
      position = Math.max(group.indexOf(item), 0);
      render();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      image.src = "";
    }

    function move(direction) {
      if (group.length < 2) return;
      position = (position + direction + group.length) % group.length;
      render();
    }

    document.addEventListener("click", (e) => {
      const item = e.target.closest("[data-gallery] .photo");
      if (item && !item.classList.contains("img-missing")) return open(item);

      if (e.target.closest("[data-lightbox-close]") || e.target === lightbox) return close();

      const nav = e.target.closest("[data-lightbox-dir]");
      if (nav) move(Number(nav.dataset.lightboxDir));
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
    });
  }

  /* ------------------------------------------------------------------ *
   * Copy email
   * ------------------------------------------------------------------ */

  function initCopyEmail() {
    const button = document.getElementById("copy-email");
    const state = document.getElementById("copy-state");
    if (!button) return;

    const email = button.dataset.email;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
        if (state) {
          state.textContent = "Copied ✓";
          setTimeout(() => {
            state.textContent = "Click to copy";
          }, 1800);
        }
      } catch (err) {
        window.location.href = "mailto:" + email;
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Missing photos — show the wanted filename, not a broken-image icon
   * ------------------------------------------------------------------ */

  function initImageFallbacks() {
    function handle(img) {
      const holder = img.closest(".photo, .logo-badge, .cert-card-mark") || img.parentElement;
      if (!holder) return;
      holder.classList.add("img-missing");
      holder.setAttribute("data-missing", (img.getAttribute("src") || "").split("/").pop());
      img.style.display = "none";
    }

    // The lightbox <img> is intentionally empty until a photo is opened, so it
    // must never be treated as a missing asset.
    Array.from(document.querySelectorAll("img:not(#lightbox-img)"))
      .filter((img) => img.getAttribute("src"))
      .forEach((img) => {
        if (img.complete && img.naturalWidth === 0) handle(img);
        img.addEventListener("error", () => handle(img));
      });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot() {
    initTheme();
    initNav();
    initScrollSpy();
    initTyping();
    initLogosCarousel();
    initCarousels();
    initDeepDive();
    initReveal();
    initLightbox();
    initCopyEmail();
    initImageFallbacks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
