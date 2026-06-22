import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Clock, Briefcase, Award, Lock, Play, Trophy, Users, Bell, ChevronRight, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PullToRefresh from "../components/PullToRefresh";
import PageTransition from "../components/PageTransition";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTopEarners, setShowTopEarners] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef(null);
  const bannerTimerRef = useRef(null);

  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    initialData: []
  });

  const { data: allAppUsers = [] } = useQuery({
    queryKey: ['app-users-earnings'],
    queryFn: () => base44.entities.AppUser.list(),
    initialData: [],
    enabled: showTopEarners
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      let currentUser = null;
      const userSource = localStorage.getItem('workden_user_source');
      const savedUserId = localStorage.getItem('workden_login_id');

      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) currentUser = appUsers[0];
      } else if (savedUserId === 'SHIVAM') {
        const savedUser = localStorage.getItem('workden_user');
        if (savedUser) currentUser = JSON.parse(savedUser);
        if (!currentUser?.role) { try { currentUser = await base44.auth.me(); } catch (e) {} }
      } else {
        try { currentUser = await base44.auth.me(); } catch (e) {}
      }

      if (!currentUser) {
        const saved = localStorage.getItem('workden_user');
        if (saved) currentUser = JSON.parse(saved);
      }
      if (!currentUser) return;

      if (userSource === 'appuser' && currentUser.id) {
        try {
          const freshAppUser = await base44.entities.AppUser.filter({ id: currentUser.id });
          if (freshAppUser?.length > 0) currentUser = freshAppUser[0];
        } catch (e) {}
      }

      setUser(currentUser);
      const [userProofs, allTasks] = await Promise.all([
        base44.entities.Proof.filter({ user_id: currentUser.id }),
        base44.entities.Task.list()
      ]);
      setProofs(userProofs);
      setTasks(allTasks);
    } catch (error) {}
  };

  const getSetting = (key) => globalSettings.find(s => s.setting_key === key)?.setting_value || '';

  const getBanners = () => {
    const banners = [];
    // Check all possible banner key formats
    const keys = ['banner_1','banner_2','banner_3','banner_4','banner_5',
                  'homepage_banner_1','homepage_banner_2','homepage_banner_3','homepage_banner_4','homepage_banner_5',
                  'homepage_banner','banner'];
    keys.forEach(key => {
      const val = getSetting(key);
      if (val && val.trim() && !banners.includes(val.trim())) banners.push(val.trim());
    });
    return banners;
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) { const id = url.split('v=')[1]?.split('&')[0]; return id ? `https://www.youtube.com/embed/${id}` : null; }
    if (url.includes('youtu.be/')) { const id = url.split('youtu.be/')[1]?.split('?')[0]; return id ? `https://www.youtube.com/embed/${id}` : null; }
    if (url.includes('drive.google.com/file/d/')) { const id = url.split('/d/')[1]?.split('/')[0]; return id ? `https://drive.google.com/file/d/${id}/preview` : null; }
    return url;
  };

  const tutorialEmbedUrl = getEmbedUrl(getSetting('tutorial_video'));
  const announcement = getSetting('homepage_announcement');
  const announcementColor = getSetting('homepage_announcement_color') || 'blue';
  const banners = getBanners();

  const announcementBg = {
    blue: 'bg-blue-600', green: 'bg-green-600', red: 'bg-red-600',
    orange: 'bg-orange-500', purple: 'bg-purple-600'
  };

  const pendingProofs = proofs.filter(p => p.status === 'pending').length;
  const approvedProofs = proofs.filter(p => p.status === 'approved').length;
  const isUnlocked = user?.is_subscribed || user?.free_unlock || user?.role === 'admin';

  // Auto-scroll banners
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimerRef.current = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % banners.length;
        if (bannerScrollRef.current) {
          const el = bannerScrollRef.current;
          const cardWidth = el.scrollWidth / banners.length;
          el.scrollTo({ left: next * cardWidth, behavior: 'smooth' });
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(bannerTimerRef.current);
  }, [banners.length]);

  const handleBannerScroll = () => {
    if (!bannerScrollRef.current) return;
    const el = bannerScrollRef.current;
    const cardWidth = el.scrollWidth / banners.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveBanner(idx);
  };

  const getTopEarners = () => {
    return [...allAppUsers]
      .filter(u => (u.total_earnings || 0) > 0)
      .sort((a, b) => (b.total_earnings || 0) - (a.total_earnings || 0))
      .slice(0, 10)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  };
  const topEarners = showTopEarners ? getTopEarners() : [];
  const userRank = topEarners.findIndex(e => e.id === user?.id) + 1;

  const taskGradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
  ];

  return (
    <PullToRefresh onRefresh={loadData}>
      <PageTransition>
        <div className="min-h-screen bg-white pb-28">

          {/* ── HERO HEADER ── */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-6 pb-8 md:px-8 md:pt-8 md:pb-12">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-indigo-200 text-sm font-medium">👋 Welcome back</p>
                <h1 className="text-white text-xl md:text-3xl font-black mt-0.5 leading-tight">
                  {user?.full_name || '...'}
                </h1>
                <p className="text-indigo-300 text-xs md:text-sm mt-0.5">{user?.email || user?.login_user_id || ''}</p>
                {isUnlocked ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs text-white font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
                    {user?.free_unlock ? 'Admin Unlocked' : 'Subscription Active'}
                  </span>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs text-white font-semibold">
                    <Lock className="w-3 h-3" /> Subscribe to unlock tasks
                  </span>
                )}
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white flex-shrink-0 shadow-xl border-2 border-white/20"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                {user?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            </div>

            {/* Stats pills inside header */}
            <div className="max-w-5xl mx-auto mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-400/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Completed</p>
                  <p className="text-white text-xl font-black leading-none">{approvedProofs}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Pending</p>
                  <p className="text-white text-xl font-black leading-none">{pendingProofs}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 space-y-5">

            {/* ── ANNOUNCEMENT ── */}
            {announcement && (
              <div className={`${announcementBg[announcementColor] || 'bg-blue-600'} rounded-2xl px-4 py-3 flex items-start gap-3 shadow-md`}>
                <Bell className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm font-semibold leading-snug">{announcement}</p>
              </div>
            )}

            {/* ── SCROLLABLE BANNER CAROUSEL (SonyLiv style) ── */}
            {banners.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div
                  ref={bannerScrollRef}
                  onScroll={handleBannerScroll}
                  className="flex overflow-x-auto scroll-smooth"
                  style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {banners.map((src, i) => (
                    <div key={i} className="flex-shrink-0 w-full" style={{ scrollSnapAlign: 'start' }}>
                      <img
                        src={src}
                        alt={`Banner ${i + 1}`}
                        className="w-full object-cover"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={e => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
                {/* Dots */}
                {banners.length > 1 && (
                  <div className="flex justify-center gap-1.5 py-2 bg-gray-50">
                    {banners.map((_, i) => (
                      <button key={i} onClick={() => {
                        setActiveBanner(i);
                        if (bannerScrollRef.current) {
                          const el = bannerScrollRef.current;
                          const cardWidth = el.scrollWidth / banners.length;
                          el.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                        }
                      }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'bg-orange-500 w-5' : 'bg-gray-300 w-1.5'}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WHATSAPP CHANNEL ── */}
            {isUnlocked && (
              <a href="https://whatsapp.com/channel/0029VbBtRxwAe5Vhk05yV93M" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Join WhatsApp Channel</p>
                  <p className="text-gray-500 text-xs">Updates, tips & announcements</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            )}

            {/* ── TUTORIAL VIDEO ── */}
            {tutorialEmbedUrl && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowTutorial(true)}>
                <div className="relative flex items-center gap-4 px-4 py-4"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #c31432)' }}>
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 border-4 border-red-400/40 shadow-xl">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                  <div>
                    <p className="text-white font-black text-base">🎓 Platform Tutorial</p>
                    <p className="text-white/60 text-sm">How to use WorkDen & earn money</p>
                  </div>
                  <div className="ml-auto bg-black/50 text-white text-xs px-2 py-1 rounded-lg font-bold flex-shrink-0">▶ Watch</div>
                </div>
              </div>
            )}

            {/* ── TOP EARNERS ── */}
            <button onClick={() => setShowTopEarners(true)}
              className="w-full bg-white rounded-2xl shadow-md border border-gray-100 px-4 py-4 flex items-center gap-4 hover:shadow-lg transition-shadow text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)' }}>
                🏆
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-black text-base">Top Earners Leaderboard</p>
                <p className="text-gray-500 text-xs mt-0.5">See who's earning the most this month</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* ── AVAILABLE TASKS ── */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-gray-900 font-bold text-base">Available Tasks</h2>
                </div>
                <Link to={createPageUrl("Tasks")}>
                  <span className="text-indigo-600 text-xs font-semibold">View All →</span>
                </Link>
              </div>

              <div className="p-3">
                {!isUnlocked ? (
                  <div className="text-center py-6">
                    <Lock className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                    <p className="text-gray-800 font-bold mb-1">Tasks Locked</p>
                    <p className="text-gray-500 text-xs mb-4">Subscribe for ₹999 to unlock all tasks and start earning</p>
                    <Link to={createPageUrl("Tasks")}>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-600 font-bold px-8">Subscribe Now — ₹999</Button>
                    </Link>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tasks.slice(0, 6).map((task, i) => (
                      <Link key={task.id} to={createPageUrl("Tasks")}>
                        <div className="flex items-center gap-3 rounded-xl p-3 border border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${taskGradients[i % taskGradients.length]} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-semibold text-sm truncate">{task.name}</p>
                            <p className="text-gray-400 text-xs truncate">{task.description || 'Complete to earn rewards'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No tasks available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RECENT SUBMISSIONS ── */}
            {proofs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h2 className="text-gray-900 font-bold text-base">Recent Submissions</h2>
                  </div>
                  <Link to={createPageUrl("SubmittedWork")}>
                    <span className="text-purple-600 text-xs font-semibold">View All →</span>
                  </Link>
                </div>
                <div className="p-3 space-y-2">
                  {proofs.slice(0, 4).map(proof => (
                    <div key={proof.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-gray-100 bg-gray-50">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-gray-900 font-semibold text-sm truncate">{proof.work_type}</p>
                        <p className="text-gray-400 text-xs">{new Date(proof.submitted_date || proof.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                        proof.status === 'approved' ? 'bg-green-100 text-green-700' :
                        proof.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-700'}`}>
                        {proof.status === 'approved' ? '✓ Approved' : proof.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CTA ── */}
            <div className="rounded-2xl p-6 text-center shadow-lg overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
              <p className="text-white text-xl font-black mb-1 relative z-10">💰 Ready to Earn More?</p>
              <p className="text-indigo-200 text-sm mb-5 relative z-10">Complete tasks daily and get paid!</p>
              <Link to={createPageUrl("Tasks")}>
                <Button className="bg-white text-indigo-700 hover:bg-gray-100 font-bold px-10 py-2.5 shadow-lg relative z-10">
                  Browse All Tasks →
                </Button>
              </Link>
            </div>

          </div>

          {/* ── TUTORIAL DIALOG ── */}
          <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
            <DialogContent className="max-w-4xl w-full p-0 bg-black border-none">
              <div className="aspect-video w-full">
                {tutorialEmbedUrl && <iframe src={tutorialEmbedUrl} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen title="Tutorial" />}
              </div>
            </DialogContent>
          </Dialog>

          {/* ── TOP EARNERS DIALOG ── */}
          <Dialog open={showTopEarners} onOpenChange={setShowTopEarners}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <Trophy className="w-6 h-6 text-yellow-500" /> Top Earners 🏆
                </DialogTitle>
              </DialogHeader>
              {user && (
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between">
                  <div><p className="text-xs text-blue-600 font-semibold">Your Position</p><p className="font-bold text-blue-900">{user.full_name}</p></div>
                  <div className="text-right"><p className="text-xs text-blue-600">Rank #{userRank > 0 ? userRank : 'N/A'}</p></div>
                </div>
              )}
              <div className="space-y-2">
                {topEarners.map(earner => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={earner.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${earner.id === user?.id ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100'}`}>
                      <span className="text-2xl font-bold w-10 text-center">{medals[earner.rank - 1] || `#${earner.rank}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{earner.full_name || 'User'} {earner.id === user?.id && '(You)'}</p>
                        <p className="text-xs text-gray-500">{earner.city || 'India'}</p>
                      </div>
                      <p className="font-bold text-green-600 text-lg">₹{Number(earner.total_earnings || 0).toFixed(0)}</p>
                    </div>
                  );
                })}
                {topEarners.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No earners data yet</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </PageTransition>
    </PullToRefresh>
  );
}