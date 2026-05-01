'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { onAuthStateChanged, User, updateProfile, deleteUser, signOut } from 'firebase/auth';
import { 
  User as UserIcon, 
  Bell, 
  ShieldAlert, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setName(u.displayName || '');
        // Fetch additional settings from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setReminderTime(data.reminderTime || '');
            setIsReminderEnabled(!!data.reminderTime);
          }
        } catch (err) {
          console.error("Error fetching user settings:", err);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Update Auth Profile
      await updateProfile(user, { displayName: name });

      // Update Firestore User Doc
      await updateDoc(doc(db, 'users', user.uid), {
        name: name,
        reminderTime: isReminderEnabled ? reminderTime : null,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Settings updated successfully' });
      
      // If reminder enabled, we simulate setting it (e.g. in LocalStorage for actual browser notification logic elsewhere)
      if (isReminderEnabled && reminderTime) {
        localStorage.setItem('sanctuary_reminder_time', reminderTime);
      } else {
        localStorage.removeItem('sanctuary_reminder_time');
      }

    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      const uid = user.uid;

      // 1. Delete all checkins
      const qCheckins = query(collection(db, 'checkins'), where('userId', '==', uid));
      const checkinsSnap = await getDocs(qCheckins);
      const batch = writeBatch(db);
      checkinsSnap.forEach((d) => batch.delete(d.ref));

      // 2. Delete all logs
      const qLogs = query(collection(db, 'logs'), where('userId', '==', uid));
      const logsSnap = await getDocs(qLogs);
      logsSnap.forEach((d) => batch.delete(d.ref));

      // 3. Delete user doc
      batch.delete(doc(db, 'users', uid));

      // Commit batch
      await batch.commit();

      // 4. Delete Auth User
      await deleteUser(user);

      router.push('/');
    } catch (err: any) {
      console.error("Error deleting account:", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in before deleting your account.");
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-20 selection:bg-primary/20">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
        <header className="space-y-4">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#5a5a40] opacity-60">
            Account Management
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#3a3a2e] tracking-tight">
            Settings & Privacy
          </h1>
        </header>

        <div className="max-w-3xl mx-auto space-y-16">
          {/* Settings Content */}
          <div className="space-y-16">
            
            {/* Profile Section */}
            <section id="profile" className="bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-outline/5 pb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif">Profile Information</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="How should Sanctuary address you?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50">Email (Private)</label>
                  <input 
                    type="email" 
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#f5f5f0]/50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-on-surface-variant/40 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-on-surface-variant/30 italic">Email is used for authentication only.</p>
                </div>

                <div id="notifications" className="pt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#3a3a2e]">Daily Reminder</h4>
                      <p className="text-xs text-on-surface-variant/60">Receive a gentle nudge to check in with yourself.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsReminderEnabled(!isReminderEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative flex items-center p-1",
                        isReminderEnabled ? "bg-primary" : "bg-outline/20"
                      )}
                    >
                      <motion.div 
                        animate={{ x: isReminderEnabled ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isReminderEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-[#f5f5f0] rounded-2xl space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50">Reminder Time</label>
                          <input 
                            type="time" 
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                          <p className="text-[10px] text-on-surface-variant/40 leading-relaxed">
                            Note: Reminders are local and depend on your browser being active. 
                            We recommend setting it for your most challenging time of day.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-8">
                  <NeomorphicButton 
                    type="submit" 
                    variant="primary" 
                    disabled={isSaving}
                    className="w-full md:w-auto px-10"
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </div>
                    )}
                  </NeomorphicButton>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest",
                        message.type === 'success' ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
                      )}
                    >
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="bg-[#f2ede6]/30 p-8 md:p-10 rounded-[40px] border border-outline/5 space-y-8">
              <div className="flex items-center gap-4 border-b border-outline/5 pb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif">Privacy & Data</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-red-600">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </h4>
                  <p className="text-sm text-on-surface-variant/60 leading-relaxed">
                    This will permanently delete your profile, all check-ins, and logs. This action is irreversible. 
                  </p>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors py-2"
                  >
                    Permanently erase all my data
                  </button>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-outline/5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full p-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-red-500/60 hover:bg-red-50 hover:text-red-600 transition-all group justify-center border border-red-500/10 hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-[#3a3a2e]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 md:p-12 shadow-2xl space-y-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-serif">Are you absolutely sure?</h3>
                <p className="text-sm text-on-surface-variant/60 leading-relaxed">
                  Your journey, reflections, and insights will be lost forever. 
                  We won&apos;t be able to recover your data once it&apos;s gone.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <NeomorphicButton 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 w-full"
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </div>
                  ) : "Yes, delete everything"}
                </NeomorphicButton>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface transition-colors"
                >
                  Wait, keep my journey
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-4xl mx-auto px-6 md:px-12 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center opacity-30 text-[10px] font-bold uppercase tracking-widest gap-4 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span>Sanctuary v1.0 — Beta</span>
        </div>
        <span>Secure & Private</span>
      </footer>
    </div>
  );
}
