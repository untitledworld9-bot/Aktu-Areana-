import React, { useState } from 'react';
import { 
  Zap, 
  Compass, 
  Cpu, 
  Swords, 
  Trophy, 
  ShieldCheck, 
  Mail, 
  GraduationCap, 
  Heart,
  ChevronRight,
  ExternalLink,
  Users,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { AppTab } from '../types';

interface FooterProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const { currentTab, setCurrentTab, user, profile } = useArena();

  const handleNavigate = (tab: AppTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModuleClick = (tab: AppTab) => {
    if (!user && !profile) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        handleNavigate('landing');
      }
    } else {
      handleNavigate(tab);
    }
  };

  return (
    <footer className="w-full bg-[#04060A] border-t border-slate-800/80 text-slate-400 relative z-20">
      
      {/* Interactive Top Banner: CTA for Visitors */}
      {!user && !profile && (
        <div className="border-b border-slate-800/60 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-violet-950/30 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AKTU B.Tech Session 2026–27
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">• 750+ Affiliated Colleges</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-['Outfit']">
                Ready to dominate your university semester examinations?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Experience synchronous 1v1 speed duels, infinite AI-generated curriculum practice, and live university leaderboards.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : handleNavigate('landing')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 group cursor-pointer"
              >
                <span>Enter Arena Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand & Institutional Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => handleNavigate((user || profile) ? 'dashboard' : 'landing')}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-10 h-10 rounded-xl bg-[#07090E] border border-cyan-500/40 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 flex items-center justify-center">
                <img 
                  src="/icon.svg" 
                  alt="AKTU Arena Logo" 
                  className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform" 
                />
              </div>
              <div>
                <span className="font-bold text-lg tracking-wider text-slate-100 font-['Outfit']">
                  AKTU <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">ARENA</span>
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                  2026–27
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The official competitive learning terminal built specifically for Dr. A.P.J. Abdul Kalam Technical University (AKTU) B.Tech 1st Year engineering students. Grounded strictly in the 2026–27 NEP syllabus with live 1v1 duels, automated AI question generation, and real-time college rankings.
            </p>

            {/* Official Support & Helpdesk Action */}
            <div className="pt-2">
              <button
                onClick={() => handleNavigate('contact')}
                className="w-full max-w-sm py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-cyan-400 flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Contact & Support Desk</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Arena Modules (Interactive) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arena Modules</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => handleModuleClick('dashboard')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Home Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleModuleClick('ailab')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>AI Curriculum Lab</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleModuleClick('battle')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Live 1v1 Battleground</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleModuleClick('community')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Engineering Community Feed</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleModuleClick('leaderboard')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>College Leaderboards</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleModuleClick('profile')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Student Bio & Telemetry</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Supported AKTU Disciplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
              <span>B.Tech Branches</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                <span>Computer Science (CSE)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></span>
                <span>CSE (AI & Machine Learning)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                <span>Information Technology (IT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Electronics & Comm. (ECE)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>Mechanical & Electrical (ME/EE)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></span>
                <span>Civil, Biotech & Allied</span>
              </li>
            </ul>
          </div>

          {/* Platform Information & Legal Hub */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Institutional Pages</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => handleNavigate('about')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'about' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>About AKTU Arena</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('team')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'team' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Our Core Team</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('contact')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'contact' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Contact & Support Desk</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('terms')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'terms' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('privacy')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'privacy' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('sitemap')}
                  className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left ${currentTab === 'sitemap' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <ChevronRight className="w-3 h-3 text-cyan-500/50 shrink-0" />
                  <span className="text-cyan-300 font-semibold">Portal Sitemap (XML & HTML)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright, Legal Disclaimer & Quick Links */}
      <div className="border-t border-slate-900 bg-[#020306] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div className="space-y-1.5 max-w-xl">
            <div>
              <span className="font-semibold text-slate-300">© 2026–2027 AKTU Arena.</span> All rights reserved.
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Disclaimer:</strong> AKTU Arena is an independent student learning and exam preparation platform. It is not affiliated with, endorsed by, or operated by Dr. A.P.J. Abdul Kalam Technical University (AKTU).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-400">
            <button 
              onClick={() => handleNavigate('about')} 
              className="hover:text-cyan-400 transition-colors"
            >
              About
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => handleNavigate('team')} 
              className="hover:text-cyan-400 transition-colors"
            >
              Leadership Team
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => handleNavigate('contact')} 
              className="hover:text-cyan-400 transition-colors"
            >
              Contact
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => handleNavigate('terms')} 
              className="hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => handleNavigate('privacy')} 
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button 
              onClick={() => handleNavigate('sitemap')} 
              className="hover:text-cyan-400 text-cyan-400 font-semibold transition-colors"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
