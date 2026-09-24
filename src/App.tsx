import React, { useState, useEffect } from 'react';
import { ArenaProvider, useArena } from './context/ArenaContext';
import { ThemeProvider } from './context/ThemeContext';
import { BackgroundGlow } from './components/ui/BackgroundGlow';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { Dashboard } from './components/Dashboard';
import { AILab } from './components/AILab';
import { LiveBattle } from './components/LiveBattle';
import { CommunityView } from './components/CommunityView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PracticeSession } from './components/PracticeSession';
import { PWAInstallModal } from './components/PWAInstallModal';
import { MissingCollegePrompt } from './components/MissingCollegePrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LiveChallengePopup } from './components/LiveChallengePopup';
import { LiveBroadcastAlert } from './components/LiveBroadcastAlert';
import { PromotionPopupModal } from './components/PromotionPopupModal';
import { AccountSuspendedNotice } from './components/AccountSuspendedNotice';
import { Footer } from './components/Footer';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { TermsPage } from './components/pages/TermsPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TeamPage } from './components/pages/TeamPage';
import { SitemapPage } from './components/pages/SitemapPage';
import { applyPageSeo } from './utils/seo';
import { Question, Subject, AppTab } from './types';
import { Swords, X, Zap, LogIn, BookOpen } from 'lucide-react';

const ArenaApp: React.FC = () => {
  const { 
    user, 
    profile, 
    loading, 
    currentTab, 
    setCurrentTab, 
    pendingBattleRoomId, 
    setPendingBattleRoomId,
    isAdmin,
    isMasterAdmin 
  } = useArena();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // When launching as installed PWA / standalone on mobile:
  // If not logged in, auto-open AuthModal so the student can sign in with 1-click Google immediately!
  useEffect(() => {
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      new URLSearchParams(window.location.search).get('source') === 'pwa'
    );

    if (user || isStandalone) {
      document.body.classList.add('app-mode');
    } else {
      document.body.classList.remove('app-mode');
    }

    if (!user && !profile && !loading && isStandalone) {
      setAuthModalOpen(true);
    }
  }, [user, profile, loading]);

  const canAccessAdmin = Boolean(
    isMasterAdmin || 
    profile?.role === 'admin' || 
    profile?.role === 'subadmin'
  );

  // Safety redirect: If a non-admin lands on the admin tab, redirect to dashboard immediately
  useEffect(() => {
    if (currentTab === 'admin' && !canAccessAdmin) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, canAccessAdmin, setCurrentTab]);

  // Synchronize Google SEO Meta tags & JSON-LD schema on route changes
  useEffect(() => {
    applyPageSeo(currentTab);
  }, [currentTab]);

  // Handle URL hash changes for Google SEO indexing & direct links
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('post')) {
          setCurrentTab('community');
          return;
        }

        const hash = window.location.hash.replace(/^#/, '').toLowerCase();
        if (!hash) return;
        
        const cleanHash = hash.split('?')[0];
        const tabMap: Record<string, AppTab> = {
          dashboard: 'dashboard',
          ailab: 'ailab',
          practice: 'ailab',
          battle: 'battle',
          community: 'community',
          leaderboard: 'leaderboard',
          profile: 'profile',
          admin: 'admin',
          about: 'about',
          team: 'team',
          contact: 'contact',
          terms: 'terms',
          privacy: 'privacy',
          sitemap: 'sitemap',
        };

        if (tabMap[cleanHash]) {
          const target = tabMap[cleanHash];
          if (target === 'admin' && !canAccessAdmin) {
            setCurrentTab('dashboard');
          } else {
            setCurrentTab(target);
          }
        }
      } catch (err) {
        console.warn('Hash navigation parse notice:', err);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentTab]);

  // Active practice challenge modal
  const [practiceSession, setPracticeSession] = useState<{
    questions: Question[];
    subject: Subject | null;
    topic: string;
  } | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartPracticeChallenge = (questions: Question[], subject: Subject, topic: string) => {
    setPracticeSession({ questions, subject, topic });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-200">
        <BackgroundGlow />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 animate-spin flex items-center justify-center p-1">
            <div className="w-full h-full bg-[#07090E] rounded-xl" />
          </div>
          <div className="text-sm font-bold tracking-wider text-cyan-400 uppercase font-['Outfit']">
            Loading AKTU Arena Terminal...
          </div>
        </div>
      </div>
    );
  }

  // Public visitor view (Supports indexable institutional, sitemap & about pages)
  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 selection:bg-cyan-500 selection:text-slate-950 font-sans flex flex-col justify-between w-full max-w-full overflow-x-hidden relative">
        <BackgroundGlow />
        <Navigation onOpenAuth={() => handleOpenAuth('login')} />
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
          {currentTab === 'about' && (
            <div className="pt-20"><AboutPage /></div>
          )}
          {currentTab === 'team' && (
            <div className="pt-20"><TeamPage /></div>
          )}
          {currentTab === 'contact' && (
            <div className="pt-20"><ContactPage /></div>
          )}
          {currentTab === 'terms' && (
            <div className="pt-20"><TermsPage /></div>
          )}
          {currentTab === 'privacy' && (
            <div className="pt-20"><PrivacyPage /></div>
          )}
          {currentTab === 'sitemap' && (
            <div className="pt-16 sm:pt-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto"><SitemapPage /></div>
          )}
          {currentTab === 'community' && (
            <div className="pt-16 sm:pt-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <CommunityView onOpenAuth={handleOpenAuth} />
            </div>
          )}
          {currentTab === 'dashboard' && (
            <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
              {/* Guest Engineer Welcome Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-violet-950/70 border border-cyan-500/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-slate-100 font-['Outfit']">
                        AKTU Arena Command Center
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Guest Mode
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Explore official B.Tech 1st Year syllabus subjects. Sign in with Google to save your level progression & compete in live 1v1 battles!
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-xs font-extrabold cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    Sign In with Google
                  </button>
                </div>
              </div>

              <Dashboard 
                onStartAILab={() => handleOpenAuth('login')}
                onStartBattle={() => handleOpenAuth('login')}
                onQuickPractice={() => handleOpenAuth('login')}
              />
            </div>
          )}
          {currentTab === 'ailab' && (
            <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3.5 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 font-['Outfit']">
                  AKTU AI Practice Lab & Question Vault
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Generate chapter-wise practice problems, solved PYQ solutions, and track your syllabus mastery score for AKTU B.Tech 1st Year.
                </p>
              </div>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-sm font-extrabold cursor-pointer shadow-lg transition-transform hover:scale-105"
              >
                Sign In to Start Practice
              </button>
            </div>
          )}
          {currentTab === 'battle' && (
            <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Swords className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 font-['Outfit']">
                  AKTU 1v1 Engineering Battle Arena
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                  Challenge engineering peers from across 750+ AKTU colleges in live timed duels with synchronized questions and MMR ratings.
                </p>
              </div>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-sm font-extrabold cursor-pointer shadow-lg transition-transform hover:scale-105"
              >
                Sign In to Enter Battle Queue
              </button>
            </div>
          )}
          {currentTab === 'leaderboard' && (
            <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <LeaderboardView />
            </div>
          )}
          {currentTab === 'profile' && (
            <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-3.5 sm:px-6 lg:px-8 max-w-md mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <LogIn className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100 font-['Outfit']">
                  Student Profile & Progression
                </h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">
                  Sign in to view your semester attendance streak, college badges, subject mastery radars, and match duels.
                </p>
              </div>
              <button
                onClick={() => handleOpenAuth('login')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-sm font-extrabold cursor-pointer shadow-lg transition-transform hover:scale-105"
              >
                Sign In to View Profile
              </button>
            </div>
          )}
          {currentTab === 'landing' && (
            <LandingPage onOpenAuth={handleOpenAuth} />
          )}
        </main>

        <Footer onOpenAuth={handleOpenAuth} />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />

        {/* Live Admin Broadcast Alerts */}
        <LiveBroadcastAlert />

        {/* Global Promotional Poster Popups */}
        <PromotionPopupModal />

        {/* Battle Room URL Invite Banner on Landing */}
        {pendingBattleRoomId && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-4 rounded-2xl bg-gradient-to-r from-violet-950/95 via-slate-900/95 to-slate-950/95 border-2 border-cyan-500/80 shadow-[0_0_40px_rgba(6,182,212,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Swords className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 font-['Outfit']">
                    1v1 Battle Invite Detected!
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Room: <span className="font-mono font-bold text-cyan-300">{pendingBattleRoomId}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-xs font-extrabold cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  Join Duel
                </button>
                <button
                  onClick={() => {
                    setPendingBattleRoomId(null);
                    try {
                      window.history.replaceState({}, document.title, window.location.pathname);
                    } catch (e) {}
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Dismiss invite"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PWA Always Prompt & Offline Status */}
        <PWAInstallModal />
        <OfflineIndicator />
      </div>
    );
  }

  // Suspended or Banned Notice
  if (profile && (profile.isBanned || profile.status === 'banned' || profile.status === 'suspended')) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 selection:bg-cyan-500 selection:text-slate-950 font-sans flex flex-col justify-between">
        <BackgroundGlow />
        <Navigation onOpenAuth={() => handleOpenAuth('login')} />
        <main className="pt-20 flex-1">
          <AccountSuspendedNotice />
        </main>
        <PWAInstallModal />
        <OfflineIndicator />
      </div>
    );
  }

  // Signed in, but not onboarded -> Onboarding Wizard
  if (profile && !profile.isOnboarded) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 selection:bg-cyan-500 selection:text-slate-950 font-sans flex flex-col justify-between">
        <BackgroundGlow />
        <Navigation onOpenAuth={() => handleOpenAuth('login')} />
        <main className="pt-16 sm:pt-18 flex-1">
          <ProfileOnboarding />
        </main>
        <PWAInstallModal />
        <OfflineIndicator />
      </div>
    );
  }

  // Signed in & Onboarded -> Main Application Shell (Platform workspace without marketing footer)
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 selection:bg-cyan-500 selection:text-slate-950 font-sans flex flex-col justify-between pb-20 md:pb-0 w-full max-w-full overflow-x-hidden relative">
      <BackgroundGlow />
      <Navigation onOpenAuth={() => handleOpenAuth('login')} />

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-16 sm:pt-20 flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard
            onStartAILab={() => setCurrentTab('ailab')}
            onStartBattle={() => setCurrentTab('battle')}
            onQuickPractice={(subj, topic) => {
              setCurrentTab('ailab');
            }}
          />
        )}

        {currentTab === 'ailab' && (
          <AILab onStartChallenge={handleStartPracticeChallenge} />
        )}

        {currentTab === 'battle' && <LiveBattle />}

        {currentTab === 'community' && <CommunityView onOpenAuth={handleOpenAuth} />}

        {currentTab === 'leaderboard' && <LeaderboardView />}

        {currentTab === 'profile' && <ProfileView />}

        {currentTab === 'admin' && (
          canAccessAdmin ? (
            <AdminDashboard />
          ) : (
            <Dashboard
              onStartAILab={() => setCurrentTab('ailab')}
              onStartBattle={() => setCurrentTab('battle')}
              onQuickPractice={(subj, topic) => setCurrentTab('ailab')}
            />
          )
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'contact' && <ContactPage />}

        {currentTab === 'terms' && <TermsPage />}

        {currentTab === 'privacy' && <PrivacyPage />}

        {currentTab === 'team' && <TeamPage />}

        {currentTab === 'sitemap' && <SitemapPage />}
      </main>

      {/* Active Interactive Practice / Challenge Overlay */}
      {practiceSession && (
        <PracticeSession
          questions={practiceSession.questions}
          subject={practiceSession.subject}
          topic={practiceSession.topic}
          onClose={() => setPracticeSession(null)}
        />
      )}

      {/* Auth Modal for switching accounts */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* College Information Check & Prompt */}
      <MissingCollegePrompt onRedirectToProfile={() => setCurrentTab('profile')} />

      {/* Real-time Global Live Challenge Popup across all pages */}
      <LiveChallengePopup />

      {/* Real-time Global Admin Broadcast Alert */}
      <LiveBroadcastAlert />

      {/* Global Promotional Poster Popups */}
      <PromotionPopupModal />

      {/* PWA 10-second Bottom Prompt & Offline Status */}
      <PWAInstallModal />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ArenaProvider>
        <ArenaApp />
      </ArenaProvider>
    </ThemeProvider>
  );
}
