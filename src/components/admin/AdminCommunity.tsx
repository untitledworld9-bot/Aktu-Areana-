import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Pin, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  Eye, 
  ThumbsUp, 
  Search, 
  Filter, 
  Megaphone, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Clock, 
  UserX, 
  CornerDownRight, 
  X,
  Send,
  Upload
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CommunityPost, CommunityComment, UserProfile, MASTER_ADMIN_EMAILS } from '../../types';
import { useArena } from '../../context/ArenaContext';
import { compressImage } from '../../utils/imageCompressor';

export const AdminCommunity: React.FC = () => {
  const { user, profile, isMasterAdmin, isAdmin } = useArena();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'doubt' | 'notes' | 'discussion' | 'pinned' | 'deleted'>('all');
  
  // Official Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<'discussion' | 'notes' | 'doubt' | 'showcase' | 'general'>('discussion');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementBadge, setAnnouncementBadge] = useState('[OFFICIAL ANNOUNCEMENT]');
  const [announcementImageUrl, setAnnouncementImageUrl] = useState('');
  const [autoPin, setAutoPin] = useState(true);
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [broadcastNotification, setBroadcastNotification] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Thread Inspector Modal State
  const [inspectingPost, setInspectingPost] = useState<CommunityPost | null>(null);
  const [threadComments, setThreadComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Deletion Prompt Modal State
  const [deleteModalPost, setDeleteModalPost] = useState<CommunityPost | null>(null);
  const [deleteReason, setDeleteReason] = useState('Violates platform community guidelines or academic code of conduct.');

  // Subscribe to real-time community posts
  useEffect(() => {
    const q = query(collection(db, 'community_posts'), limit(300));
    const unsub = onSnapshot(q, (snap) => {
      const pList: CommunityPost[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorUid: data.authorUid || data.userId || '',
          authorName: data.authorName || 'Student',
          authorPhoto: data.authorPhoto,
          authorBranch: data.authorBranch || 'CSE',
          authorCollege: data.authorCollege,
          authorRole: data.authorRole || 'student',
          title: data.title || '',
          content: data.content || '',
          category: data.category || 'discussion',
          tags: Array.isArray(data.tags) ? data.tags : [],
          imageUrl: data.imageUrl,
          codeSnippet: data.codeSnippet,
          upvotesCount: data.upvotesCount || 0,
          downvotesCount: data.downvotesCount || 0,
          upvotedBy: data.upvotedBy || [],
          downvotedBy: data.downvotedBy || [],
          commentsCount: data.commentsCount || 0,
          viewsCount: data.viewsCount || 0,
          viewedBy: data.viewedBy || [],
          isPinned: !!data.isPinned,
          isHighlighted: !!data.isHighlighted,
          isDeleted: !!data.isDeleted,
          deletedByAdmin: !!data.deletedByAdmin,
          deletedAt: data.deletedAt,
          deletedByAdminName: data.deletedByAdminName,
          adminDeleteReason: data.adminDeleteReason,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        };
      });

      // Sort: Pinned first, then newest
      pList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setPosts(pList);
      setLoading(false);
    }, (err) => {
      console.warn('Admin community sub error:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Load comments when inspecting a post
  useEffect(() => {
    if (!inspectingPost) {
      setThreadComments([]);
      return;
    }

    setLoadingComments(true);
    const commentsRef = collection(db, 'community_posts', inspectingPost.id, 'comments');
    const unsub = onSnapshot(commentsRef, (snap) => {
      const cList: CommunityComment[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          postId: inspectingPost.id,
          authorUid: data.authorUid || data.userId || '',
          authorName: data.authorName || 'Student',
          authorPhoto: data.authorPhoto,
          authorBranch: data.authorBranch || 'CSE',
          authorCollege: data.authorCollege,
          authorRole: data.authorRole || 'student',
          text: data.text || '',
          createdAt: data.createdAt || new Date().toISOString(),
          likesCount: data.likesCount || 0,
          likedBy: data.likedBy || [],
          replyToCommentId: data.replyToCommentId,
          replyToAuthorName: data.replyToAuthorName,
          replyToAuthorUid: data.replyToAuthorUid,
        };
      }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setThreadComments(cList);
      setLoadingComments(false);
    });

    return () => unsub();
  }, [inspectingPost?.id]);

  // Publish Official Announcement to Community
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('Please fill out the title and content.');
      return;
    }

    setPublishing(true);
    try {
      const adminName = profile?.displayName || user?.displayName || 'Platform Administration';
      const cleanImageUrl = announcementImageUrl.trim() || undefined;

      const formattedTitle = announcementBadge.trim() 
        ? `${announcementBadge.trim()} ${announcementTitle.trim()}`
        : announcementTitle.trim();

      const newPostData = {
        authorUid: user?.uid || 'admin_broadcast',
        authorName: `${adminName} (Admin)`,
        authorPhoto: profile?.photoURL || undefined,
        authorBranch: profile?.branch || 'All Branches',
        authorCollege: 'AKTU Operations Command',
        authorRole: 'admin',
        title: formattedTitle,
        content: announcementContent.trim(),
        category: announcementCategory,
        tags: ['official', 'announcement', 'aktu2026'],
        imageUrl: cleanImageUrl,
        upvotesCount: 1,
        downvotesCount: 0,
        upvotedBy: [user?.uid || 'admin'],
        downvotedBy: [],
        commentsCount: 0,
        viewsCount: 1,
        viewedBy: [user?.uid || 'admin'],
        isPinned: autoPin,
        isHighlighted: autoHighlight,
        pinnedAt: autoPin ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'community_posts'), newPostData);

      // Optional: Broadcast system notification to all students
      if (broadcastNotification) {
        await addDoc(collection(db, 'broadcasts'), {
          title: `📢 Announcement: ${announcementTitle.trim()}`,
          message: announcementContent.slice(0, 140) + '...',
          targetBranch: 'All',
          priority: 'important',
          actionTab: 'community',
          actionUrl: `#community`,
          sender: adminName,
          senderRole: isMasterAdmin ? 'Master Admin' : 'Sub-Admin',
          createdAt: new Date().toISOString(),
        });
      }

      alert('Official Community Announcement published and pinned!');
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementImageUrl('');
    } catch (err: any) {
      console.error('Failed to post announcement:', err);
      alert(`Error publishing announcement: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // Toggle Pin Status
  const handleTogglePin = async (post: CommunityPost) => {
    try {
      const docRef = doc(db, 'community_posts', post.id);
      await updateDoc(docRef, {
        isPinned: !post.isPinned,
        pinnedAt: !post.isPinned ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(`Failed to update pin: ${err.message}`);
    }
  };

  // Toggle Highlight Status
  const handleToggleHighlight = async (post: CommunityPost) => {
    try {
      const docRef = doc(db, 'community_posts', post.id);
      await updateDoc(docRef, {
        isHighlighted: !post.isHighlighted,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(`Failed to update highlight: ${err.message}`);
    }
  };

  // Soft Delete with Admin Reason & Author Notification
  const handleConfirmAdminDelete = async () => {
    if (!deleteModalPost) return;

    try {
      const postRef = doc(db, 'community_posts', deleteModalPost.id);
      const adminName = profile?.displayName || user?.displayName || 'Platform Administration';

      await updateDoc(postRef, {
        isDeleted: true,
        deletedByAdmin: true,
        deletedAt: new Date().toISOString(),
        deletedByAdminName: adminName,
        adminDeleteReason: deleteReason.trim(),
        updatedAt: new Date().toISOString(),
      });

      // Send notification to the author
      if (deleteModalPost.authorUid) {
        await addDoc(collection(db, 'notifications'), {
          userId: deleteModalPost.authorUid,
          type: 'system',
          title: 'Community Post Removed by Administration',
          message: `Your post "${deleteModalPost.title.slice(0, 50)}" was taken down by admin moderation. Reason: ${deleteReason.trim()}`,
          read: false,
          priority: 'important',
          actionTab: 'community',
          createdAt: new Date().toISOString(),
        });
      }

      alert('Post removed and marked "Deleted by Admin". The author has been notified.');
      setDeleteModalPost(null);
    } catch (err: any) {
      alert(`Failed to delete post: ${err.message}`);
    }
  };

  // Restore Post
  const handleRestorePost = async (post: CommunityPost) => {
    try {
      const postRef = doc(db, 'community_posts', post.id);
      await updateDoc(postRef, {
        isDeleted: false,
        deletedByAdmin: false,
        adminDeleteReason: null,
        deletedByAdminName: null,
        updatedAt: new Date().toISOString(),
      });
      alert('Post restored back to community feed!');
    } catch (err: any) {
      alert(`Failed to restore post: ${err.message}`);
    }
  };

  // Permanent Hard Delete
  const handlePermanentPurge = async (post: CommunityPost) => {
    if (!window.confirm(`⚠️ WARNING: Permanently delete post "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'community_posts', post.id));
      alert('Post permanently purged from database.');
      if (inspectingPost?.id === post.id) {
        setInspectingPost(null);
      }
    } catch (err: any) {
      alert(`Failed to purge post: ${err.message}`);
    }
  };

  // Delete Individual Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!inspectingPost) return;
    if (!window.confirm('Delete this comment from discussion thread?')) return;

    try {
      await deleteDoc(doc(db, 'community_posts', inspectingPost.id, 'comments', commentId));
    } catch (err: any) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  // Telemetry Calculations
  const totalPosts = posts.length;
  const totalViews = posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);
  const removedByAdminCount = posts.filter((p) => p.deletedByAdmin || p.isDeleted).length;
  const pinnedCount = posts.filter((p) => p.isPinned).length;

  // Filter posts based on search & tab
  const filteredPosts = posts.filter((p) => {
    // Filter by tab
    if (activeFilter === 'doubt' && p.category !== 'doubt') return false;
    if (activeFilter === 'notes' && p.category !== 'notes') return false;
    if (activeFilter === 'discussion' && p.category !== 'discussion') return false;
    if (activeFilter === 'pinned' && !p.isPinned) return false;
    if (activeFilter === 'deleted' && !p.deletedByAdmin && !p.isDeleted) return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchAuthor = p.authorName.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchBranch = p.authorBranch.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchContent || matchBranch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Community Telemetry Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Total Discussions</span>
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit'] mt-1">
            {totalPosts}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Posts created</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Comments & Replies</span>
            <CornerDownRight className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-400 font-['Outfit'] mt-1">
            {totalComments}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Peer interactions</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Unique Views</span>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit'] mt-1">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Student readership</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Pinned Official</span>
            <Pin className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-['Outfit'] mt-1">
            {pinnedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Top sticky posts</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Admin Moderated</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-['Outfit'] mt-1">
            {removedByAdminCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Takedowns & reports</div>
        </div>
      </div>

      {/* Official Admin Announcement Publisher */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Official Announcement to Community</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish verified high-priority announcements that appear prominently at the top of the community feed.
            </p>
          </div>
        </div>

        <form onSubmit={handlePublishAnnouncement} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Announcement Headline <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. AKTU Odd Semester Exam Schedule Declared"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority Tag / Badge
              </label>
              <select
                value={announcementBadge}
                onChange={(e) => setAnnouncementBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="[OFFICIAL ANNOUNCEMENT]">📢 [OFFICIAL ANNOUNCEMENT]</option>
                <option value="[EXAM CIRCULAR]">🚨 [EXAM CIRCULAR]</option>
                <option value="[ARENA TOURNAMENT]">🏆 [ARENA TOURNAMENT]</option>
                <option value="[COMMUNITY GUIDELINES]">🛡️ [COMMUNITY GUIDELINES]</option>
                <option value="">(No Prefix Badge)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Announcement Message Body <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              placeholder="Provide complete circular details, syllabus updates, tournament guidelines, or important instructions..."
              rows={3}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Attach Image URL (Optional)
              </label>
              <input
                type="text"
                value={announcementImageUrl}
                onChange={(e) => setAnnouncementImageUrl(e.target.value)}
                placeholder="https://... (Diagram, circular notice image, or poster)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Feed Category
              </label>
              <select
                value={announcementCategory}
                onChange={(e) => setAnnouncementCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="discussion">Discussion / General Notice</option>
                <option value="notes">Curriculum Notes & Circulars</option>
                <option value="doubt">Doubt Clearing Announcement</option>
                <option value="showcase">Showcase & Achievements</option>
              </select>
            </div>
          </div>

          {/* Options & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPin}
                  onChange={(e) => setAutoPin(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                />
                <span className="text-slate-300 font-medium">Pin to Feed (Sticky 📌)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoHighlight}
                  onChange={(e) => setAutoHighlight(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                />
                <span className="text-slate-300 font-medium">Glowing Border ✨</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={broadcastNotification}
                  onChange={(e) => setBroadcastNotification(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                />
                <span className="text-slate-300 font-medium">Push Notification to Students 🔔</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-xs font-black transition-transform hover:scale-105 cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Community Feed Moderation Stream */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
              Live Community Feed Moderation ({filteredPosts.length} posts)
            </h3>
            <p className="text-xs text-slate-400">
              Pin official threads, inspect student discussions, take down policy-violating posts with reasons, or restore content.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts or authors..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Posts (${posts.length})` },
            { id: 'pinned', label: `Pinned (${pinnedCount})` },
            { id: 'doubt', label: 'Doubts' },
            { id: 'notes', label: 'Notes & PYQ' },
            { id: 'discussion', label: 'Discussions' },
            { id: 'deleted', label: `Removed by Admin (${removedByAdminCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading community discussions...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No community posts match the current filter or search criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  p.deletedByAdmin || p.isDeleted
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : p.isPinned
                    ? 'bg-slate-950/90 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header: Author & Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                      <span className="font-bold text-slate-200">{p.authorName}</span>
                      <span className="px-2 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                        {p.authorBranch}
                      </span>
                      {p.authorRole === 'admin' && (
                        <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          Admin
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-[11px] font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>

                      {/* Status Badges */}
                      {p.isPinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                          <Pin className="w-3 h-3" /> PINNED
                        </span>
                      )}
                      {p.isHighlighted && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[10px] font-bold">
                          HIGHLIGHTED
                        </span>
                      )}
                      {(p.deletedByAdmin || p.isDeleted) && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> DELETED BY ADMIN
                        </span>
                      )}
                    </div>

                    {/* Post Title */}
                    <h4 className="text-base font-bold text-slate-100 font-['Outfit'] mt-1">
                      {p.title}
                    </h4>

                    {/* Content Snippet */}
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {p.content}
                    </p>

                    {/* Admin Delete Notice banner if removed */}
                    {(p.deletedByAdmin || p.isDeleted) && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Moderation Reason: </span>
                          <span>{p.adminDeleteReason || 'Violating community guidelines.'}</span>
                          {p.deletedByAdminName && (
                            <span className="text-[11px] text-rose-400/80 block mt-0.5">
                              Action taken by: {p.deletedByAdminName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Post Telemetry Counters */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.viewsCount || 0} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.upvotesCount || 0} upvotes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                        <span>{p.commentsCount || 0} comments</span>
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-slate-900 border border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-start">
                    {/* Inspect Thread */}
                    <button
                      onClick={() => setInspectingPost(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                      title="Inspect full thread & comments"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect</span>
                    </button>

                    {/* Toggle Pin */}
                    <button
                      onClick={() => handleTogglePin(p)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                        p.isPinned
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title={p.isPinned ? 'Unpin from feed' : 'Pin to top of feed'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{p.isPinned ? 'Pinned' : 'Pin'}</span>
                    </button>

                    {/* Toggle Highlight */}
                    <button
                      onClick={() => handleToggleHighlight(p)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                        p.isHighlighted
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title="Toggle visual highlight"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{p.isHighlighted ? 'Glow' : 'Normal'}</span>
                    </button>

                    {/* Moderation: Delete with reason OR Restore */}
                    {p.deletedByAdmin || p.isDeleted ? (
                      <button
                        onClick={() => handleRestorePost(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Restore post to community feed"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteModalPost(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Take down post with admin reason"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Moderate</span>
                      </button>
                    )}

                    {/* Permanent Purge */}
                    <button
                      onClick={() => handlePermanentPurge(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Permanent Hard Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thread Inspector Modal */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                  Inspect Discussion Thread
                </h3>
              </div>
              <button
                onClick={() => setInspectingPost(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {/* Full Post Details */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{inspectingPost.authorName}</span>
                  <span className="font-mono">{new Date(inspectingPost.createdAt).toLocaleString()}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  {inspectingPost.title}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {inspectingPost.content}
                </p>

                {inspectingPost.imageUrl && (
                  <img
                    src={inspectingPost.imageUrl}
                    alt="Attached"
                    className="max-h-72 rounded-xl object-contain border border-slate-800 mt-2"
                  />
                )}

                {inspectingPost.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto mt-2">
                    {inspectingPost.codeSnippet.code}
                  </pre>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span>Comments & Replies ({threadComments.length})</span>
                </div>

                {loadingComments ? (
                  <div className="text-xs text-slate-500 text-center py-4">Loading comments...</div>
                ) : threadComments.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">No comments on this post yet.</div>
                ) : (
                  <div className="space-y-2">
                    {threadComments.map((c) => (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 ${
                          c.replyToCommentId ? 'ml-6 border-l-2 border-l-cyan-500/50' : ''
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-bold text-slate-200">{c.authorName}</span>
                            <span className="text-[10px] text-slate-500">({c.authorBranch})</span>
                            {c.replyToAuthorName && (
                              <span className="text-cyan-400 text-[11px]">
                                replying to @{c.replyToAuthorName}
                              </span>
                            )}
                            <span>•</span>
                            <span className="text-[10px] font-mono">{new Date(c.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {c.text}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete with Reason Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                  Moderate & Remove Post
                </h3>
              </div>
              <button
                onClick={() => setDeleteModalPost(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Target Post:</div>
                <div className="font-bold text-slate-100 truncate mt-0.5">
                  {deleteModalPost.title}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Author: {deleteModalPost.authorName} ({deleteModalPost.authorBranch})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select Administrative Reason:
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 mb-2"
                >
                  <option value="Violates platform community guidelines or academic code of conduct.">
                    Violates community guidelines or academic code
                  </option>
                  <option value="Spam, unsolicited advertising, or commercial promotions.">
                    Spam, advertising, or self-promotion
                  </option>
                  <option value="Harassment, abusive language, or toxic peer behavior.">
                    Harassment, abusive language, or toxicity
                  </option>
                  <option value="Off-topic or misleading academic solutions.">
                    Off-topic or misleading examination content
                  </option>
                  <option value="Copyright infringement or unauthorized distribution of paid materials.">
                    Copyright violation of university materials
                  </option>
                </select>

                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  placeholder="Custom explanation sent to the post author..."
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                ℹ️ The post will be hidden from the public feed, marked as "Deleted by Admin" in the author's "My Posts" tab, and an official notification will be dispatched to the student.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteModalPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdminDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Confirm Takedown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
