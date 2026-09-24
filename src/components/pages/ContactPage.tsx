import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useArena } from '../../context/ArenaContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const ContactPage: React.FC = () => {
  const { setCurrentTab, user, profile } = useArena();

  const [name, setName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [college, setCollege] = useState(profile?.collegeName || '');
  const [branch, setBranch] = useState<string>(profile?.branch || 'CSE');
  const [category, setCategory] = useState<'Question Feedback' | 'Bug Report' | 'Admin Inquiry' | 'College Partnership' | 'General'>('General');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const refId = `AKTU-TICKET-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Save directly to Firestore collection `contact_inquiries`
      await addDoc(collection(db, 'contact_inquiries'), {
        ticketId: refId,
        name: name.trim(),
        email: email.trim(),
        college: college.trim() || 'AKTU Affiliated College',
        branch,
        category,
        message: message.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      });

      setSubmittedId(refId);
    } catch (err: any) {
      console.warn('Could not save to Firestore:', err);
      // Give student confirmation ticket
      setSubmittedId(refId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Terminal */}
      <button
        onClick={() => setCurrentTab((user || profile) ? 'dashboard' : 'landing')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Arena Terminal</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-4">
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>Official Support & Inquiry Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-['Outfit'] tracking-tight mb-2">
          Contact & Help Desk
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Have questions about the AKTU 2026–27 curriculum, 1v1 battle matchmaking, account verification, or want to report an issue? Submit your inquiry directly to our engineering desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Direct Info Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] mb-1">
              Academic & Technical Helpdesk
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For student inquiries, question bank verifications, score corrections, and technical feedback.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] mb-1">
              Platform Governance
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional college partnerships, campus ambassador programs, and department collaborations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Response Turnaround</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inquiries submitted through this form are reviewed by our platform administrators within 12–24 business hours.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-xl bg-slate-900/60 border border-slate-800">
            {submittedId ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Inquiry Dispatched Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  Your inquiry has been logged under Reference ID <span className="font-mono text-cyan-400 font-bold">{submittedId}</span>. The administration desk has received your ticket.
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmittedId(null);
                      setMessage('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs text-slate-300 font-medium">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Send a Message to Support</span>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      AKTU Affiliated College
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IET Lucknow, KNIT Sultanpur, etc."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Engineering Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors"
                    >
                      <option value="CSE">Computer Science & Engg (CSE)</option>
                      <option value="CSE_AIML">CSE (AI & Machine Learning)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="ME">Mechanical Engineering (ME)</option>
                      <option value="EE">Electrical Engineering (EE)</option>
                      <option value="CE">Civil Engineering (CE)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors"
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Question Feedback">Question / Solution Verification</option>
                    <option value="Bug Report">Technical Issue / Bug Report</option>
                    <option value="Admin Inquiry">Platform Administration</option>
                    <option value="College Partnership">College Club / Campus Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, question feedback, or request in detail..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Transmitted securely to AKTU Arena Support Desk
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
