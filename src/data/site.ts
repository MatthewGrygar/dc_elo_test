export type Lang = "en" | "cs";

export const profile = {
  name: "Matthew Grygar",
  roles: ["System Engineer", "Application Support", "Identity & Access Management"],
  location: { en: "Prague (Hybrid)", cs: "Praha (Hybrid)" },
  email: "matthew@example.com",
  linkedin: "https://linkedin.com/in/placeholder",
  cvUrl: "/cv.pdf"
} as const;

export const i18n = {
  nav: {
    home: { en: "Home", cs: "Domů" },
    about: { en: "About", cs: "O mně" },
    experience: { en: "Experience", cs: "Zkušenosti" },
    projects: { en: "Projects", cs: "Projekty" },
    skills: { en: "Skills", cs: "Dovednosti" },
    contact: { en: "Contact", cs: "Kontakt" },
    cta: { en: "Let’s talk", cs: "Ozvěte se" }
  },
  hero: {
    title: { en: "System Engineer with a calm, security‑aware support mindset.", cs: "System Engineer se klidným, bezpečnostně uvědomělým support mindsetem." },
    subtitle: { en: "IAM • Application Support • Systems", cs: "IAM • Application Support • Systémy" },
    primaryCta: { en: "Contact", cs: "Kontakt" },
    secondaryCta: { en: "Download CV", cs: "Stáhnout CV" },
    kicker: { en: "Prague • Hybrid • Available for conversations", cs: "Praha • Hybrid • K dispozici pro konzultaci" }
  },
  about: {
    headline: { en: "A reliable partner for the moments that matter.", cs: "Spolehlivý parťák pro chvíle, kdy na tom záleží." },
    body: {
      en: "I help teams keep critical services healthy — by reducing incidents, automating the boring parts, and communicating clearly when the pressure is on. My sweet spot sits between systems, applications, and identity: where reliability meets security and good process.",
      cs: "Pomáhám týmům držet kritické služby v kondici — snižuju incidenty, automatizuju rutinu a v kritických chvílích komunikuju jasně a věcně. Můj sweet spot je na pomezí systémů, aplikací a identity: tam, kde se potkává spolehlivost, bezpečnost a dobrý proces."
    },
    pillarsTitle: { en: "Value pillars", cs: "Hodnoty" },
    pillars: [
      { en: "Reliable support under pressure", cs: "Spolehlivý support i pod tlakem" },
      { en: "Automation mindset (repeatable > heroic)", cs: "Automatizace (opakovatelně > heroicky)" },
      { en: "Clear communication with stakeholders", cs: "Jasná komunikace se stakeholdery" },
      { en: "Security awareness, least privilege thinking", cs: "Bezpečnost a least‑privilege přístup" },
      { en: "Continuous learning & documentation", cs: "Neustálé zlepšování a dokumentace" }
    ],
    toolboxTitle: { en: "Toolbox", cs: "Toolbox" },
    toolbox: ["SQL", "JIRA", "IAM / IdM", "Scripting", "Monitoring", "Linux / Windows"],
    currently: {
      label: { en: "Currently", cs: "Aktuálně" },
      value: { en: "System Engineer at Trask (2025–present)", cs: "System Engineer v Trask (2025–současnost)" }
    }
  },
  experience: {
    headline: { en: "Experience built on ownership.", cs: "Zkušenosti postavené na odpovědnosti." },
    items: [
      {
        role: { en: "System Engineer", cs: "System Engineer" },
        company: "Trask",
        period: { en: "Jan 2025 – present", cs: "01/2025 – současnost" },
        tags: ["IdM", "Automation", "Integrations"],
        bullets: {
          en: [
            "Support & development of Identity Management (IdM) platform.",
            "Automation: implementation, installation, configuration, testing.",
            "Integrations, report scripting, performance tuning and optimization.",
            "Incident resolution, stakeholder communication, functional/technical specs.",
            "Monitoring trends in infrastructure and security posture."
          ],
          cs: [
            "Support a vývoj Identity Management (IdM) platformy.",
            "Automatizace: implementace, instalace, konfigurace, testování.",
            "Integrace, reportovací skripty, ladění výkonu a optimalizace.",
            "Řešení incidentů, komunikace se zákazníkem, funkční/technické specifikace.",
            "Monitoring trendů v infrastruktuře a bezpečnosti."
          ]
        },
        impacts: {
          en: ["Reduced repetitive tasks via scripted reporting.", "Improved incident handover with crisp runbooks."],
          cs: ["Snížení rutiny díky skriptovanému reportingu.", "Lepší předávání incidentů díky runbookům."]
        }
      },
      {
        role: { en: "Senior Application Support Specialist (contract)", cs: "Senior Application Support Specialist (kontrakt)" },
        company: "OX Point",
        period: { en: "Feb 2024 – Sep 2025", cs: "02/2024 – 09/2025" },
        tags: ["L2", "On‑call", "SQL"],
        bullets: {
          en: [
            "L2 application support with on‑call rotation.",
            "Incident / problem / request processes aligned to SLA.",
            "SLA reporting and JIRA ticketing.",
            "SQL work on production databases (analysis & fixes)."
          ],
          cs: [
            "L2 aplikační podpora včetně on‑call.",
            "Incident / problem / request procesy v návaznosti na SLA.",
            "SLA reporting a práce v JIRA.",
            "SQL práce nad produkční DB (analýza a opravy)."
          ]
        },
        impacts: {
          en: ["Stabilized critical flows during peak periods.", "Tighter RCA discipline for recurring issues."],
          cs: ["Stabilizace kritických toků v peak obdobích.", "Lepší RCA disciplína u opakovaných problémů."]
        }
      },
      {
        role: { en: "Senior IT Platform Specialist", cs: "Senior IT Platform Specialist" },
        company: "NAKIT",
        period: { en: "May 2023 – Mar 2024", cs: "05/2023 – 03/2024" },
        tags: ["Monitoring", "Ops", "Docs"],
        bullets: {
          en: [
            "Monitoring & diagnostics of applications and services.",
            "L2 support, outage recovery and maintenance windows.",
            "Operational documentation and SLA compliance reporting.",
            "Business/IT requirements analysis; test/dev environment administration."
          ],
          cs: [
            "Monitoring a diagnostika aplikací a služeb.",
            "L2 podpora, recovery výpadků a maintenance okna.",
            "Provozní dokumentace a reporting SLA.",
            "Analýza požadavků business/IT; správa test/dev prostředí."
          ]
        },
        impacts: {
          en: ["More predictable maintenance windows.", "Cleaner ops docs for faster onboarding."],
          cs: ["Předvídatelnější maintenance okna.", "Čistší provozní dokumentace pro rychlejší onboarding."]
        }
      }
    ]
  },
  projects: {
    headline: { en: "Selected work & internal tooling.", cs: "Vybrané projekty a interní tooling." },
    filters: [
      { key: "all", en: "All", cs: "Vše" },
      { key: "iam", en: "IAM", cs: "IAM" },
      { key: "support", en: "Support", cs: "Support" },
      { key: "automation", en: "Automation", cs: "Automatizace" },
      { key: "monitoring", en: "Monitoring", cs: "Monitoring" }
    ],
    items: [
      {
        title: "IdM Automation Toolkit",
        description: {
          en: "A set of scripts and templates that standardize IdM deployments, integrations, and repeatable operations.",
          cs: "Sada skriptů a šablon pro standardizaci nasazení IdM, integrací a opakovatelných operací."
        },
        tags: ["iam", "automation"],
        highlight: { en: "Faster rollouts, fewer manual steps.", cs: "Rychlejší rollout, méně manuální práce." }
      },
      {
        title: "SLA Monitoring Dashboard",
        description: {
          en: "Operational dashboard aggregating incident flow, SLA compliance and service health signals for stakeholders.",
          cs: "Provozní dashboard pro incident flow, SLA compliance a health signály pro stakeholdery."
        },
        tags: ["monitoring", "support"],
        highlight: { en: "Clear visibility, calmer on-call.", cs: "Jasná viditelnost, klidnější on-call." }
      },
      {
        title: "Incident Response Playbooks",
        description: {
          en: "Runbooks that turn tribal knowledge into actionable steps — with ownership, escalation paths and checklists.",
          cs: "Runbooky, které převádí tribal knowledge do kroků — s ownershipem, eskalací a checklisty."
        },
        tags: ["support", "automation"],
        highlight: { en: "Less guesswork during outages.", cs: "Méně improvizace při výpadcích." }
      },
      {
        title: "Integration & Reporting Scripts",
        description: {
          en: "Lean scripts for data exports, reconciliation and reporting across systems with attention to performance.",
          cs: "Lehké skripty pro exporty dat, reconciliaci a reporting napříč systémy s důrazem na výkon."
        },
        tags: ["automation", "iam"],
        highlight: { en: "Stable exports, fewer surprises.", cs: "Stabilní exporty, méně překvapení." }
      }
    ]
  },
  skills: {
    headline: { en: "Skills that keep things running.", cs: "Dovednosti, díky kterým to běží." },
    groups: [
      {
        title: { en: "Core", cs: "Core" },
        items: ["IAM / IdM", "Application Support", "Incident Management", "Integrations", "Monitoring"]
      },
      {
        title: { en: "Tools", cs: "Nástroje" },
        items: ["SQL", "JIRA", "Linux", "Windows Server", "Scripting", "Dashboards"]
      }
    ],
    strengthsTitle: { en: "Strengths", cs: "Silné stránky" },
    strengths: [
      { en: "Problem solving & calm triage", cs: "Řešení problémů a klidný triage" },
      { en: "Ownership & reliability", cs: "Ownership a spolehlivost" },
      { en: "Communication & empathy", cs: "Komunikace a empatie" },
      { en: "Documentation-first thinking", cs: "Dokumentace jako standard" }
    ]
  },
  testimonials: {
    headline: { en: "Words from collaborators.", cs: "Co říkají kolegové." },
    items: [
      {
        quote: {
          en: "Matthew is the person you want in the room when things get noisy — structured, calm, and always moving toward resolution.",
          cs: "Matthew je člověk, kterého chcete mít u incidentu — strukturovaný, klidný a vždy směřuje k řešení."
        },
        name: "Team Lead, Enterprise Ops"
      },
      {
        quote: {
          en: "He turns recurring pain into clean automation and documentation. The impact shows up in fewer tickets and better sleep.",
          cs: "Opakované bolesti převádí do automatizace a dokumentace. Dopad je vidět na menším počtu ticketů a lepším spánku."
        },
        name: "Product Owner, Platform"
      }
    ]
  },
  contact: {
    headline: { en: "Let’s build calm systems.", cs: "Pojďme budovat klidné systémy." },
    body: {
      en: "If you’re looking for a dependable system engineer with strong support instincts and a security-aware approach, let’s talk.",
      cs: "Pokud hledáte spolehlivého system engineera se silným support instinktem a bezpečnostním přístupem, ozvěte se."
    },
    form: {
      name: { en: "Name", cs: "Jméno" },
      email: { en: "Email", cs: "Email" },
      message: { en: "Message", cs: "Zpráva" },
      send: { en: "Send message", cs: "Odeslat" },
      note: { en: "This form is a demo (no backend). Use email/LinkedIn for now.", cs: "Formulář je demo (bez backendu). Zatím použijte email/LinkedIn." }
    }
  }
} as const;

export function t(obj: any, lang: Lang) {
  if (typeof obj === "string") return obj;
  if (obj?.[lang]) return obj[lang];
  return obj?.en ?? "";
}
