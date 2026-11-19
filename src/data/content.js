/**
 * Site content — single source of truth for everything except projects.
 * Edit this file to change the text on the site; `npm run build` re-renders the static HTML.
 *
 * Source: assets/resume.pdf (primary), plus the plan's section 9. See CONTENT_NOTES.md.
 * Any value starting with "TODO(owner)" is rendered as a clearly-marked placeholder.
 */

export const site = {
  name: 'Dheeraj S J',
  title: 'Dheeraj S J: Backend, Cloud & LLM Security',
  description:
    'Portfolio of Dheeraj S J, Associate Technical Consultant at Perficient, focused on backend engineering, cloud systems and LLM security.',
  ogImage: 'assets/og-image.png', // TODO(owner): replace placeholder with a real 1200×630 image
  year: 2026,
  footerLine: '// git commit -m "crossed the event horizon"',
};

export const intro = {
  name: 'Dheeraj S J',
  // Used by the intro's response headers: tags[0] → role, the rest (minus the company) → focus.
  tags: ['Associate Technical Consultant', 'Backend & Cloud', 'LLM Security', 'Perficient'],
};

export const hero = {
  name: 'Dheeraj S J',
  role: 'Associate Technical Consultant at Perficient',
  location: 'Chennai, Tamil Nadu',
  // Adapted from the resume's professional summary. TODO(owner): review wording.
  bio: [
    'Computer Science graduate building backend services and cloud-integrated systems, with a particular focus on applied LLM security.',
    'I enjoy solving real-world engineering problems in performance-oriented systems, from API design and access control to defending language models against prompt injection.',
  ],
  // TODO(owner): review — derived from the resume's focus areas, in the current site's `//` style.
  tagline: '// backend · cloud · llm security',
  portraitAlt: 'Portrait of Dheeraj S J',
  resume: 'assets/resume.pdf',
};

export const experience = [
  {
    role: 'Associate Technical Consultant',
    org: 'Perficient',
    period: '2026 – Present',
    current: true,
    bullets: [
      'Onboarded as an Associate Technical Consultant and currently undergoing structured training in enterprise technology delivery and consulting practices.',
      'Collaborating with cross-functional teams as part of the training program, with a focus on backend systems and cloud-integrated architectures.',
    ],
    stack: [],
  },
  {
    role: 'IT Intern',
    org: 'Three Cube Managed Services and Solutions',
    period: '2026', // TODO(owner): exact months
    current: false,
    bullets: [
      'Developed a data-privacy-focused enterprise AI workspace with multi-model access and Role-Based Access Control (RBAC).',
      'Built backend services, API integrations, authentication, access control and LLM model orchestration.',
      'Hardened the prototype for deployment, focusing on integration, testing, reliability and configuration, using AI-powered development tools and prompt engineering throughout the development lifecycle.',
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Open WebUI', 'LiteLLM', 'Amazon Bedrock', 'OpenAPI', 'Docker', 'AWS S3', 'Git'],
  },
];

export const skills = [
  { group: 'Programming', items: ['Python', 'Java', 'C'] },
  { group: 'Web & Backend', items: ['FastAPI', 'OpenAPI', 'HTML', 'CSS', 'JavaScript', 'PHP (basic)'] },
  { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'SQLite (basic)'] },
  { group: 'Cloud & Tools', items: ['AWS S3', 'Amazon Bedrock', 'Docker', 'Git', 'LiteLLM', 'Open WebUI'] },
  {
    group: 'Core CS',
    items: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Machine Learning'],
  },
  { group: 'Practices', items: ['OOP', 'Cloud (AWS)', 'RBAC', 'Agile Collaboration'] },
];

// Newest first.
export const education = [
  {
    title: 'B.E. Computer Science & Engineering',
    org: 'MIT, Anna University',
    period: '2022 – 2026',
    detail: 'CGPA 8.16 / 10',
  },
  { title: 'Higher Secondary (XII)', org: 'CBSE', period: '2021', detail: '97.4%' },
  { title: 'Secondary School (X)', org: 'CBSE', period: '2019', detail: '95.2%' },
];

export const certifications = [
  {
    title: 'Prompt Engineering',
    detail: 'Designed and optimised structured prompts to improve the accuracy and reliability of LLM outputs.',
    issuer: 'TODO(owner): issuer',
    href: 'TODO(owner): certificate link',
  },
  {
    title: 'Generative AI',
    detail: 'LLMs, transformer models and practical applications of generative AI systems.',
    issuer: 'TODO(owner): issuer',
    href: 'TODO(owner): certificate link',
  },
];

export const contact = {
  closing: "Let's talk backend systems, cloud architecture and LLM security.",
  email: 'dheerajsridhar15.16@gmail.com',
  github: 'TODO(owner): GitHub profile URL',
  linkedin: 'TODO(owner): LinkedIn profile URL',
};

// Section order drives the nav, the side progress dots and the nebula hue drift.
export const sections = [
  { id: 'experience', label: 'Experience', tint: 'b' },
  { id: 'projects', label: 'Projects', tint: 'c' },
  { id: 'skills', label: 'Skills', tint: 'd' },
  { id: 'education', label: 'Education', tint: 'b' },
  { id: 'contact', label: 'Contact', tint: 'a' },
];
