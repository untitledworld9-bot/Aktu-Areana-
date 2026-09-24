import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon, 
  GraduationCap, 
  Mail, 
  Link as LinkIcon,
  Eye,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { TeamMember } from '../../types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const AdminTeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [education, setEducation] = useState('');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Real-time subscription to team_members
  useEffect(() => {
    try {
      const q = query(collection(db, 'team_members'), orderBy('displayOrder', 'asc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const list: TeamMember[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as TeamMember));
        setMembers(list);
        setLoading(false);
      }, (err) => {
        console.warn('Error fetching team members:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setEducation('');
    setDescription('');
    setPhotoURL('');
    setEmail('');
    setLinkedin('');
    setGithub('');
    setTwitter('');
    setDisplayOrder(members.length + 1);
    setIsActive(true);
    setIsFormOpen(false);
    setErrorMsg(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setEducation(member.education);
    setDescription(member.description);
    setPhotoURL(member.photoURL || '');
    setEmail(member.email || '');
    setLinkedin(member.linkedin || '');
    setGithub(member.github || '');
    setTwitter(member.twitter || '');
    setDisplayOrder(member.displayOrder || 1);
    setIsActive(member.isActive !== false);
    setIsFormOpen(true);
    setErrorMsg(null);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove "${memberName}" from the platform team?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'team_members', id));
      setSuccessMsg(`Team member ${memberName} removed.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete member: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !education.trim() || !description.trim()) {
      setErrorMsg('Name, Role, Education, and Description are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const docId = editingId || `tm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      const dataToSave: Partial<TeamMember> = {
        id: docId,
        name: name.trim(),
        role: role.trim(),
        education: education.trim(),
        description: description.trim(),
        photoURL: photoURL.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0e7490&color=fff&bold=true`,
        email: email.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        twitter: twitter.trim(),
        displayOrder: Number(displayOrder) || 1,
        isActive,
        updatedAt: new Date().toISOString(),
      };

      if (!editingId) {
        dataToSave.createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, 'team_members', docId), dataToSave, { merge: true });

      setSuccessMsg(editingId ? 'Team member updated successfully!' : 'New team member added to website!');
      resetForm();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg('Error saving team member: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Platform Team & Leadership Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Post and update team member photos, roles, education, and bios shown publicly on the "Our Team" page.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Team Member</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Team Member Form Modal/Card */}
      {isFormOpen && (
        <GlassCard className="p-6 border-cyan-500/30" glow="cyan">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{editingId ? 'Edit Team Member Profile' : 'Post New Team Member Profile'}</span>
            </h3>

            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ayush Gupta"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role / Title *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  placeholder="e.g. Lead Architect & Platform Director"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Education & College *
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  required
                  placeholder="e.g. B.Tech Computer Science & Engineering • AKTU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://... (or leave blank for generated avatar)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Photo Preview */}
            {photoURL && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 w-fit">
                <img 
                  src={photoURL} 
                  alt="Preview" 
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Member')}&background=0e7490&color=fff&bold=true`;
                  }}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Image Preview</div>
                  <div className="text-[10px] text-slate-400">Photo will appear on public team cards</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bio / Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe this team member's engineering contributions, background, and responsibilities in AKTU Arena..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Social & Contact Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. member@institution.edu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="w-32">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-800 focus:ring-0"
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-300 font-medium">
                  Visible on public website
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {saving ? 'Publishing Profile...' : (editingId ? 'Update Member' : 'Publish Member to Website')}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Existing Team Members List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] uppercase tracking-wider flex items-center justify-between">
          <span>Active Team Roster ({members.length})</span>
          <span className="text-[11px] text-slate-500 font-normal normal-case">
            Displayed on /team page
          </span>
        </h3>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Loading team roster...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
            No custom team members added yet. Default founding profiles are currently displayed.
            <div className="mt-3">
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/40 transition-colors"
              >
                Post First Team Member
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => (
              <GlassCard key={m.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                        {m.photoURL ? (
                          <img 
                            src={m.photoURL} 
                            alt={m.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0e7490&color=fff&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-cyan-400 text-sm">
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">
                          {m.name}
                        </h4>
                        <div className="text-xs text-cyan-400 font-medium">
                          {m.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(m)}
                        title="Edit Profile"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        title="Delete Profile"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="truncate">{m.education}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-3">
                    {m.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Order: #{m.displayOrder}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.isActive !== false ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'}`}>
                    {m.isActive !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
