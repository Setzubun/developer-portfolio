/* ============================================================
   PROJECTS PAGE SCRIPT (projects.html only)

   index.html's script.js stays focused on the homepage (tabs,
   hero, contact form). This file owns everything specific to
   the all-projects listing page:
     - fetching data/project-index.json
     - rendering a card for every project (not just featured)
     - filling in the shared topbar/footer from data/profile.json

   ============================================================ */

/* ---- FUTURE WORK convention ------------------------------------------
   Cards link to a single detail-page template:
       project.html?id=<project-id>
   which will fetch projects/<id>/project-details.json itself and render the
   full case-study (overview, problem, solution, gallery, etc.).

   If you decide to generate a static page per project instead
   (projects/<id>/index.html), this is the only line to change. */
const PROJECT_DETAIL_URL = (id) => `project.html?id=${encodeURIComponent(id)}`;

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([loadHeaderAndFooter(), loadAllProjects()]);
    initFooterYear();
});

/* ---- Topbar + footer (lightweight subset of script.js's loadProfile) - */
async function loadHeaderAndFooter() {
    try {
        const res = await fetch("data/profile.json");
        if (!res.ok) throw new Error(`Failed to load profile.json: ${res.status}`);
        const data = await res.json();

        if (data.githubUrl) {
            document.querySelectorAll(".js-github-link").forEach((el) => {
                el.href = data.githubUrl.trim();
            });
        }
        if (data.linkedinUrl) {
            document.querySelectorAll(".js-linkedin-link").forEach((el) => {
                el.href = data.linkedinUrl.trim();
            });
        }
        if (data.email) {
            const email = data.email.trim();
            document.querySelectorAll(".js-email-link").forEach((el) => {
                el.href = `mailto:${email}`;
            });
        }

        const footerNameEl = document.getElementById("footer-name");
        if (footerNameEl) {
            const first = data.firstName || "";
            const last = data.lastName || "";
            footerNameEl.textContent = `${first} ${last}`.trim();
        }
    } catch (err) {
        console.error("[projects.js] Could not load profile.json for header/footer:", err);
    }
}

/* ---- All-projects grid ------------------------------------------------- */
async function loadAllProjects() {
    const grid = document.getElementById("all-projects-grid");
    if (!grid) return;

    try {
        const res = await fetch("data/project-index.json");
        if (!res.ok) throw new Error(`Failed to load project-index.json: ${res.status}`);
        const index = await res.json();
        const projects = sortByRecency(index.projects || []);
        renderAllProjects(grid, projects);
    } catch (err) {
        console.error("[projects.js] Failed to load projects:", err);
        grid.dataset.loading = "false";
        grid.innerHTML = "";
        const error = document.createElement("p");
        error.className = "projects-empty";
        error.textContent = "Couldn't load projects right now — please refresh, or check the console for details.";
        grid.appendChild(error);
    }
}

function sortValue(project) {
    if (project.current || project.status === "In Progress") return Infinity;
    const ref = project.endDate || project.startDate;
    if (!ref) return -Infinity;
    const [y, m] = ref.split("-").map(Number);
    return y * 12 + (m || 0);
}

function sortByRecency(projects) {
    return [...projects].sort((a, b) => sortValue(b) - sortValue(a));
}

function formatMonth(yyyyMm) {
    if (!yyyyMm) return "";
    const [y, m] = yyyyMm.split("-").map(Number);
    return new Date(y, (m || 1) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function dateLabel(project) {
    const start = formatMonth(project.startDate);
    const end = project.current || project.status === "In Progress" ? "Present" : formatMonth(project.endDate);
    if (start && end) return `${start} – ${end}`;
    return start || end || "";
}

function renderAllProjects(grid, projects) {
    grid.dataset.loading = "false";
    grid.innerHTML = "";

    if (projects.length === 0) {
        const empty = document.createElement("p");
        empty.className = "projects-empty";
        empty.textContent = "No projects yet — add some to data/project-index.json.";
        grid.appendChild(empty);
        return;
    }

    projects.forEach((project) => grid.appendChild(buildProjectCard(project)));

    // simple reveal-on-load for this page (no scroll observer needed —
    // index.html's tab-switching reveal logic doesn't apply here)
    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
}

function buildProjectCard(project) {
    const card = document.createElement("a");
    card.className = "glass-card project-card reveal";
    card.href = PROJECT_DETAIL_URL(project.id);
    card.setAttribute("aria-label", `View details for ${project.title}`);

    card.appendChild(buildCoverEl(project));

    const body = document.createElement("div");
    body.className = "project-body";

    // ---------- Header ----------
    const header = document.createElement("div");
    header.className = "project-head";

    const titleGroup = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = project.title;

    const period = document.createElement("div");
    period.className = "project-period";
    period.textContent = dateLabel(project);

    titleGroup.append(title, period);

    header.appendChild(titleGroup);

    body.appendChild(header);

    // ---------- Description ----------
    const tagline = document.createElement("p");
    tagline.className = "project-tagline";
    tagline.textContent = project.tagline || "";
    body.appendChild(tagline);

    // ---------- Technologies ----------
    body.appendChild(buildTagRow((project.technologies || [])
        ));

    // ---------- Footer ----------
    const footer = document.createElement("div");
    footer.className = "project-footer";

    const view = document.createElement("span");
    view.className = "project-view";
    view.textContent = "View Project →";

    footer.appendChild(view);

    body.appendChild(footer);

    card.appendChild(body);

    return card;
}

function buildCoverEl(project) {
    const cover = document.createElement("div");
    cover.className = "project-cover";

    if (project.thumbnail) {
        const img = document.createElement("img");
        img.className = "project-thumbnail";

        img.src = project.thumbnail; // already a root-relative path from project-index.json
        img.alt = `${project.title} thumbnail`;
        img.loading = "lazy";

        img.onerror = () => {
            cover.innerHTML = "";
            cover.appendChild(buildPlaceholderEl(project));
        };
        cover.appendChild(img);
    } else {
        cover.appendChild(buildPlaceholderEl(project));
    }

    return cover;
}

function buildPlaceholderEl(project) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = (project.title || "?").trim().charAt(0).toUpperCase();
    return placeholder;
}

function buildTagRow(technologies = []) {
    const row = document.createElement("div");
    row.className = "chip-row";

    const MAX_VISIBLE = 5;

    technologies
        .slice(0, MAX_VISIBLE)
        .forEach((tech) => {
            const chip = document.createElement("span");
            chip.className = "chip chip-sm";
            chip.textContent = tech;
            row.appendChild(chip);
        });

    const remaining = technologies.length - MAX_VISIBLE;

    if (remaining > 0) {
        const moreChip = document.createElement("span");
        moreChip.className = "chip chip-sm chip-more";
        moreChip.textContent = `+${remaining}`;
        row.appendChild(moreChip);
    }

    return row;
}

function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}