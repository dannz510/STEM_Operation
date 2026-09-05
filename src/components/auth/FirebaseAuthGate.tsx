import React, { FormEvent, ReactNode, useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, Chrome, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { firebaseAuth, firebaseAuthSyncUrl, firebaseGoogleProvider, isFirebaseConfigured, syncFirebaseIdentity } from '../../lib/firebase';

interface FirebaseAuthGateProps { children: ReactNode; }

export const FirebaseAuthGate: React.FC<FirebaseAuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setSyncComplete(false);
        setIsLoading(false);
        return;
      }
      try {
        const idToken = await nextUser.getIdToken();
        await syncFirebaseIdentity(idToken);
        setSyncComplete(true);
        setErrorMessage('');
      } catch (error) {
        await signOut(firebaseAuth);
        setSyncComplete(false);
        setErrorMessage(error instanceof Error ? error.message : 'Không thể đồng bộ tài khoản Firebase.');
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  if (!isFirebaseConfigured || !firebaseAuth) return <>{children}</>;
  if (isLoading) return <div className="min-h-screen grid place-items-center bg-[#F8FAFC] text-slate-600"><div className="text-center"><ShieldCheck className="mx-auto mb-2 h-8 w-8 animate-pulse text-sky-600" /><p className="font-mono text-xs uppercase tracking-widest">Đang xác thực Firebase</p></div></div>;
  if (user && syncComplete) return <>{children}</>;

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      else await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Đăng nhập Firebase thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Đăng nhập Google Firebase thất bại.');
      setIsSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-slate-900"><section className="mx-auto w-full max-w-md border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">STEM LAB OS · FIREBASE</p><h1 className="text-xl font-bold tracking-tight">Đăng nhập Command Center</h1><p className="mt-1 text-xs text-slate-500">Firebase token sẽ được backend kiểm tra ACTIVE/RBAC trước khi mở app.</p></div><LockKeyhole className="h-5 w-5 text-slate-400" /></div><button type="button" disabled={isSubmitting || !firebaseAuthSyncUrl} onClick={handleGoogle} className="flex w-full items-center justify-center gap-2 border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Chrome className="h-4 w-4" />Tiếp tục với Google</button>{!firebaseAuthSyncUrl && <p className="mt-2 border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-800">Thiếu VITE_AUTH_SYNC_URL, Firebase chưa thể xác thực với database.</p>}<div className="my-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200" />hoặc email<span className="h-px flex-1 bg-slate-200" /></div><form onSubmit={handleEmail} className="space-y-3"><label className="block text-xs font-semibold text-slate-700">Email<span className="relative mt-1 block"><Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-600" placeholder="you@example.com" /></span></label><label className="block text-xs font-semibold text-slate-700">Mật khẩu<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-600" placeholder="Tối thiểu 6 ký tự" /></label>{errorMessage && <p className="border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">{errorMessage}</p>}<button type="submit" disabled={isSubmitting || !firebaseAuthSyncUrl} className="flex w-full items-center justify-center gap-2 bg-sky-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">{isSubmitting ? 'Đang xử lý...' : isSignUp ? 'Tạo tài khoản Firebase' : 'Đăng nhập'}{!isSubmitting && <ArrowRight className="h-4 w-4" />}</button></form><button type="button" onClick={() => setIsSignUp((current) => !current)} className="mt-5 w-full text-center text-xs font-semibold text-sky-700">{isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button></section></main>;
};
