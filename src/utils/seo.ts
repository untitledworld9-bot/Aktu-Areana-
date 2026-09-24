import { AppTab } from '../types';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  structuredData?: Record<string, any>;
}

const BASE_URL = 'https://ais-pre-dktyuerqdvefeocczz24ys-397457279887.asia-northeast1.run.app';

export const PAGE_SEO_CONFIG: Record<AppTab, PageMetadata> = {
  landing: {
    title: 'AKTU Arena — B.Tech 1st Year Exam Mastery, 1v1 Battleground & Notes',
    description: 'Premier competitive exam prep platform for AKTU B.Tech engineering students (Session 2026–27). Real-time 1v1 duels, AI questions, solved PYQs & notes across 750+ colleges.',
    keywords: 'AKTU, AKTU BTech, AKTU 1st Year, AKTU Notes, AKTU Quantum, AKTU PYQ, Engineering Mathematics 1, C Programming, 1v1 Battle, AKTU Community',
    canonicalPath: '/',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${BASE_URL}/#website`,
          url: BASE_URL,
          name: 'AKTU Arena',
          description: 'Competitive learning terminal and syllabus question vault for AKTU B.Tech engineering students.',
          publisher: {
            '@type': 'Organization',
            name: 'AKTU Arena',
            logo: `${BASE_URL}/pwa-512x512.png`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${BASE_URL}/#practice?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'EducationalOrganization',
          '@id': `${BASE_URL}/#organization`,
          name: 'AKTU Arena',
          url: BASE_URL,
          logo: `${BASE_URL}/pwa-512x512.png`,
          sameAs: ['https://aktu.ac.in'],
        },
      ],
    },
  },
  dashboard: {
    title: 'Home Dashboard — Daily Study Targets & Progress | AKTU Arena',
    description: 'Track daily question goals, review subject accuracy, monitor 750+ college leaderboard rank, and jump into instant practice on AKTU Arena.',
    canonicalPath: '/#dashboard',
  },
  ailab: {
    title: 'Practice Lab — AKTU B.Tech 1st Year Question Bank & AI Tests | AKTU Arena',
    description: 'Topic-wise practice for AKTU B.Tech subjects: Maths (BAS103), C-Programming (BCS101), AI (BAI101), Electrical (BEE101), Electronics (BEC102), Mechanical (BME101).',
    keywords: 'AKTU Practice, BAS103 Questions, BCS101 MCQs, AKTU Semester Questions, Engineering Maths 1 PYQ, AKTU Solved Papers',
    canonicalPath: '/#practice',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'AKTU B.Tech 1st Year Engineering Curriculum Practice',
      description: 'Comprehensive chapter-wise and unit-wise exam practice modules for all AKTU B.Tech first-year engineering disciplines.',
      provider: {
        '@type': 'Organization',
        name: 'AKTU Arena',
        url: BASE_URL,
      },
      educationalLevel: 'Collegiate / Undergraduate Engineering',
      courseCode: 'AKTU-BTECH-YR1',
    },
  },
  battle: {
    title: '1v1 Live Battles — Real-Time Speed Duels & Peer Challenges | AKTU Arena',
    description: 'Compete live in 1v1 speed engineering duels with B.Tech peers across AKTU colleges. Fast-paced 25s timers, live score tracking, and XP multipliers.',
    keywords: 'AKTU 1v1 Battle, Engineering Quiz Duel, AKTU Multiplayer Battle, Live Coding Challenge, AKTU Study Game',
    canonicalPath: '/#battle',
  },
  community: {
    title: 'AKTU Community — Exam Doubts, Notes & PYQ Discussions | AKTU Arena',
    description: 'Collaborate with B.Tech students across 750+ AKTU colleges. Ask doubts, share handwritten unit notes, discuss PYQ solutions, and share campus memes.',
    keywords: 'AKTU Doubt Solving, AKTU Community, BTech Notes, AKTU Handwritten Notes, AKTU PYQ Solutions, College Discussions',
    canonicalPath: '/#community',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'DiscussionForumPosting',
      headline: 'AKTU Engineering Discussion Forum & Knowledge Hub',
      description: 'Peer-to-peer engineering doubts resolution, unit notes exchange, and semester exam discussions for AKTU scholars.',
      url: `${BASE_URL}/#community`,
    },
  },
  leaderboard: {
    title: 'State Leaderboard — College Rankings & Scholar Standings | AKTU Arena',
    description: 'Live university standings across 750+ AKTU colleges. Discover top-ranking engineering branches, individual scholar streaks, and college prestige XP.',
    canonicalPath: '/#leaderboard',
  },
  profile: {
    title: 'Engineer Profile & Academic Achievements | AKTU Arena',
    description: 'View your solved problems record, subject mastery badges, battle win/loss ratio, and college affiliation stats on AKTU Arena.',
    canonicalPath: '/#profile',
  },
  admin: {
    title: 'Management Console & Telemetry | AKTU Arena',
    description: 'Authorized administrative terminal for platform telemetry, live broadcast dispatch, question bank audits, and student usage analytics.',
    canonicalPath: '/#admin',
  },
  about: {
    title: 'About AKTU Arena — Mission, Vision & Engineering Pedagogy',
    description: 'Built specifically for Dr. A.P.J. Abdul Kalam Technical University (AKTU) students to transform B.Tech examination prep into a gamified, high-mastery experience.',
    canonicalPath: '/#about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About AKTU Arena',
      description: 'The premier competitive learning and exam mastery terminal for AKTU engineering scholars.',
      url: `${BASE_URL}/#about`,
    },
  },
  team: {
    title: 'Leadership & Engineering Team | AKTU Arena',
    description: 'Meet the engineers, educators, and moderators building the next-generation learning infrastructure for AKTU B.Tech students.',
    canonicalPath: '/#team',
  },
  contact: {
    title: 'Contact & Student Helpdesk | AKTU Arena',
    description: 'Have questions, syllabus feedback, or need institutional assistance? Reach out to the AKTU Arena technical and moderation team directly.',
    canonicalPath: '/#contact',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact AKTU Arena Support Desk',
      url: `${BASE_URL}/#contact`,
    },
  },
  terms: {
    title: 'Terms & Conditions of Service | AKTU Arena',
    description: 'Read the official terms and conditions, student conduct guidelines, and usage policies for the AKTU Arena platform.',
    canonicalPath: '/#terms',
  },
  privacy: {
    title: 'Privacy Policy & Data Security | AKTU Arena',
    description: 'Learn how AKTU Arena protects your student profile data, privacy, and battle records with industry-standard encryption.',
    canonicalPath: '/#privacy',
  },
  sitemap: {
    title: 'Complete Sitemap & Curriculum Directory — All Pages & Subjects | AKTU Arena',
    description: 'Comprehensive index of all AKTU Arena pages, B.Tech 1st year branches, syllabus subjects (BAS103, BCS101, BAI101, etc.), battle duels, and community hubs.',
    keywords: 'AKTU Sitemap, AKTU Subjects Directory, AKTU BTech Branches, Engineering Syllabus Index, AKTU Portal Links',
    canonicalPath: '/#sitemap',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'AKTU Arena Complete Directory & HTML Sitemap',
      description: 'Comprehensive sitemap indexing all examination resources, branch portals, and community hubs.',
      url: `${BASE_URL}/#sitemap`,
    },
  },
};

/**
 * Injects or updates dynamic SEO tags in document head for Googlebot & rich link previews
 */
export function applyPageSeo(tab: AppTab, customTitle?: string, customDescription?: string) {
  const meta = PAGE_SEO_CONFIG[tab] || PAGE_SEO_CONFIG.landing;
  const title = customTitle || meta.title;
  const description = customDescription || meta.description;
  const canonicalUrl = meta.canonicalPath ? `${BASE_URL}${meta.canonicalPath}` : BASE_URL;

  // 1. Page Title
  document.title = title;

  // 2. Meta Description
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', description);

  // 3. Meta Keywords
  if (meta.keywords) {
    let kwTag = document.querySelector('meta[name="keywords"]');
    if (!kwTag) {
      kwTag = document.createElement('meta');
      kwTag.setAttribute('name', 'keywords');
      document.head.appendChild(kwTag);
    }
    kwTag.setAttribute('content', meta.keywords);
  }

  // 4. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 5. OpenGraph Tags
  const setMetaProperty = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:type', meta.ogType || 'website');

  // 6. Twitter Card Tags
  const setMetaName = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:url', canonicalUrl);

  // 7. Schema.org Structured Data
  if (meta.structuredData) {
    const scriptId = 'aktu-dynamic-seo-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(meta.structuredData);
  }
}
