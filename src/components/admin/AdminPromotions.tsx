import React, { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  MousePointerClick, 
  Clock, 
  Sparkles, 
  Upload, 
  Check, 
  X, 
  ExternalLink, 
  Layers, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Play
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PromotionPopup } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { PromotionPopupModal } from '../PromotionPopupModal';

export const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPromo, setPreviewPromo] = useState<PromotionPopup | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('🔥 SPECIAL EVENT');
  const [actionUrl, setActionUrl] = useState('');
  const [actionButtonText, setActionButtonText] = useState('Explore Now');
  const [displaySeconds, setDisplaySeconds] = useState<number>(8);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time Firestore subscription to all promotions
  useEffect(() => {
    const q = collection(db, 'promotions');
    const unsub = onSnapshot(q, (snapshot) => {
      const list: PromotionPopup[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          imageUrl: data.imageUrl || '',
          badgeText: data.badgeText || '',
          actionUrl: data.actionUrl || '',
          actionButtonText: data.actionButtonText || '',
          displaySeconds: data.displaySeconds !== undefined ? data.displaySeconds : 8,
          isActive: !!data.isActive,
          clickCount: data.clickCount || 0,
          viewCount: data.viewCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
        });
      });

      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPromotions(list);
      setLoading(false);
    }, (err) => {
      console.warn('Admin promotions fetch notice:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Handle local poster image upload and automatic compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      // Compress image to ensure small Firestore doc size
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
      });
      setImageUrl(compressedDataUrl);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setUploadError('Failed to process image file. Please use a smaller JPG/PNG image or paste an image URL.');
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setBadgeText('🔥 SPECIAL EVENT');
    setActionUrl('');
    setActionButtonText('Explore Now');
    setDisplaySeconds(8);
    setIsActive(true);
    setUploadError(null);
  };

  const handleEdit = (p: PromotionPopup) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    setImageUrl(p.imageUrl);
    setBadgeText(p.badgeText || '');
    setActionUrl(p.actionUrl || '');
    setActionButtonText(p.actionButtonText || 'Explore Now');
    setDisplaySeconds(p.displaySeconds !== undefined ? p.displaySeconds : 8);
    setIsActive(p.isActive);
    setUploadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a poster title.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Please upload an image or paste a valid poster image URL.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: imageUrl.trim(),
        badgeText: badgeText.trim(),
        actionUrl: actionUrl.trim(),
        actionButtonText: actionButtonText.trim(),
        displaySeconds: Number(displaySeconds) || 0,
        isActive,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'promotions', editingId), payload);
        alert('Promotion poster updated successfully!');
      } else {
        await addDoc(collection(db, 'promotions'), {
          ...payload,
          clickCount: 0,
          viewCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: 'Platform Admin',
        });
        alert('New promotion poster created and published successfully!');
      }

      handleResetForm();
    } catch (err: any) {
      console.error('Failed to save promotion poster:', err);
      alert(`Error saving poster: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (p: PromotionPopup) => {
    try {
      await updateDoc(doc(db, 'promotions', p.id), {
        isActive: !p.isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, promoTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete poster "${promoTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'promotions', id));
      if (editingId === id) {
        handleResetForm();
      }
    } catch (err: any) {
      alert(`Failed to delete poster: ${err.message}`);
    }
  };

  const handleSampleTemplate = (type: 'hackathon' | 'battle' | 'pyq') => {
    if (type === 'hackathon') {
      setTitle('AKTU TechFest Hackathon 2026');
      setSubtitle('Compete against engineering colleges across UP. Win cash prizes and internship vouchers!');
      setImageUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80');
      setBadgeText('🚀 ANNUAL TECHFEST');
      setActionUrl('#community');
      setActionButtonText('Register Team');
      setDisplaySeconds(8);
      setIsActive(true);
    } else if (type === 'battle') {
      setTitle('Weekend 1v1 Arena Grand Championship');
      setSubtitle('Double XP on all live multiplayer duels this Saturday & Sunday. Climb to Diamond Tier!');
      setImageUrl('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&auto=format&fit=crop&q=80');
      setBadgeText('⚡ 2X XP WEEKEND');
      setActionUrl('#battle');
      setActionButtonText('Enter Battle Arena');
      setDisplaySeconds(7);
      setIsActive(true);
    } else {
      setTitle('AKTU Semester 1 High-Yield PYQs Vault');
      setSubtitle('Solved previous 5 years questions for Maths, Physics & Programming. Verified 2026 syllabus.');
      setImageUrl('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80');
      setBadgeText('📚 EXAM REVISION');
      setActionUrl('#ailab');
      setActionButtonText('Solve PYQs Now');
      setDisplaySeconds(9);
      setIsActive(true);
    }
  };

  const activeCount = promotions.filter((p) => p.isActive).length;
  const totalViews = promotions.reduce((acc, p) => acc + (p.viewCount || 0), 0);
  const totalClicks = promotions.reduce((acc, p) => acc + (p.clickCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Total Posters</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit'] mt-1">
            {promotions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Uploaded posters</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Active Popups</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-['Outfit'] mt-1 flex items-center gap-1.5">
            <span>{activeCount}</span>
            {activeCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Visible to students</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Total Views</span>
            <Eye className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit'] mt-1">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Modal impressions</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Action Clicks</span>
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-['Outfit'] mt-1">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">CTR: {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>

      {/* Upload & Create New Promotion Poster Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-cyan-400" />
              <span>{editingId ? 'Edit Promotion Poster' : 'Create New Promotion Poster Popup'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Popups appear at the center of the screen with a flash blink animation, timer countdown, and close ❌ button.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">Quick Template:</span>
            <button
              type="button"
              onClick={() => handleSampleTemplate('hackathon')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              🚀 Hackathon
            </button>
            <button
              type="button"
              onClick={() => handleSampleTemplate('battle')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              ⚡ 2X Battle
            </button>
            <button
              type="button"
              onClick={() => handleSampleTemplate('pyq')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              📚 PYQs Vault
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Poster Headline / Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AKTU Techfest Hackathon 2026"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Badge Tag (Top Left)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. 🔥 SPECIAL EVENT or 📢 EXAM NOTICE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Description / Subtitle
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Registration now open for all affiliated AKTU colleges. Win prizes & level up your profile!"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Image Upload or URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Poster Image (Upload File or Paste URL) <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste direct image URL (https://...) or upload below"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shrink-0 transition-colors"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Poster File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {uploadError && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Image Preview Box */}
            {imageUrl && (
              <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Poster preview"
                  className="w-20 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                />
                <div className="text-xs text-slate-400 truncate flex-1">
                  <span className="font-bold text-slate-200">Image Ready: </span>
                  <span className="font-mono text-[11px]">{imageUrl.slice(0, 60)}...</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Action Destination Link
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g. #battle, #community, or https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            {/* Action Button Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Action Button Text
              </label>
              <input
                type="text"
                value={actionButtonText}
                onChange={(e) => setActionButtonText(e.target.value)}
                placeholder="e.g. Register Now or Check It Out"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Display Seconds Countdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Auto-Dismiss Timer (Seconds)
              </label>
              <select
                value={displaySeconds}
                onChange={(e) => setDisplaySeconds(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value={5}>5 seconds countdown</option>
                <option value={8}>8 seconds (Recommended)</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={0}>Manual close only (No countdown)</option>
              </select>
            </div>
          </div>

          {/* Active Status Switch & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span className="text-xs font-bold text-slate-200">
                  Active (Show on Student Screen)
                </span>
              </label>
              {isActive && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                  ● Will Popup Immediately
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel Edit
                </button>
              )}

              {/* Test Animation Preview Button */}
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPromo({
                      id: 'preview',
                      title: title || 'Poster Preview',
                      subtitle: subtitle,
                      imageUrl,
                      badgeText,
                      actionUrl,
                      actionButtonText,
                      displaySeconds,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test Live Animation</span>
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-xs font-black transition-transform hover:scale-105 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Poster' : 'Publish Promotion Poster'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Posters Library & Management Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
              Promotional Posters Library ({promotions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Manage existing promo banners, toggle active states, preview entrance animations, or delete anytime.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading posters...</div>
        ) : promotions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Megaphone className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No promotional popups created yet.</p>
            <button
              type="button"
              onClick={() => handleSampleTemplate('hackathon')}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              Load Sample Hackathon Poster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  p.isActive 
                    ? 'bg-slate-950/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-950/40 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-24 h-20 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.badgeText && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {p.badgeText}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isActive 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {p.isActive ? '● ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-['Outfit'] truncate mt-1">
                      {p.title}
                    </h4>
                    {p.subtitle && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {p.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{p.viewCount || 0} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3 text-slate-500" />
                        <span>{p.clickCount || 0} clicks</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{p.displaySeconds ? `${p.displaySeconds}s` : 'Manual'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      p.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {p.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                    <span>{p.isActive ? 'Active' : 'Turn On'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Live Preview */}
                    <button
                      type="button"
                      onClick={() => setPreviewPromo(p)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors"
                      title="Test Live Entrance Animation"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Edit Poster Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete Poster Permanently"
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

      {/* Live Preview Modal */}
      {previewPromo && (
        <PromotionPopupModal
          previewPromo={previewPromo}
          onClosePreview={() => setPreviewPromo(null)}
        />
      )}
    </div>
  );
};
