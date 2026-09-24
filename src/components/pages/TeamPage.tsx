import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowLeft, 
  GraduationCap, 
  Mail, 
  Linkedin, 
  Github, 
  Twitter, 
  ShieldCheck, 
  Plus
} from 'lucide-react';
import { useArena } from '../../context/ArenaContext';
import { TeamMember } from '../../types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const TeamPage: React.FC = () => {
  const { setCurrentTab, user, profile, isAdmin } = useArena();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, 'team_members'), orderBy('displayOrder', 'asc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const members = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as TeamMember))
            .filter(m => m.isActive !== false);
          setTeamMembers(members);
        } else {
          setTeamMembers([]);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Error reading team members:', err);
        setTeamMembers([]);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      setTeamMembers([]);
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Terminal */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentTab((user || profile) ? 'dashboard' : 'landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Arena Terminal</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manage Team in Admin Console</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Platform Leadership & Research Council</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-['Outfit'] tracking-tight mb-3">
          Our Team
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          The engineering innovators, curriculum researchers, and platform administrators building next-generation learning technology for AKTU students.
        </p>
      </div>

      {/* Team Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3" />
          <span className="text-xs">Loading verified team directory...</span>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
            No Team Profiles Published Yet
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform administrator has not published any team profiles to the public directory yet. You can add leadership, faculty coordinators, and contributors from the Admin Console.
          </p>

          {isAdmin ? (
            <button
              onClick={() => setCurrentTab('admin')}
              className="mt-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Members in Admin Console</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('contact')}
              className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Platform Administrators</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Photo & Role Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f172a&color=38bdf8&bold=true`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-base">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-100 font-['Outfit'] truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium truncate">
                      {member.role}
                    </p>
                    {member.education && (
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{member.education}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Biography */}
                {member.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 mb-4">
                    {member.description}
                  </p>
                )}
              </div>

              {/* Card Footer / Links */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Official Contact
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('contact')}
                    title="Contact via Help Desk"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/80 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noreferrer"
                      title="GitHub"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/80 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noreferrer"
                      title="Twitter / X"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/80 transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
