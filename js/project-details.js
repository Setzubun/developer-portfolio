import {dateLabel} from "./utils.js";

const PROJECTS_ROOT = "projects";

document.addEventListener("DOMContentLoaded", async () => {
    initialisePage();

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

    } catch (error) {
        console.error(error);
        showError(error.message);
    }
});

/* ----------------------------------------------------------
    Initialisation
---------------------------------------------------------- */

function initialisePage() {
    document.getElementById("year").textContent =
        new Date().getFullYear();
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

    // const response = await fetch(
    //     `${PROJECTS_ROOT}/${projectId}/project-details.json`
    // );

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

        <h3>Problem</h3>

        <p>
            ${project.problem}
        </p>

        <h3>Solution</h3>

        <p>
            ${project.solution}
        </p>
    `;
}

/* ----------------------------------------------------------
    Architecture
---------------------------------------------------------- */

function renderArchitecture(project) {

    document.getElementById(
        "project-architecture"
    ).textContent = project.architecture;
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

    if (!project.gallery || project.gallery.length === 0) {

        container.innerHTML =
            "<p>No screenshots available.</p>";

        return;
    }

    const viewer = document.createElement("div");
    viewer.className = "project-gallery-viewer";

    const heroImage = document.createElement("img");
    heroImage.className = "project-gallery-image";
    heroImage.src =
        `${PROJECTS_ROOT}/${project.id}/assets/${project.gallery[0]}`;
    heroImage.alt = project.title;

    viewer.appendChild(heroImage);

    const thumbnails = document.createElement("div");
    thumbnails.className = "project-gallery-thumbnails";

    project.gallery.forEach(image => {

        const thumb = document.createElement("img");

        thumb.className = "project-gallery-thumbnail";

        thumb.src =
            `${PROJECTS_ROOT}/${project.id}/assets/${image}`;

        thumb.alt = image;

        thumb.loading = "lazy";

        thumb.addEventListener("click", () => {

            heroImage.src = thumb.src;

            thumbnails
                .querySelectorAll(".active")
                .forEach(t => t.classList.remove("active"));

            thumb.classList.add("active");

        });

        thumbnails.appendChild(thumb);

    });

    thumbnails.firstChild.classList.add("active");

    container.appendChild(viewer);
    container.appendChild(thumbnails);

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