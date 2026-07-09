import { initTypedHero } from "./utils.js";
/* ============================================================
   PORTFOLIO SCRIPT
   Handles: jump-nav scroll-spy (formerly tab switching), hero
   typed effect, scroll reveals, sliding nav indicator, and the
   Formspree contact submission.
   ============================================================ */

const PROJECT_DETAIL_URL = (id) => `project-details.html?id=${encodeURIComponent(id)}`;

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
    const response = await fetch("data/profile.json");

    if (!response.ok) {
      throw new Error(`Failed to load profile.json: ${response.status}`);
    }

    const profile = await response.json();

    renderHero(profile);
    renderAboutMe(profile);
    renderProfileInfo(profile);
    renderFooter(profile);
    renderSocialLinks(profile);

    renderFeaturedStack(profile);
    renderResume(profile);

  } catch (error) {
    console.error("Profile data could not be loaded:", error);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value || "";
  }
}

function renderHero(profile) {
  setText("first-name", profile.firstName);
  setText("last-name", profile.lastName);
  setText("hero-tagline", profile.tagline);
  setText("current-role", profile.currentRole);
}

function renderAboutMe(profile) {
  const container = document.getElementById("about-me-container");

  if (!container || !profile.aboutMe) return;

  container.replaceChildren();

  profile.aboutMe
      .split("\n\n")
      .filter(text => text.trim() !== "")
      .forEach(text => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        container.appendChild(paragraph);
      });
}

function renderProfileInfo(profile) {
  setText("education", profile.education);
  setText("distinction", profile.distinction);
  setText("location", profile.location);
  setText("status", profile.status);
}

function renderFooter(profile) {
  const footerName = document.getElementById("footer-name");

  if (!footerName) return;

  const first = profile.firstName || "";
  const last = profile.lastName || "";

  footerName.textContent = `${first} ${last}`.trim();
}

function renderSocialLinks(profile) {

  if (profile.githubUrl) {
    document.querySelectorAll(".js-github-link").forEach(link => {
      link.href = profile.githubUrl.trim();
    });
  }

  if (profile.linkedinUrl) {
    document.querySelectorAll(".js-linkedin-link").forEach(link => {
      link.href = profile.linkedinUrl.trim();
    });
  }

  if (profile.email) {
    const email = profile.email.trim();

    document.querySelectorAll(".js-email-link").forEach(link => {
      link.href = `mailto:${email}`;
    });

    document.querySelectorAll(".js-email-text").forEach(text => {
      text.textContent = email;
    });
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

    container.replaceChildren();

    experiences.forEach(exp => {
      container.appendChild(createExperienceCard(exp));
    });

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
      document.getElementById("resume-btn");

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
  const container = document.getElementById("featured-projects");

  if (!container) return;

  const featured = projectIndex.featuredProjects
      .map(id =>
          projectIndex.projects.find(project => project.id === id)
      )
      .filter(Boolean);

  container.replaceChildren(); // Clears existing content

  featured.forEach(project => {
    container.appendChild(createProjectCard(project));
  });
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
  const card = document.createElement("a");
  card.className = "glass-card project-card reveal";
  card.href = PROJECT_DETAIL_URL(project.id);
  card.setAttribute("aria-label", `View details for ${project.title}`);

  card.innerHTML = `
        <span class="project-period">
            ${project.startDate} - ${project.endDate}
        </span>

        <h3>${project.title}</h3>

        <p>
            ${project.tagline}
        </p>

        <div class="chip-row">
            ${project.technologies
      .map(
          tech => `<span class="chip chip-sm">${tech}</span>`
      )
      .join("")}
        </div>
    `;

  return card;
}

function createExperienceCard(exp) {
  const card = document.createElement("div");
  card.className = "timeline-entry reveal";

  const descriptionHtml = (exp.description || [])
      .map(item => `<li>${item}</li>`)
      .join("");

  card.innerHTML = `
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
    `;

  return card;
}