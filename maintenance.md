# Updating Resume

1. Place your PDF inside: `assets/resume/`

2. Update: `data/profile.json`

Example:
```
{
    "resume": "resume-v2.pdf"
}
```

---

# Adding A Project

1. Create a project folder: `assets/projects/my-project/`

2. Add screenshots to that folder

3. Add an entry to: `data/projects.json`

4. Edit `data/project-index.json` for which projects should be featured `featuredProjects`

5. Run `node scripts/generate-project-index.js` to populate project-index.json

# Adding an experience
1. Edit in experience.json

# Adding a skill
1. Edit in skills.json

# Adding a Primary Stack
1. Head to `profile.json` 

2. Edit `featuredTechStack`
