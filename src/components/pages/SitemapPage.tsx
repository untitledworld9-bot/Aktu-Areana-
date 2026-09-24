import React, { useState } from 'react';
import { 
  Map, 
  Home, 
  BookOpen, 
  Swords, 
  MessageSquare, 
  Trophy, 
  User, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Check, 
  Copy, 
  Search, 
  Layers, 
  GraduationCap, 
  ChevronRight, 
  Sparkles, 
  Globe, 
  Code, 
  Terminal, 
  Cpu 
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useArena } from '../../context/ArenaContext';
import { AppTab, Branch } from '../../types';
import { AKTU_BRANCHES } from '../../data/branches';
import { INITIAL_AKTU_CURRICULUM } from '../../data/aktuCurriculum';

export const SitemapPage: React.FC = () => {
  const { setCurrentTab, user, profile, isAdmin } = useArena();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleNavigate = (tab: AppTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const origin = window.location.origin;

  // Primary Platform Pages
  const mainPages: Array<{
    title: string;
    tab: AppTab;
    hash: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    authRequired?: boolean;
  }> = [
    {
      title: 'Home (Dashboard)',
      tab: 'dashboard',
      hash: '#dashboard',
      desc: 'Central overview of your daily question targets, study streak, accuracy metrics, and quick practice launchpad.',
      icon: Home,
      badge: 'Core Hub',
      authRequired: true,
    },
    {
      title: 'Practice Lab (AI Lab)',
      tab: 'ailab',
      hash: '#practice',
      desc: 'Unit-wise and topic-wise examination practice, customizable difficulty levels, timers, and step-by-step verified explanations.',
      icon: BookOpen,
      badge: 'AI Powered',
    },
    {
      title: '1v1 Live Battle Arena',
      tab: 'battle',
      hash: '#battle',
      desc: 'Real-time multiplayer peer duels, custom private room invites, fast-paced 25-second rounds, and live score synchronization.',
      icon: Swords,
      badge: 'Live Multiplayer',
    },
    {
      title: 'AKTU Engineering Community',
      tab: 'community',
      hash: '#community',
      desc: 'State-wide student discussion forum for exam doubts, solved unit notes, PYQ solution sharing, and campus banter.',
      icon: MessageSquare,
      badge: 'Active Feed',
    },
    {
      title: 'University Leaderboard',
      tab: 'leaderboard',
      hash: '#leaderboard',
      desc: 'State-level rankings across 750+ AKTU colleges, branch prestige scores, and top student scholar honor rolls.',
      icon: Trophy,
      badge: '750+ Colleges',
    },
    {
      title: 'Student Engineer Profile',
      tab: 'profile',
      hash: '#profile',
      desc: 'Personal academic history, subject-by-subject mastery badges, battle record, and college affiliation settings.',
      icon: User,
      authRequired: true,
    },
    {
      title: 'Admin Operations Console',
      tab: 'admin',
      hash: '#admin',
      desc: 'Authorized control center for broadcast announcements, question bank oversight, and platform telemetry.',
      icon: ShieldCheck,
      badge: 'Admin Only',
      authRequired: true,
    },
  ];

  // Institutional Pages
  const institutionalPages: Array<{
    title: string;
    tab: AppTab;
    hash: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      title: 'About AKTU Arena',
      tab: 'about',
      hash: '#about',
      desc: 'Our educational mission, founding pedagogy, and technical architecture tailored specifically for AKTU students.',
      icon: GraduationCap,
    },
    {
      title: 'Leadership & Core Team',
      tab: 'team',
      hash: '#team',
      desc: 'Meet the engineers, university alumni, and faculty advisors creating the AKTU Arena ecosystem.',
      icon: User,
    },
    {
      title: 'Contact & Student Helpdesk',
      tab: 'contact',
      hash: '#contact',
      desc: 'Direct communication channels for student queries, syllabus feedback, and institutional partnerships.',
      icon: MessageSquare,
    },
    {
      title: 'Terms & Conditions',
      tab: 'terms',
      hash: '#terms',
      desc: 'Official platform service agreement, student honor code, and academic integrity policies.',
      icon: FileText,
    },
    {
      title: 'Privacy Policy',
      tab: 'privacy',
      hash: '#privacy',
      desc: 'Data protection standards, encryption details, and student privacy commitments.',
      icon: ShieldCheck,
    },
  ];

  // Filtered lists
  const filterText = searchTerm.toLowerCase().trim();

  const filteredMain = mainPages.filter(
    (p) =>
      p.title.toLowerCase().includes(filterText) ||
      p.desc.toLowerCase().includes(filterText) ||
      p.hash.toLowerCase().includes(filterText)
  );

  const filteredInstitutional = institutionalPages.filter(
    (p) =>
      p.title.toLowerCase().includes(filterText) ||
      p.desc.toLowerCase().includes(filterText) ||
      p.hash.toLowerCase().includes(filterText)
  );

  const filteredBranches = AKTU_BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(filterText) || b.code.toLowerCase().includes(filterText)
  );

  const filteredSubjects = INITIAL_AKTU_CURRICULUM.filter(
    (s) =>
      s.subjectName.toLowerCase().includes(filterText) ||
      s.subjectId.toLowerCase().includes(filterText) ||
      s.code.toLowerCase().includes(filterText) ||
      s.units.some((u) => u.topics.some((t) => t.toLowerCase().includes(filterText)))
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A0E17] to-cyan-950/30 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>GOOGLE SEO & PLATFORM DIRECTORY</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">XML & HTML Sitemaps</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 font-['Outfit'] tracking-wide">
              Complete Sitemap & Portal Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explore the entire architecture of AKTU Arena. Every module, B.Tech 1st Year branch curriculum, unit question bank, and institutional document is fully indexable and accessible below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <Code className="w-4 h-4" />
              <span>View Raw sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>View robots.txt</span>
            </a>
          </div>
        </div>

        {/* Live Search Filter */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sitemap for subjects, branches, units, or modules..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Main Platform Engines */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">
            Core Examination Platforms & Engines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMain.map((item) => {
            const Icon = item.icon;
            const fullUrl = `${origin}/${item.hash}`;
            return (
              <GlassCard key={item.hash} className="p-5 flex flex-col justify-between space-y-3 group hover:border-cyan-500/40 transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-500">
                    {item.hash}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyLink(fullUrl)}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                      title="Copy Section URL"
                    >
                      {copiedUrl === fullUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleNavigate(item.tab)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Section 2: AKTU Official First Year Subjects (Session 2026-27) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">
                AKTU 2026–27 Syllabus & Subject Vaults
              </h2>
              <p className="text-xs text-slate-400">
                Official course codes, subject units, and question banks
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800">
            {filteredSubjects.length} Indexed Subjects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const subjectUrl = `${origin}/#practice?subject=${sub.subjectId}`;
            return (
              <GlassCard key={sub.subjectId} className="p-4 space-y-3 hover:border-violet-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60">
                      {sub.subjectId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {sub.units.length} Syllabus Units
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                    {sub.subjectName}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {sub.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {sub.units.slice(0, 3).map((u) => (
                      <span key={u.unitNumber} className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        U{u.unitNumber}: {u.unitTitle}
                      </span>
                    ))}
                    {sub.units.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{sub.units.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                    #practice?subject={sub.subjectId}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyLink(subjectUrl)}
                      className="p-1 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800"
                      title="Copy direct subject link"
                    >
                      {copiedUrl === subjectUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleNavigate('ailab')}
                      className="px-2.5 py-1 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[11px] font-semibold"
                    >
                      Practice
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Section 3: AKTU Engineering Branches */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">
              AKTU B.Tech Engineering Disciplines (14 Branches)
            </h2>
            <p className="text-xs text-slate-400">
              Discipline-specific subject mappings & curriculum paths
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredBranches.map((br) => {
            const branchUrl = `${origin}/#practice?branch=${encodeURIComponent(br.code)}`;
            return (
              <div
                key={br.code}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-200">
                    {br.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                    Code: {br.code}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <button
                    onClick={() => copyLink(branchUrl)}
                    className="text-slate-500 hover:text-slate-300"
                    title="Copy branch link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleNavigate('ailab')}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    View Subjects
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Institutional & Legal Documents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">
            Institutional, Legal & Compliance Portals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstitutional.map((item) => {
            const Icon = item.icon;
            const fullUrl = `${origin}/${item.hash}`;
            return (
              <GlassCard key={item.hash} className="p-4 space-y-2.5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-500">
                    {item.hash}
                  </span>
                  <button
                    onClick={() => handleNavigate(item.tab)}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                  >
                    Read Page
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
