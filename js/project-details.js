import {dateLabel} from "./utils.js";

const PROJECTS_ROOT = "projects";

let galleryImages = [];
let galleryIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
    initialisePage();
    await loadHeaderAndFooter();

    try {
        const projectId = getProjectId();

        console.log(projectId);

        if (!projectId) {
            throw new Error("No project id supplied.");
        }

        const project = await loadProject(projectId);

        renderHero(project);
        renderQuickFacts(project);
        renderOverview(project);
        renderArchitecture(project);

        // Part 2
        renderGallery(project);
        renderContributions(project);
        renderChallenges(project);
        renderMetrics(project);
        renderLearning(project);

        // Part 3 — add-ons
        setupProjectPagination(project.id);
        setupTocObserver();
        hidePageLoader();

    } catch (error) {
        console.error(error);
        hidePageLoader();
        showError(error.message);
    }
});

/* ----------------------------------------------------------
    Initialisation
---------------------------------------------------------- */

function initialisePage() {
    document.getElementById("year").textContent =
        new Date().getFullYear();

    // Static UI chrome that doesn't depend on project data —
    // wired up once, regardless of whether loading the project
    // data succeeds or fails.
    setupLightboxControls();
    setupBackToTop();
}

/* ----------------------------------------------------------
    Header and Footer
---------------------------------------------------------- */
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
        console.error("[project-details.js] Could not load profile.json for header/footer:", err);
    }
}

/* ----------------------------------------------------------
    URL
---------------------------------------------------------- */

function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/* ----------------------------------------------------------
    Data
---------------------------------------------------------- */

async function loadProject(projectId) {

    console.log(getProjectId());

    const path = `${PROJECTS_ROOT}/${projectId}/project-details.json`;

    console.log(path);

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error("Unable to load project.");
    }

    return await response.json();
}

/* ----------------------------------------------------------
    Hero
---------------------------------------------------------- */

function renderHero(project) {

    document.title =
        `${project.title} | Jerry's Portfolio`;

    document.getElementById("project-category").textContent =
        project.category;

    document.getElementById("project-title").textContent =
        project.title;

    document.getElementById("project-tagline").textContent =
        project.tagline;

    const heroImage =
        document.getElementById("project-thumbnail");

    heroImage.src =
        `${PROJECTS_ROOT}/${project.id}/assets/${project.thumbnail}`;

    heroImage.alt =
        project.title;

    renderProjectLinks(project);
    renderStatusBadge(project);
    renderMetaTags(project);
}

function renderProjectLinks(project) {

    const container =
        document.getElementById("project-links");

    container.innerHTML = "";

    if (project.github) {

        container.appendChild(
            createButton(
                "View Source",
                project.github
            )
        );
    }

    if (project.demo) {

        container.appendChild(
            createButton(
                "Live Demo",
                project.demo
            )
        );
    }
}

function createButton(text, url) {

    const a = document.createElement("a");

    a.className = "btn btn-solid";

    a.href = url;

    a.target = "_blank";

    a.rel = "noopener";

    a.textContent = text;

    return a;
}

/* ----------------------------------------------------------
    Status badge (add-on)
---------------------------------------------------------- */

function renderStatusBadge(project) {

    const badge =
        document.getElementById("project-status-badge");

    if (!badge) return;

    if (!project.status) {
        badge.textContent = "";
        badge.removeAttribute("data-status");
        return;
    }

    badge.textContent = project.status;

    // Powers the colour variants defined in project-details.css
    // (e.g. [data-status="in-progress"]).
    badge.dataset.status = project.status
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

/* ----------------------------------------------------------
    Social share meta tags (add-on)
---------------------------------------------------------- */

function renderMetaTags(project) {

    const ogTitle = document.getElementById("og-title");
    const ogDescription = document.getElementById("og-description");
    const ogImage = document.getElementById("og-image");

    const title = `${project.title} | Jerry's Portfolio`;

    if (ogTitle) {
        ogTitle.setAttribute("content", title);
    }

    if (ogDescription) {
        ogDescription.setAttribute(
            "content",
            project.tagline || project.overview || ""
        );
    }

    if (ogImage && project.thumbnail) {
        const imageUrl = new URL(
            `${PROJECTS_ROOT}/${project.id}/assets/${project.thumbnail}`,
            window.location.href
        );
        ogImage.setAttribute("content", imageUrl.href);
    }
}

/* ----------------------------------------------------------
    Quick Facts
---------------------------------------------------------- */

function renderQuickFacts(project) {

    const container =
        document.getElementById("project-facts");

    container.innerHTML = "";

    const facts = [

        {
            label: "Role",
            value: project.role
        },

        {
            label: "Team Size",
            value: project.teamSize
        },

        {
            label: "Duration",
            value: dateLabel(project)
        },

        {
            label: "Status",
            value: project.status
        }

    ];

    facts.forEach(fact => {

        const div =
            document.createElement("div");

        div.className = "fact";

        div.innerHTML = `
            <span class="fact-label">
                ${fact.label}
            </span>

            <span class="fact-value">
                ${fact.value}
            </span>
        `;

        container.appendChild(div);

    });

    renderTechnologies(project.technologies);
}

function renderTechnologies(technologies) {

    const container =
        document.getElementById("project-technologies");

    container.innerHTML = "";

    technologies.forEach(technology => {

        const chip =
            document.createElement("span");

        chip.className = "chip";

        chip.textContent = technology;

        container.appendChild(chip);

    });

}

/* ----------------------------------------------------------
    Overview
---------------------------------------------------------- */

function renderOverview(project) {

    const container =
        document.getElementById("project-overview");

    container.innerHTML = `
        <p>
            ${project.overview}
        </p>
    `;

    const highlights =
        document.createElement("div");

    highlights.className = "overview-highlights";

    highlights.appendChild(
        createOverviewCard("Problem", project.problem)
    );

    highlights.appendChild(
        createOverviewCard("Solution", project.solution)
    );

    container.appendChild(highlights);
}

function createOverviewCard(title, description) {

    const card =
        document.createElement("div");

    card.className = "glass-card overview-card";

    card.innerHTML = `
        <h3>
            ${title}
        </h3>

        <p>
            ${description}
        </p>
    `;

    return card;
}

/* ----------------------------------------------------------
    Architecture
---------------------------------------------------------- */

function renderArchitecture(project) {

    document.getElementById(
        "project-architecture"
    ).textContent = project.architecture;

    renderArchitectureDiagram(project);
}

function renderArchitectureDiagram(project) {

    const img =
        document.getElementById("project-architecture-diagram");

    if (!img) return;

    // Diagram is optional — only show the <img> if the project
    // data actually supplies one.
    if (project.architectureDiagram) {

        img.src =
            `${PROJECTS_ROOT}/${project.id}/assets/${project.architectureDiagram}`;

        img.alt =
            `${project.title} architecture diagram`;

        img.hidden = false;

    } else {

        img.hidden = true;
        img.removeAttribute("src");

    }
}

/* ----------------------------------------------------------
    Error
---------------------------------------------------------- */

function showError(message) {

    document.querySelector(".project-page").innerHTML = `
        <section class="glass-card">

            <h1>Unable to load project</h1>

            <p>${message}</p>

            <a
                class="btn btn-solid"
                href="../projects.html">

                Back to Projects

            </a>

        </section>
    `;
}

/* ----------------------------------------------------------
    Gallery
---------------------------------------------------------- */

function renderGallery(project) {

    const container =
        document.getElementById("project-gallery");

    container.innerHTML = "";

    galleryImages = [];
    galleryIndex = 0;

    if (!project.gallery || project.gallery.length === 0) {

        container.innerHTML =
            "<p>No screenshots available.</p>";

        return;
    }

    galleryImages = project.gallery.map(image => ({
        src: `${PROJECTS_ROOT}/${project.id}/assets/${image}`,
        alt: `${project.title} — ${image}`
    }));

    const viewer = document.createElement("div");
    viewer.className = "project-gallery-viewer";

    const heroImage = document.createElement("img");
    heroImage.className = "project-gallery-image";
    heroImage.src = galleryImages[0].src;
    heroImage.alt = project.title;
    heroImage.style.cursor = "zoom-in";
    heroImage.setAttribute("role", "button");
    heroImage.setAttribute("tabindex", "0");
    heroImage.setAttribute("aria-label", "Open image in full screen");

    // Clicking (or activating via keyboard) the large preview opens
    // the full-screen lightbox at whichever image is currently shown.
    heroImage.addEventListener("click", () => {
        openLightbox(galleryIndex);
    });

    heroImage.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox(galleryIndex);
        }
    });

    viewer.appendChild(heroImage);

    const thumbnails = document.createElement("div");
    thumbnails.className = "project-gallery-thumbnails";

    // Shared by thumbnail clicks and the arrow buttons below, so the
    // preview image, its active thumbnail, and galleryIndex never
    // drift out of sync with each other.
    function setActiveImage(index) {

        galleryIndex = index;

        heroImage.src = galleryImages[index].src;

        thumbnails
            .querySelectorAll(".project-gallery-thumbnail")
            .forEach((thumb, thumbIndex) => {
                thumb.classList.toggle("active", thumbIndex === index);
            });
    }

    project.gallery.forEach((image, index) => {

        const thumb = document.createElement("img");

        thumb.className = "project-gallery-thumbnail";

        thumb.src = galleryImages[index].src;

        thumb.alt = image;

        thumb.loading = "lazy";

        thumb.addEventListener("click", () => {
            setActiveImage(index);
        });

        thumbnails.appendChild(thumb);

    });

    thumbnails.firstChild.classList.add("active");

    // Arrow buttons on the preview itself — only worth showing if
    // there's more than one image to navigate between.
    if (galleryImages.length > 1) {

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "project-gallery-nav project-gallery-nav-prev";
        prevButton.setAttribute("aria-label", "Previous image");
        prevButton.innerHTML = "&#8249;";

        prevButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const newIndex =
                (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
            setActiveImage(newIndex);
        });

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "project-gallery-nav project-gallery-nav-next";
        nextButton.setAttribute("aria-label", "Next image");
        nextButton.innerHTML = "&#8250;";

        nextButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const newIndex =
                (galleryIndex + 1) % galleryImages.length;
            setActiveImage(newIndex);
        });

        viewer.appendChild(prevButton);
        viewer.appendChild(nextButton);
    }

    container.appendChild(viewer);
    container.appendChild(thumbnails);

}

/* ----------------------------------------------------------
    Gallery lightbox (add-on)
---------------------------------------------------------- */

function setupLightboxControls() {

    const dialog =
        document.getElementById("gallery-lightbox");

    if (!dialog) return;

    const closeBtn = dialog.querySelector(".lightbox-close");
    const prevBtn = dialog.querySelector(".lightbox-prev");
    const nextBtn = dialog.querySelector(".lightbox-next");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", showPrevImage);
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", showNextImage);
    }

    // Click on the backdrop (the dialog element itself, outside its
    // children) closes the viewer.
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            closeLightbox();
        }
    });

    dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            showPrevImage();
        } else if (event.key === "ArrowRight") {
            showNextImage();
        }
        // Escape is handled natively by <dialog>.
    });
}

function openLightbox(index) {

    const dialog =
        document.getElementById("gallery-lightbox");

    if (!dialog || galleryImages.length === 0) return;

    galleryIndex = index;

    updateLightboxImage();

    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        // Fallback for browsers without <dialog> support.
        dialog.setAttribute("open", "");
    }
}

function closeLightbox() {

    const dialog =
        document.getElementById("gallery-lightbox");

    if (!dialog) return;

    if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
    } else {
        dialog.removeAttribute("open");
    }
}

function showPrevImage() {

    if (galleryImages.length === 0) return;

    galleryIndex =
        (galleryIndex - 1 + galleryImages.length) % galleryImages.length;

    updateLightboxImage();
}

function showNextImage() {

    if (galleryImages.length === 0) return;

    galleryIndex =
        (galleryIndex + 1) % galleryImages.length;

    updateLightboxImage();
}

function updateLightboxImage() {

    const img = document.getElementById("lightbox-image");
    const caption = document.getElementById("lightbox-caption");

    if (!img || galleryImages.length === 0) return;

    const current = galleryImages[galleryIndex];

    img.src = current.src;
    img.alt = current.alt;

    if (caption) {
        caption.textContent =
            `${galleryIndex + 1} / ${galleryImages.length}`;
    }

    // Keep the large preview and thumbnail strip in sync with
    // whatever image the lightbox is currently showing.
    const previewImage =
        document.querySelector(".project-gallery-image");

    if (previewImage) {
        previewImage.src = current.src;
    }

    document
        .querySelectorAll(".project-gallery-thumbnail")
        .forEach((thumb, index) => {
            thumb.classList.toggle("active", index === galleryIndex);
        });
}

/* ----------------------------------------------------------
    Contributions
---------------------------------------------------------- */

function renderContributions(project) {

    const list =
        document.getElementById("project-contributions");

    list.innerHTML = "";

    project.keyContributions.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        list.appendChild(li);

    });

}

/* ----------------------------------------------------------
    Challenges
---------------------------------------------------------- */

function renderChallenges(project) {

    const container =
        document.getElementById("project-challenges");

    container.innerHTML = "";

    project.challenges.forEach(challenge => {

        const card =
            document.createElement("div");

        card.className = "glass-card challenge-card";

        card.innerHTML = `
            <h3>
                ${challenge.title}
            </h3>

            <p>
                ${challenge.description}
            </p>
        `;

        container.appendChild(card);

    });

}

/* ----------------------------------------------------------
    Metrics
---------------------------------------------------------- */

function renderMetrics(project) {

    const list =
        document.getElementById("project-metrics");

    list.innerHTML = "";

    project.metrics.forEach(metric => {

        const li =
            document.createElement("li");

        li.textContent = metric;

        list.appendChild(li);

    });

}

/* ----------------------------------------------------------
    Learning
---------------------------------------------------------- */

function renderLearning(project) {

    const list =
        document.getElementById("project-learning");

    list.innerHTML = "";

    project.learningPoints.forEach(point => {

        const li =
            document.createElement("li");

        li.textContent = point;

        list.appendChild(li);

    });

}

/* ----------------------------------------------------------
    On-this-page nav — active section tracking (add-on)
---------------------------------------------------------- */

function setupTocObserver() {

    const tocLinks =
        document.querySelectorAll(".toc a");

    if (!tocLinks.length) return;

    const sectionToLink = new Map();

    tocLinks.forEach(link => {

        const id = link.getAttribute("href").slice(1);

        const section = document.getElementById(id);

        if (section) {
            sectionToLink.set(section, link);
        }

    });

    if (sectionToLink.size === 0) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const activeLink = sectionToLink.get(entry.target);

            if (!activeLink) return;

            tocLinks.forEach(link => link.classList.remove("active"));
            activeLink.classList.add("active");

        });

    }, {
        // Treat a section as "current" once it's roughly in the
        // middle band of the viewport, rather than only when its
        // top edge crosses the very top of the screen.
        rootMargin: "-45% 0px -50% 0px",
        threshold: 0
    });

    sectionToLink.forEach((_, section) => observer.observe(section));
}

/* ----------------------------------------------------------
    Back to top (add-on)
---------------------------------------------------------- */

function setupBackToTop() {

    const button =
        document.getElementById("back-to-top");

    if (!button) return;

    const SHOW_AFTER_PX = 480;

    window.addEventListener("scroll", () => {
        button.hidden = window.scrollY <= SHOW_AFTER_PX;
    }, { passive: true });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ----------------------------------------------------------
    Prev / next project pagination (add-on)
---------------------------------------------------------- */

async function setupProjectPagination(currentProjectId) {

    const prevLink = document.getElementById("prev-project-link");
    const nextLink = document.getElementById("next-project-link");

    if (!prevLink && !nextLink) return;

    try {

        // project-index.json is an object like:
        // { "featuredProjects": [...ids], "projects": [ { id, title, ... } ] }
        // — the display order for pagination is whatever order the
        // "projects" array is in.
        const response = await fetch("data/project-index.json");

        if (!response.ok) {
            throw new Error(`Failed to load project-index.json: ${response.status}`);
        }

        const index = await response.json();

        const projects = index.projects;

        if (!Array.isArray(projects)) return;

        const currentIndex = projects.findIndex(
            p => p.id === currentProjectId
        );

        if (currentIndex === -1) return;

        const previousProject = projects[currentIndex - 1];
        const nextProject = projects[currentIndex + 1];

        if (previousProject && prevLink) {
            prevLink.href = `project-details.html?id=${previousProject.id}`;
            prevLink.querySelector(".project-pagination-title").textContent =
                previousProject.title;
            prevLink.hidden = false;
        }

        if (nextProject && nextLink) {
            nextLink.href = `project-details.html?id=${nextProject.id}`;
            nextLink.querySelector(".project-pagination-title").textContent =
                nextProject.title;
            nextLink.hidden = false;
        }

    } catch (err) {
        // Non-critical — the nav links simply stay hidden if we
        // can't determine project order.
        console.warn(
            "[project-details.js] Could not load project list for pagination:",
            err
        );
    }
}

/* ----------------------------------------------------------
    Page loader (add-on)
---------------------------------------------------------- */

function hidePageLoader() {

    const loader =
        document.getElementById("page-loader");

    if (loader) {
        loader.hidden = true;
    }
}