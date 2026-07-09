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

1. Create a project folder: `projects/my-project/`

2. Add screenshots to the `projects/my-project/assets` folder

3. If project is to be featured, add it to `data/project-index.json` under `featuredProjects`

4. Run `node scripts/generate-project-index.js` to populate project-index.json (for testing)

# Adding an experience
1. Edit in experience.json

# Adding a skill
1. Edit in skills.json

# Adding a Primary Stack
1. Head to `profile.json` 

2. Edit `featuredTechStack`
