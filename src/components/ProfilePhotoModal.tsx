import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Sparkles, 
  UserCircle 
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { compressProfileImage } from '../utils/imageCompressor';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces&auto=format&q=80',
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateUserProfile } = useArena();
  const [selectedPhoto, setSelectedPhoto] = useState<string>(profile?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }
    try {
      setIsUploading(true);
      const compressed = await compressProfileImage(file, 256);
      setSelectedPhoto(compressed);
    } catch (err) {
      console.error('Error reading photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    await updateUserProfile({ photoURL: selectedPhoto });
    setIsUploading(false);
    onClose();
  };

  const handleRemove = async () => {
    setSelectedPhoto('');
    await updateUserProfile({ photoURL: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0B0F19] to-[#07090E] border border-cyan-500/40 p-6 shadow-[0_15px_50px_rgba(6,182,212,0.3)] z-10 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100 font-['Outfit']">
                  Update Profile Photo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Upload an image or pick a social avatar for your arena identity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current / Preview Avatar */}
          <div className="flex flex-col items-center justify-center my-5">
            <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_25px_rgba(6,182,212,0.45)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl font-extrabold text-cyan-300 font-['Outfit']">
                    {profile?.displayName?.[0] || 'A'}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 mt-2">
              {profile?.displayName || 'Engineering Student'}
            </span>
            <span className="text-[10px] text-slate-500">
              Visible on Live Battles, Leaderboard, and Profile
            </span>
          </div>

          {/* File Upload Drop Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/40'
                : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-cyan-950/20'
            }`}
          >
            <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-200">
              {isUploading ? 'Compressing & processing...' : 'Tap to upload photo from your device'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Supports JPG, PNG, WebP • Drag & drop supported
            </div>
          </div>

          {/* Avatar Presets */}
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Or Select an Avatar Preset</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhoto(url)}
                  className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                    selectedPhoto === url
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                      : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {selectedPhoto === url && (
                    <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
            {profile?.photoURL ? (
              <button
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
