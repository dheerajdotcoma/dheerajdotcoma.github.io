/**
 * Projects — one entry per project, rendered in this order.
 *
 * - `featured: true` (max 3) → large alternating panels; everything else → card grid below.
 * - Adding a project needs only a new entry here plus its folder in public/assets/projects/<id>/.
 *   `npm run content` does this for you from assets/projects/<folder>/ and refreshes `media`
 *   (screenshots, poster, video) while keeping your hand-written text.
 * - `group: "ggtp"` puts a project in the GGTP row (horizontal cards); `roles`, `flow` and `highlights`
 *   add the "Who uses it", end-to-end flow and highlights sections to its details modal.
 * - `media.demo` names a component registered in src/components/demoRegistry.js.
 * - A link whose href starts with "TODO" renders as a disabled "coming soon" button.
 */
export default [
  {
    "id": "prompt-defense",
    "title": "Architectural Defense Layer for Detecting Prompt Injection Attacks in LLMs",
    "summary": "Real-time middleware that detects prompt injection and jailbreak attacks before they reach a language model.",
    "description": [
      "A pre-execution defense layer that sits in front of an LLM and screens every prompt before the model ever sees it. It pairs a fine-tuned all-MiniLM-L6-v2 classifier for fast pattern detection with Qwen 2.5 chain-of-thought reasoning for deeper intent analysis.",
      "Prompts are first normalised (recursive decoding of layered encodings, homoglyph mapping and structural sanitisation) to expose obfuscated payloads. Semantic drift analysis catches context-switching attacks, and weighted decision fusion combines both signals into a single allow or block decision.",
      "Evaluated on the SafeGuard and Deepset prompt injection datasets, reaching 91.84% accuracy (86.21% F1 with the 14B model), about 15% higher accuracy than an LLM + chain-of-thought baseline and about an 80% reduction in attack success rate."
    ],
    "stack": [
      "Python",
      "Qwen 2.5",
      "all-MiniLM-L6-v2",
      "Hugging Face Transformers",
      "Streamlit"
    ],
    "metrics": [
      {
        "value": "91.84%",
        "label": "detection accuracy"
      },
      {
        "value": "~15%",
        "label": "higher accuracy than baseline"
      },
      {
        "value": "~80%",
        "label": "reduction in attack success rate"
      }
    ],
    "media": {
      "type": "demo",
      "poster": null,
      "video": null,
      "screenshots": [],
      "demo": "promptDefense"
    },
    "links": [],
    "featured": true
  },
  {
    "id": "legal-risk",
    "title": "Legal Document Risk Assessor",
    "summary": "An NLP tool that extracts clauses from contracts and classifies how risky each one is.",
    "description": [
      "Reviewing contracts by hand is slow and easy to get wrong. This tool automates the first pass: it extracts key clauses from a contract with a BERT model, classifies each clause into high, medium or low risk, and answers natural-language questions about the document.",
      "The pipeline covers OCR text extraction for scanned documents, BERT-based clause identification fine-tuned on the CUAD contract dataset, risk classification with preprocessing and ML text classification, question answering over the contract, and plain-language simplification of dense clauses.",
      "It achieved 87% risk-assessment accuracy and over 90% precision in document question answering."
    ],
    "stack": [
      "Python",
      "BERT",
      "scikit-learn"
    ],
    "metrics": [
      {
        "value": "87%",
        "label": "risk-assessment accuracy"
      },
      {
        "value": "90%+",
        "label": "precision on document Q&A"
      }
    ],
    "media": {
      "type": "demo",
      "poster": null,
      "video": null,
      "screenshots": [],
      "demo": "legalRisk"
    },
    "links": [],
    "featured": true
  },
  {
    "id": "verse",
    "title": "3D Portfolio Verse",
    "summary": "A walkable 3D world version of my resume, with a third-person camera and proximity-triggered panels.",
    "description": [
      "A walkable dimension of my resume. You move a small character with WASD or the arrow keys, walk up to a glowing zone, and press E to open that part of the portfolio: about, education, skills, experience, projects and contact.",
      "Built from scratch with Three.js and WebGL: a smoothed third-person chase camera, proximity detection for each zone, two-tone comic-style lighting with a halftone ground, floating shards, a compass and an on-screen d-pad for touch devices."
    ],
    "stack": [
      "Three.js",
      "WebGL",
      "JavaScript (ES6)"
    ],
    "metrics": [],
    "media": {
      "type": "screenshots",
      "poster": {
        "src": "assets/projects/verse/screenshot-portfolio1.webp",
        "srcset": "assets/projects/verse/screenshot-portfolio1-800.webp 800w, assets/projects/verse/screenshot-portfolio1.webp 1600w",
        "width": 1600,
        "height": 789
      },
      "video": null,
      "screenshots": [
        {
          "src": "assets/projects/verse/screenshot-portfolio1.webp",
          "srcset": "assets/projects/verse/screenshot-portfolio1-800.webp 800w, assets/projects/verse/screenshot-portfolio1.webp 1600w",
          "width": 1600,
          "height": 789,
          "alt": "A small blocky character standing on a purple halftone floor, surrounded by glowing coloured zone platforms",
          "caption": "Walk up to any glowing zone and press E to open it."
        },
        {
          "src": "assets/projects/verse/screenshot-portfolio2.webp",
          "srcset": "assets/projects/verse/screenshot-portfolio2-800.webp 800w, assets/projects/verse/screenshot-portfolio2.webp 1600w",
          "width": 1600,
          "height": 789,
          "alt": "A comic-style projects panel open over the 3D scene, listing projects with stack tags and metric bars",
          "caption": "Each zone opens a panel, here the projects zone."
        }
      ],
      "demo": null
    },
    "links": [
      {
        "label": "Launch",
        "href": "TODO(owner): 3D Portfolio Verse URL"
      }
    ],
    "featured": true
  },
  {
    "id": "glowbox",
    "group": "ggtp",
    "title": "GlowBox: Beauty & Personal-Care Store",
    "summary": "A full-stack beauty store with live stock, real-time order tracking and an AI shopping assistant.",
    "description": [
      "An Indian beauty and personal-care store with 132 products across 6 categories, built end to end: a React storefront and a Spring Boot REST API on PostgreSQL. The backend is the only source of truth for products, prices, stock, carts and orders; the browser never computes a price and never stores a token.",
      "Shoppers get forgiving search (typos, plurals and synonyms), a bag that reserves stock, idempotent checkout and live order tracking. A store manager runs the shop from an admin panel, and an AI assistant answers product questions and summarises reviews, with non-AI fallbacks when it is unavailable."
    ],
    "roles": [
      {
        "name": "Shopper",
        "does": "Browses and searches, keeps a bag that holds stock, checks out, tracks orders live, cancels within 60 seconds and downloads a GST invoice."
      },
      {
        "name": "Store Manager",
        "does": "Runs the admin panel: products with CSV import, inventory by shade and batch, coupons, promotions, orders, review moderation, sales report, audit log and AI usage."
      }
    ],
    "flow": [
      {
        "title": "Browse & search",
        "plain": "Find products with filters and search that forgives typos.",
        "tech": "Paged, URL-shareable filters with live facet counts. Search ranks title over brand over description, handles plurals, synonyms and typos with pg_trgm, and suggests \"Did you mean…?\". A 60-second cache is cleared by database NOTIFY events."
      },
      {
        "title": "Add to bag",
        "plain": "Items in the bag are held for you for 15 minutes.",
        "tech": "Cart reservations act as stock holds, so two people cannot both be promised the last unit. A guest bag is merged once at sign-in, with optimistic UI updates."
      },
      {
        "title": "Price it",
        "plain": "Tax, coupons and free gifts are worked out by the server.",
        "tech": "Per-category GST (5% or 18%) plus 18% on shipping, a coupon engine and free-gift promotions, all computed in the backend, never in the browser."
      },
      {
        "title": "Checkout",
        "plain": "Pay once, and never buy something that is out of stock.",
        "tech": "One atomic UPDATE … WHERE stock >= qty prevents overselling (tested with 60 concurrent buyers for 20 units). Checkout is idempotent, so a double click or retry never creates two orders."
      },
      {
        "title": "Track live",
        "plain": "Order status updates on screen without refreshing.",
        "tech": "PostgreSQL triggers fire LISTEN/NOTIFY, which the API streams to every open tab over Server-Sent Events. Missed events are replayed after a reconnect."
      },
      {
        "title": "Invoice & notify",
        "plain": "A GST invoice PDF, plus email and SMS updates.",
        "tech": "Invoices are generated with OpenPDF. Emails and SMS go through a transactional outbox, retried with back-off, so a message is never lost if a send fails."
      }
    ],
    "highlights": [
      "No overselling: one atomic stock update, verified with 60 concurrent buyers for 20 units.",
      "AI shopping assistant (Claude via Portkey) for product Q&A and review summaries, with a circuit breaker, a daily token budget and non-AI fallbacks.",
      "Security: 15-minute access tokens, rotating HttpOnly refresh cookies, BCrypt, account lockout and rate limiting.",
      "87.6% backend line coverage across 264 unit and integration tests against a real PostgreSQL database."
    ],
    "stack": [
      "Java 21",
      "Spring Boot 3.5",
      "Spring Security",
      "PostgreSQL",
      "Flyway",
      "React 19",
      "Redux Toolkit",
      "Vite",
      "Playwright"
    ],
    "metrics": [],
    "media": {
      "type": "screenshots",
      "poster": {
        "src": "assets/projects/glowbox/glowbox.webp",
        "srcset": "assets/projects/glowbox/glowbox-800.webp 800w, assets/projects/glowbox/glowbox.webp 1600w",
        "width": 1600,
        "height": 789
      },
      "video": null,
      "screenshots": [
        {
          "src": "assets/projects/glowbox/glowbox.webp",
          "srcset": "assets/projects/glowbox/glowbox-800.webp 800w, assets/projects/glowbox/glowbox.webp 1600w",
          "width": 1600,
          "height": 789,
          "alt": "The GlowBox storefront: category menu, a skincare offer banner, recently viewed products and the AI Beauty Concierge chat panel open on the right",
          "caption": "The storefront, with the AI Beauty Concierge open."
        }
      ],
      "demo": null
    },
    "links": [],
    "featured": false
  },
  {
    "id": "careaxis",
    "group": "ggtp",
    "title": "CareAxis: Hospital Management System",
    "summary": "A hospital management system for a 300-bed hospital, solving 10 real problems from double booking to medication safety.",
    "description": [
      "A full-stack hospital management system for a fictional 300-bed hospital in India, built around ten business problems: duplicate patients, double booking, no-shows, emergency triage, beds, medication safety, billing, critical lab results, record protection and discharge summaries.",
      "Two services work together. The core service (Spring Boot) owns every patient record, bill and workflow. The intel service (FastAPI) does scoring, triage, forecasting and drafting, and only ever sees minimised or de-identified data. Every workflow still completes if intel is down, and the system was deployed on Google Kubernetes Engine."
    ],
    "roles": [
      {
        "name": "Patient",
        "does": "Uses the portal to book appointments and follow their own care."
      },
      {
        "name": "Front Desk",
        "does": "Registers patients (with a duplicate check), books slots and checks people in."
      },
      {
        "name": "Doctor",
        "does": "Consults, prescribes, orders labs, admits and signs discharge summaries."
      },
      {
        "name": "Nurse",
        "does": "Triages emergency patients and manages ward care and beds."
      },
      {
        "name": "Lab Technician",
        "does": "Enters and verifies results; critical values raise an alert."
      },
      {
        "name": "Pharmacist",
        "does": "Verifies prescriptions flagged by the medication safety check."
      },
      {
        "name": "Billing",
        "does": "Handles charges, GST, packages, insurer splits and invoices."
      },
      {
        "name": "Admin",
        "does": "Manages staff, departments and settings."
      },
      {
        "name": "Privacy Officer",
        "does": "Reviews emergency (break-the-glass) access and the audit trail."
      }
    ],
    "flow": [
      {
        "title": "Register",
        "plain": "The front desk adds a patient, after checking they are not already on file.",
        "tech": "A fuzzy duplicate check scores candidates in the intel service, with a pg_trgm similarity fallback. Merging two records needs two people and a re-authentication."
      },
      {
        "title": "Book & check in",
        "plain": "Book a slot, then get a token with a live queue position.",
        "tech": "Slot rows are locked and booking is idempotent, so two receptionists can never double-book. A no-show model (logistic regression) allows limited, bounded overbooking."
      },
      {
        "title": "Consult or triage",
        "plain": "A doctor sees the patient, or emergency staff triage them.",
        "tech": "Emergency triage uses versioned rules that explain their reasons. If the intel service is down, the patient is put at the most urgent level and flagged for manual review."
      },
      {
        "title": "Admit & treat",
        "plain": "Allocate a bed and prescribe medicines safely.",
        "tech": "Admissions, transfers and discharges are locked transactions, with a 72-hour bed forecast. Every prescription is re-checked on the server: hard stops, near-miss logging and audited overrides."
      },
      {
        "title": "Lab results",
        "plain": "Dangerous results reach a doctor quickly.",
        "tech": "A critical value raises an alert in the same transaction that verifies it, and escalates to the on-call doctor until someone acknowledges it."
      },
      {
        "title": "Bill & discharge",
        "plain": "Settle the bill and hand over a signed discharge summary.",
        "tech": "Charges post in the same transaction as the care event, with GST, packages and insurer splits. A discharge summary is drafted from de-identified data, then signed by the doctor after re-authentication."
      }
    ],
    "highlights": [
      "Two-service design: core owns all records and money; intel sees only minimised data and is never required for a workflow to finish.",
      "Services talk through Google Pub/Sub events, with timeouts, circuit breakers and deterministic non-AI fallbacks.",
      "Record protection: care-team access policy, audited break-the-glass access with privacy review, and a sealed audit trail.",
      "Deployed on Google Kubernetes Engine with Cloud SQL, load-tested with k6, autoscaling and zero-downtime rollouts."
    ],
    "stack": [
      "Java 21",
      "Spring Boot 3.5",
      "FastAPI",
      "Python 3.12",
      "PostgreSQL 16",
      "Google Pub/Sub",
      "React 19",
      "TypeScript",
      "Docker",
      "GKE"
    ],
    "metrics": [],
    "media": {
      "type": "screenshots",
      "poster": {
        "src": "assets/projects/careaxis/careaxis.webp",
        "srcset": "assets/projects/careaxis/careaxis-800.webp 800w, assets/projects/careaxis/careaxis.webp 1600w",
        "width": 1600,
        "height": 791
      },
      "video": null,
      "screenshots": [
        {
          "src": "assets/projects/careaxis/careaxis.webp",
          "srcset": "assets/projects/careaxis/careaxis-800.webp 800w, assets/projects/careaxis/careaxis.webp 1600w",
          "width": 1600,
          "height": 791,
          "alt": "The CareAxis sign-in page: one sign-in for staff and patients, beside a summary of the system from registration to discharge",
          "caption": "One sign-in for every role; each person sees only the screens their role allows."
        }
      ],
      "demo": null
    },
    "links": [],
    "featured": false
  },
  {
    "id": "northvale",
    "group": "ggtp",
    "title": "Northvale Wealth: New Account Opening",
    "summary": "Digital onboarding for wealth-management clients, from a guided application to an approved, opened investment account.",
    "description": [
      "Digital onboarding for a wealth-management firm. Applicants open an investment account through a 15-step guided wizard; documents are read by OCR; applicants are screened against sanctions and politically-exposed-person lists; and a reviewer and a separate approver check every case.",
      "Every decision lands in a hash-chained audit trail. Once an account opens, an Advisor 360 service puts the client into an advisor's book, with client profiles, households, portfolios, risk alerts and recommendations."
    ],
    "roles": [
      {
        "name": "Applicant",
        "does": "Registers, completes the wizard, uploads documents, e-signs and tracks the application."
      },
      {
        "name": "Reviewer",
        "does": "Checks cases, adds remarks, asks for more information and recommends a decision."
      },
      {
        "name": "Approver",
        "does": "Makes the final decision and handles escalations; can never approve a case they reviewed."
      },
      {
        "name": "Admin",
        "does": "Manages staff accounts and settings, with no access to applications."
      },
      {
        "name": "Advisor",
        "does": "Sees their client book: Client 360, households, portfolios, risk alerts and recommendations."
      }
    ],
    "flow": [
      {
        "title": "Register",
        "plain": "Sign up with a mobile code and secure sign-in.",
        "tech": "Mobile OTP verification, Argon2id password hashing, TOTP two-factor sign-in and RS256-signed JWTs."
      },
      {
        "title": "Fill the wizard",
        "plain": "Answer guided steps; uploaded documents fill in fields for you.",
        "tech": "15 steps covering identity, investment profile, risk questionnaire, FATCA/CRS tax residency with W-9 / W-8BEN, beneficiaries and bank account. OCR fills steps from uploads and rejects blurred, wrong, expired or mismatched documents."
      },
      {
        "title": "E-sign",
        "plain": "Sign the application with a one-time code.",
        "tech": "A signing code is sent by SMS, and the signature is bound to a hash of the exact application snapshot, so nothing can change after signing. A signed PDF is produced."
      },
      {
        "title": "Screening",
        "plain": "Automatic checks against sanctions and politically exposed persons.",
        "tech": "Fuzzy matching against watch lists through a provider port, with retries and a circuit breaker. Hits are triaged, and a customer risk rating is calculated with its breakdown."
      },
      {
        "title": "Review → Approve",
        "plain": "One person reviews, a different person approves.",
        "tech": "A state machine controls every status change. Cases sit in queues with SLA timers on a business calendar, warnings at 75%, and a request-for-information loop with the applicant (maker-checker)."
      },
      {
        "title": "Account opened",
        "plain": "The account is created and the client gets an advisor.",
        "tech": "An NV account number with a Luhn check digit is issued, with retries and an ops alert if provisioning fails. An approval email is sent, and the client joins an advisor's book in Advisor 360."
      }
    ],
    "highlights": [
      "Segregation of duties by design: one role per account, and the approver can never be the reviewer of the same case.",
      "Insert-only, hash-chained audit trail, so any tampering is detectable.",
      "Modular monolith with architecture rules enforced by tests (ArchUnit): modules talk only through published facades.",
      "AI risk-profile suggestion for reviewers (via Portkey), off without a key; OCR document reading as a separate FastAPI service."
    ],
    "stack": [
      "Java 21",
      "Spring Boot 4.1",
      "Spring Security",
      "PostgreSQL",
      "Flyway",
      "React 19",
      "TypeScript",
      "TanStack Query",
      "FastAPI"
    ],
    "metrics": [],
    "media": {
      "type": "screenshots",
      "poster": {
        "src": "assets/projects/northvale/northvale.webp",
        "srcset": "assets/projects/northvale/northvale-800.webp 800w, assets/projects/northvale/northvale.webp 1600w",
        "width": 1600,
        "height": 803
      },
      "video": null,
      "screenshots": [
        {
          "src": "assets/projects/northvale/northvale.webp",
          "srcset": "assets/projects/northvale/northvale-800.webp 800w, assets/projects/northvale/northvale.webp 1600w",
          "width": 1600,
          "height": 803,
          "alt": "The Northvale account application wizard on step 2 of 15, Residential address, with the step list on the left and a document upload that fills in the address",
          "caption": "The 15-step application wizard; uploading a document fills in the fields."
        }
      ],
      "demo": null
    },
    "links": [],
    "featured": false
  }
];
