import React from 'react';
import { 
  Compass, 
  BookOpen, 
  Swords, 
  MessageSquare,
  Trophy, 
  User, 
  ShieldCheck, 
  LogOut, 
  Zap, 
  Flame, 
  Crown,
  Laptop
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { NotificationBell } from './NotificationBell';
import { ThemeSelector } from './ui/ThemeSelector';
import { PWAInstallNavButton } from './PWAInstallNavButton';
import { LevelsRoadmapModal } from './LevelsRoadmapModal';
import { getLevelFromXp } from '../utils/levelProgression';

interface NavigationProps {
  onOpenAuth: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenAuth }) => {
  const { user, profile, currentTab, setCurrentTab, signOutUser, isAdmin, isMasterAdmin } = useArena();
  const [roadmapOpen, setRoadmapOpen] = React.useState(false);
  const levelDef = getLevelFromXp(profile?.xp || 0);

  // Strictly check authorization: only true master admins or accounts with role 'admin' / 'subadmin'
  const isAuthorizedAdmin = Boolean(
    isMasterAdmin || 
    profile?.role === 'admin' || 
    profile?.role === 'subadmin'
  );

  interface NavItem {
    id: 'dashboard' | 'ailab' | 'battle' | 'community' | 'leaderboard' | 'profile' | 'admin';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Command Center', icon: Compass },
    { id: 'ailab', label: 'Practice Lab', icon: BookOpen },
    { id: 'battle', label: 'Live Battle', icon: Swords, badge: '1v1' },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User 
    },
    ...(isAuthorizedAdmin ? [{ 
      id: 'admin', 
      label: 'Admin', 
      icon: isMasterAdmin ? Crown : ShieldCheck, 
      badge: isMasterAdmin ? 'Root' : 'Mod' 
    } as NavItem] : []),
  ];

  const hasSession = !!(user || profile);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#07090E]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo or User Greeting Header */}
        {hasSession && profile ? (
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
            title="Command Center"
          >
            <div className="w-9 h-9 rounded-xl bg-[#07090E] border border-cyan-500/40 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <img 
                src="/icon.svg" 
                alt="AKTU Arena" 
                className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                  {getGreeting()},
                </span>
                <span className="font-extrabold text-sm sm:text-base text-cyan-700 dark:text-cyan-300 font-['Outfit'] truncate max-w-[130px] sm:max-w-[200px]">
                  {profile.displayName || 'Engineer'}
                </span>
                {isAdmin && (
                  <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-500/30 shrink-0">
                    {isMasterAdmin ? 'Master Admin' : 'Admin'}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight truncate hidden xs:block sm:block">
                {profile.branch || 'CSE'} • {profile.collegeName || profile.university || 'AKTU'}
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#07090E] border border-cyan-500/40 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <img 
                src="/icon.svg" 
                alt="AKTU Arena Logo" 
                className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-wider text-slate-100 font-['Outfit']">
                  AKTU <span className="text-cyan-400">ARENA</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  2026–27
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                ENGINEERING EXAM MASTERY & 1V1 CLASH
              </div>
            </div>
          </div>
        )}

        {/* Center Navigation Links (Desktop) */}
        {hasSession ? (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            {navItems.map((item) => {
              if (item.id === 'admin' && !isAuthorizedAdmin) return null;
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'dashboard' ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentTab('ailab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'ailab' ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice Lab</span>
            </button>
            <button
              onClick={() => setCurrentTab('battle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'battle' ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>1v1 Battle</span>
            </button>
            <button
              onClick={() => setCurrentTab('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'community' ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'leaderboard' ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
          </nav>
        )}

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Direct In-App Install Button */}
          <PWAInstallNavButton />

          {/* Theme Selector (Light / Dark / System) */}
          <ThemeSelector />

          {hasSession && profile ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Streak Widget */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Flame className={`w-4 h-4 text-amber-400 ${profile.streak > 0 ? 'fill-amber-400 animate-pulse' : 'opacity-60'}`} />
                <span>{profile.streak ?? 0}d</span>
              </div>

              {/* XP & Level Widget - Clickable to open 25+ Levels Roadmap */}
              <button
                type="button"
                onClick={() => setRoadmapOpen(true)}
                title="Click to view 25+ Levels Roadmap & Perks"
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 text-xs font-semibold cursor-pointer transition-all hover:scale-105 group"
              >
                <span className="text-xs group-hover:scale-125 transition-transform">{levelDef.badge}</span>
                <span className="font-bold text-cyan-200">Lvl {levelDef.level}</span>
                <span className="w-1 h-1 rounded-full bg-cyan-500" />
                <span className="font-mono">{(profile.xp ?? 0).toLocaleString()} XP</span>
              </button>

              {/* Floating Notifications Bell */}
              <NotificationBell />

              {/* User Profile Avatar with custom Photo */}
              <button
                onClick={() => setCurrentTab('profile')}
                title={`Profile: ${profile.displayName} (${profile.collegeName || 'AKTU'})`}
                className={`relative w-8 h-8 rounded-full overflow-hidden p-0.5 border transition-all ${
                  currentTab === 'profile'
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'border-slate-700 hover:border-cyan-400'
                }`}
              >
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-300 text-xs font-bold">
                    {profile.displayName?.[0] || 'A'}
                  </div>
                )}
              </button>

              {/* User Sign out */}
              <button
                onClick={signOutUser}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:border-rose-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors shadow-sm cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Rendered for both Logged In & Guest visitors) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#07090E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 px-2 flex items-center justify-around shadow-lg">
        {hasSession ? (
          navItems.map((item) => {
            // Strictly hide admin tab for non-admins
            if (item.id === 'admin' && !isAuthorizedAdmin) return null;
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive 
                    ? 'text-cyan-700 dark:text-cyan-400 scale-105' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </button>
            );
          })
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-semibold transition-all ${
                currentTab === 'dashboard' ? 'text-cyan-700 dark:text-cyan-400 scale-105' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Compass className={`w-5 h-5 mb-0.5 ${currentTab === 'dashboard' ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">Home</span>
            </button>
            <button
              onClick={() => setCurrentTab('ailab')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-semibold transition-all ${
                currentTab === 'ailab' ? 'text-cyan-700 dark:text-cyan-400 scale-105' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className={`w-5 h-5 mb-0.5 ${currentTab === 'ailab' ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">Practice</span>
            </button>
            <button
              onClick={() => setCurrentTab('battle')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-semibold transition-all ${
                currentTab === 'battle' ? 'text-cyan-700 dark:text-cyan-400 scale-105' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Swords className={`w-5 h-5 mb-0.5 ${currentTab === 'battle' ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">1v1 Battle</span>
            </button>
            <button
              onClick={() => setCurrentTab('community')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-semibold transition-all ${
                currentTab === 'community' ? 'text-cyan-700 dark:text-cyan-400 scale-105' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <MessageSquare className={`w-5 h-5 mb-0.5 ${currentTab === 'community' ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">Community</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-bold text-cyan-600 dark:text-cyan-400 transition-all hover:scale-105"
            >
              <User className="w-5 h-5 mb-0.5 text-cyan-600 dark:text-cyan-400" />
              <span className="truncate">Sign In</span>
            </button>
          </>
        )}
      </div>

      {/* Levels Roadmap Modal */}
      <LevelsRoadmapModal
        isOpen={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
      />
    </>
  );
};
