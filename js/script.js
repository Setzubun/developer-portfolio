import { initTypedHero } from "./utils.js";
/* ============================================================
   PORTFOLIO SCRIPT
   Handles: jump-nav scroll-spy (formerly tab switching), hero
   typed effect, scroll reveals, sliding nav indicator, and the
   Formspree contact submission.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  await Promise.all([
    loadProfile(),
    loadSkills(),
    loadExperience(),
    loadProjects()
  ])

  initTypedHero("whoami");
  initSectionNav();
  initReveal();
  initContactForm();
  initFooterYear();
});

async function loadProfile() {
  try {
    const response = await fetch('data/profile.json');

    // Safely handle missing files or bad responses
    if (!response.ok) {
      throw new Error(`Failed to load profile.json: ${response.status}`);
    }

    const data = await response.json();

    renderFeaturedStack(data);
    renderResume(data);

    // DOM updates
    const firstNameEl = document.getElementById('first-name');
    const lastNameEl = document.getElementById('last-name');
    const taglineEl = document.getElementById('hero-tagline');
    const footerNameEl = document.getElementById('footer-name');
    const currentRoleEl = document.getElementById('current-role');

    const aboutMeEl = document.getElementById('about-me-container');

    const educationEl = document.getElementById('education');
    const distinctionEl = document.getElementById('distinction');
    const locationEl = document.getElementById('location')
    const statusEl = document.getElementById('status')

    if (firstNameEl) firstNameEl.textContent = data.firstName || '';
    if (lastNameEl) lastNameEl.textContent = data.lastName || '';
    if (taglineEl) taglineEl.textContent = data.tagline || '';
    if (currentRoleEl) currentRoleEl.textContent = data.currentRole || '';

    if (aboutMeEl && data.aboutMe) {
      // Clear out any placeholder content first
      aboutMeEl.innerHTML = '';

      // Split the long string by double-newlines into an array of paragraphs
      const paragraphs = data.aboutMe.split('\n\n');

      // Loop through and create a <p> element for each chunk of text
      paragraphs.forEach(text => {
        if (text.trim() !== '') { // Skip empty blocks
          const p = document.createElement('p');
          p.textContent = text;
          aboutMeEl.appendChild(p);
        }
      });
    }

    if (educationEl) educationEl.textContent = data.education || '';
    if (distinctionEl) distinctionEl.textContent = data.distinction || '';
    if (locationEl) locationEl.textContent = data.location || '';
    if (statusEl) statusEl.textContent = data.status || '';

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

async function loadProjects() {

  try {

    const response =
        await fetch(
            "data/project-index.json"
        );

    if (!response.ok) {
      throw new Error(
          `Failed to load project-index.json`
      );
    }

    const projects =
        await response.json();

    renderFeaturedProjects(projects);

  } catch (err) {

    console.error(
        "Failed to load projects",
        err
    );

  }
}

async function loadSkills() {

  try {

    const response =
        await fetch(
            "data/skills.json"
        );

    if (!response.ok) {
      throw new Error(
          `Failed to load skills.json`
      );
    }

    const skills =
        await response.json();

    renderSkills(skills);

  } catch (err) {

    console.error(
        "Failed to load skills",
        err
    );

  }
}


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

/* ----------------------------------------------------------
    Jump nav (formerly tab switching)

    All four sections (summary/skills/projects/experience) are
    always visible now, stacked in one continuous scroll — like
    project-details.html. Clicking a nav button scrolls to the
    matching section (offset by that section's scroll-margin-top
    in CSS, so it lands below the sticky topbar + nav rather than
    underneath them). Which button is "active" is driven by
    scroll position via IntersectionObserver, the same technique
    project-details.js uses for its on-this-page nav.
---------------------------------------------------------- */

function initSectionNav() {

  const tabBtns =
      Array.from(document.querySelectorAll(".tab-btn"));

  const indicator =
      document.querySelector(".tab-indicator");

  if (!tabBtns.length) return;

  const sections = tabBtns
      .map(btn => document.getElementById(btn.dataset.tab))
      .filter(Boolean);

  function moveIndicator(btn) {
    if (!indicator || !btn) return;
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  }

  function setActiveTab(tabName) {
    tabBtns.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-current", String(isActive));
      if (isActive) moveIndicator(btn);
    });
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.tab);
      if (!target) return;

      // scroll-margin-top on .panel (see pages/index.css) handles
      // the sticky-header offset, so a plain scrollIntoView is
      // enough here.
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (sections.length && "IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, {
      // A section counts as "current" once it's roughly centred in
      // the viewport, rather than only at the exact instant its top
      // edge crosses the very top of the screen.
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    });

    sections.forEach((section) => observer.observe(section));
  }

  // Set the initial indicator position once layout is ready, and
  // keep it aligned on resize (button widths can change at
  // breakpoints).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const activeBtn = document.querySelector(".tab-btn.active");
      moveIndicator(activeBtn);
    });
  });

  window.addEventListener("resize", () => {
    const activeBtn = document.querySelector(".tab-btn.active");
    moveIndicator(activeBtn);
  });
}


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


function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


function renderResume(profile) {

  const resumeButton =
      document.querySelector(".btn-solid");

  if (!resumeButton) return;

  resumeButton.href =
      `assets/resume/${profile.resume}`;
}


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


function renderFeaturedProjects(projectIndex) {

  const container =
      document.getElementById(
          "featured-projects"
      );

  if (!container) return;

  const featured =
      projectIndex.featuredProjects
          .map(id =>
              projectIndex.projects.find(
                  project =>
                      project.id === id
              )
          )
          .filter(Boolean);

  container.innerHTML =
      featured
          .map(project => createProjectCard(project))
          .join("");
}


function renderSkills(skills) {

  const container =
      document.getElementById(
          "skills-container"
      );

  if (!container) return;

  container.innerHTML =
      Object.entries(skills)
          .map(
              ([category, items]) => `
                <div class="glass-card reveal skill-group">

                  <h3>${category}</h3>

                  <div class="chip-row">
                    ${items
                  .map(
                      skill =>
                          `<span class="chip">${skill}</span>`
                  )
                  .join("")}
                  </div>

                </div>
              `
          )
          .join("");

  initReveal();
}


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
        ${project.tagline}
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