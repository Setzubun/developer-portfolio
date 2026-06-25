const fs = require("fs");
const path = require("path");

const projectsDir = path.join(__dirname, "..", "projects");

const indexPath = path.join(
    __dirname,
    "..",
    "data",
    "project-index.json"
);

const existingIndex = JSON.parse(
    fs.readFileSync(indexPath, "utf8")
);

const featuredProjects =
    existingIndex.featuredProjects || [];

const projectFolders = fs
    .readdirSync(projectsDir, {
        withFileTypes: true
    })
    .filter(dirent => dirent.isDirectory());

const projects = projectFolders.map(folder => {

    const id = folder.name;

    const projectJsonPath = path.join(
        projectsDir,
        id,
        "project.json"
    );

    const project = JSON.parse(
        fs.readFileSync(projectJsonPath, "utf8")
    );

    return {
        id: project.id,
        title: project.title,
        tagline: project.tagline,
        thumbnail:
            `projects/${id}/assets/${project.thumbnail}`,
        startDate: project.startDate,
        endDate: project.endDate,
        technologies: project.technologies
    };
});

const output = {
    featuredProjects,
    projects
};

fs.writeFileSync(
    indexPath,
    JSON.stringify(output, null, 2)
);

console.log(
    `Generated project index for ${projects.length} projects`
);