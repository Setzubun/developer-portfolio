/* ============================================================
   PORTFOLIO SCRIPT
   Handles: tab switching, hero typed effect, scroll reveals,
   sliding tab indicator, and the Formspree contact submission.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  await loadProfile();
  await loadPortfolioData();
  await loadExperience();

  initTypedHero();
  initTabs();
  initReveal();
  initContactForm();
  initFooterYear();

  initParticles();
});

/* ---- Typed "whoami" hero line ------------------------------------ */
function initTypedHero() {
  const el = document.getElementById("typed-text");
  if (!el) return;

  // ✏️ EDIT: change this line to whatever one-liner you want typed out
  const message = "whoami";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    el.textContent = message;
    return;
  }

  let i = 0;
  function type() {
    if (i <= message.length) {
      el.textContent = message.slice(0, i);
      i++;
      setTimeout(type, 90);
    }
  }
  type();
}

async function loadProfile() {
  try {
    const response = await fetch('data/profile.json');

    // Safely handle missing files or bad responses
    if (!response.ok) {
      throw new Error(`Failed to load profile.json: ${response.status}`);
    }

    const data = await response.json();

    // DOM updates
    const firstNameEl = document.getElementById('first-name');
    const lastNameEl = document.getElementById('last-name');
    const taglineEl = document.getElementById('hero-tagline');
    const footerNameEl = document.getElementById('footer-name');

    if (firstNameEl) firstNameEl.textContent = data.firstName || '';
    if (lastNameEl) lastNameEl.textContent = data.lastName || '';
    if (taglineEl) taglineEl.textContent = data.tagline || '';

    if (footerNameEl) {
      // Use fallback logic to avoid printing "undefined"
      const first = data.firstName || '';
      const last = data.lastName || '';
      footerNameEl.textContent = `${first} ${last}`.trim();
    }

    // Social Links
    if (data.githubUrl) {
      document.querySelectorAll('.js-github-link').forEach(el => {
        el.href = data.githubUrl.trim();
      });
    }

    if (data.linkedinUrl) {
      document.querySelectorAll('.js-linkedin-link').forEach(el => {
        el.href = data.linkedinUrl.trim();
      });
    }

    if (data.email) {
      const cleanEmail = data.email.trim();

      // Update the href attribute for all email links (Top Bar + Contact Section)
      document.querySelectorAll('.js-email-link').forEach(el => {
        el.href = `mailto:${cleanEmail}`;
      });

      // Update the actual visible text only where specified (Contact Section)
      document.querySelectorAll('.js-email-text').forEach(el => {
        el.textContent = cleanEmail;
      });
    }

  } catch (error) {
    console.error("Profile data could not be loaded:", error);
    // Optional: You could set default fallback text here if the fetch fails
  }
}

/* ---- Load Portfolio Data ------------------------------------ */
async function loadPortfolioData() {

  const [
    profile,
    skills,
    experience,
    projects
  ] = await Promise.all([
    fetch("data/profile.json").then(r => r.json()),
    fetch("data/skills.json").then(r => r.json()),
    fetch("data/experience.json").then(r => r.json()),
    fetch("data/projects.json").then(r => r.json())
  ]);

  renderFeaturedStack(profile);
  renderFeaturedProjects(projects);
  renderResume(profile);
}

/* ---- Load Experience Data ------------------------------------ */
async function loadExperience() {
  const container =
      document.getElementById("experience-timeline");

  if (!container) return;

  try {
    const response =
        await fetch("data/experience.json");

    const experiences =
        await response.json();

    container.innerHTML =
        experiences.map(createExperienceCard).join("");

    initReveal();
  } catch (err) {
    console.error(
        "Failed to load experience data",
        err
    );
  }
}

/* ---- Tab switching -------------------------------------------------- */
function initTabs() {
  const tabBtns = Array.from(document.querySelectorAll(".tab-btn"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const indicator = document.querySelector(".tab-indicator");
  const tabbar = document.getElementById("tabbar");

  function moveIndicator(btn) {
    if (!indicator || !btn) return;
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  }

  function activateTab(tabName, { scroll = false } = {}) {
    tabBtns.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      if (isActive) moveIndicator(btn);
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.hidden = !isActive;
      panel.classList.toggle("active", isActive);
      if (isActive) {
        // re-trigger reveal animation for cards inside the panel
        panel.querySelectorAll(".reveal").forEach((card) => {
          card.classList.remove("in-view");
          requestAnimationFrame(() => card.classList.add("in-view"));
        });
      }
    });

    const tabPanels = document.querySelector(".tab-panels");

    if (tabPanels) {
      const y =
          tabPanels.getBoundingClientRect().top +
          window.pageYOffset -
          450;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  // hero "View Projects" button jumps to a specific tab
  document.querySelectorAll("[data-tab-jump]").forEach((el) => {
    el.addEventListener("click", () => activateTab(el.dataset.tabJump, { scroll: true }));
  });

  // set initial indicator position once layout is ready
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const activeBtn =
          document.querySelector(".tab-btn.active");

      moveIndicator(activeBtn);
    });
  });
  window.addEventListener("resize", () => {
    const activeBtn = document.querySelector(".tab-btn.active");
    moveIndicator(activeBtn);
  });

  activateTab("summary");

  requestAnimationFrame(() => {
    const activeBtn =
        document.querySelector(".tab-btn.active");

    moveIndicator(activeBtn);
  });
}

/* ---- Scroll-triggered reveal animations ----------------------------- */
function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((t) => observer.observe(t));
}

/* ---- Contact form (Formspree) --------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "form-status";
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        status.textContent = "Thanks! Your message has been sent.";
        status.classList.add("success");
        form.reset();
      } else {
        status.textContent = "Something went wrong. Please email me directly instead.";
        status.classList.add("error");
      }
    } catch (err) {
      status.textContent = "Network error. Please email me directly instead.";
      status.classList.add("error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

/* ---- Footer year ------------------------------------------------------ */
function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---- Resume ------------------------------------ */
function renderResume(profile) {

  const resumeButton =
      document.querySelector(".btn-solid");

  if (!resumeButton) return;

  resumeButton.href =
      `assets/resume/${profile.resume}`;
}

/* ---- Featured Stack ------------------------------------ */
function renderFeaturedStack(profile) {

  const container =
      document.getElementById(
          "featured-stack-container"
      );

  if (!container) return;

  container.innerHTML =
      profile.featuredTechStack
          .map(
              tech =>
                  `<span class="chip">${tech}</span>`
          )
          .join("");
}

/* ---- Featured Projects  ------------------------------------ */
function renderFeaturedProjects(projects) {

  const container =
      document.getElementById(
          "featured-projects"
      );

  if (!container) return;

  const featured =
      projects
          .filter(p => p.featured)
          .slice(0, 4);

  container.innerHTML =
      featured
          .map(project => createProjectCard(project))
          .join("");
}

/* ---- Project Cards ------------------------------------ */
function createProjectCard(project) {

  return `
  <div class="glass-card project-card reveal">

      <span class="project-period">
        ${project.startDate}
        -
        ${project.endDate}
      </span>

      <h3>${project.title}</h3>

      <p>
        ${project.shortDescription}
      </p>

      <div class="chip-row">

        ${project.technologies
      .map(
          tech =>
              `<span class="chip chip-sm">${tech}</span>`
      )
      .join("")}

      </div>

  </div>
  `;
}

/* ---- Experience Cards ------------------------------------ */
function createExperienceCard(exp) {

  const descriptionHtml =
      (exp.description || [])
          .map(item => `<li>${item}</li>`)
          .join("");

  return `
    <div class="timeline-entry reveal">
      <div class="timeline-node"></div>

      <div class="glass-card">

        <span class="timeline-date">
          ${exp.startDate} — ${exp.endDate}
        </span>

        <h3>${exp.title}</h3>

        <p class="timeline-org">
          ${exp.institution}
        </p>

        <ul class="timeline-list">
          ${descriptionHtml}
        </ul>

      </div>
    </div>
  `;
}

/* ---- Particle background ------------------------------------ */
function initParticles() {

  const canvas =
      document.getElementById(
          "particle-background"
      );

  if (!canvas) return;

  const ctx =
      canvas.getContext("2d");

  const particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();

  window.addEventListener(
      "resize",
      resize
  );

  for (let i = 0; i < 150; i++) {

    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: 0.2 + Math.random() * 0.4
    });

  }

  function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    particles.forEach(p => {

      ctx.fillStyle =
          "rgba(255,255,255,0.25)";

      ctx.beginPath();

      ctx.arc(
          p.x,
          p.y,
          p.size,
          0,
          Math.PI * 2
      );

      ctx.fill();

      p.y += p.speed;

      if (p.y > canvas.height) {
        p.y = 0;
      }

    });

    requestAnimationFrame(
        animate
    );
  }

  animate();
}

