# Dheeraj S J: Portfolio

Personal portfolio of **Dheeraj S J**, Associate Technical Consultant at Perficient (Chennai), working on backend services, cloud-integrated systems and applied LLM security.

**Live site:** https://dheerajdotcoma.github.io

## What's inside

- **Intro:** a short "request → response" animation (`GET /portfolio` → `200 OK`) that opens onto the page. It plays once per session and is skipped for reduced-motion users and deep links.
- **Experience, Skills, Education, Contact:** rendered from plain data files.
- **Projects:**
  - **College projects:** Prompt-injection defense and legal risk analysis, each with an interactive in-browser demo, plus the 3D Portfolio Verse.
  - **GGTP:** three full-stack products, each built end to end and shown as swipeable cards. Each opens a detail view listing the user roles and a step-by-step explanation of how the system works.
    - **GlowBox:** e-commerce store with an AI beauty concierge.
    - **CareAxis:** hospital management system with role-based access.
    - **Northvale:** wealth account opening with document OCR.
- **Background:** a WebGL nebula that adapts its quality to the device.

All content is prerendered into `index.html` at build time, so the site is readable without JavaScript and loads fast.

## Tech

Vite · vanilla JavaScript (ES modules) · WebGL/GLSL · GSAP · CSS custom properties · sharp (image pipeline).

## Run locally

```bash
npm install
npm run dev       # dev server
npm run build     # static build → dist/
npm run preview   # serve the build locally
```

## Project layout

| What | Where |
|---|---|
| Hero, experience, skills, education, contact text | `src/data/content.js` |
| Projects (summaries, roles, flows, media, links) | `src/data/projects.js` |
| Page templates (prerendered at build) | `src/render/templates.js` |
| Project details modal and GGTP card row | `src/components/projectModal.js` |
| Intro animation | `src/intro/request.js` |
| Nebula background | `src/beyond/` |
| Design tokens and styles | `src/styles/` |
| Images, resume, fonts | `public/` |

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages through `.github/workflows/deploy.yml`.

---

© Dheeraj S J. All rights reserved.
