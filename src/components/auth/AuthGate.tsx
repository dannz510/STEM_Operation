import React, { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowRight, Chrome, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { isGoogleAuthEnabled, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { isFirebaseConfigured } from '../../lib/firebase';

interface AuthGateProps {
  children: ReactNode;
}

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Không thể xác thực. Vui lòng thử lại.';
  if (error.message.toLowerCase().includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  return error.message;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [guestMode, setGuestMode] = useState(() => window.localStorage.getItem('stem_v3_guest_mode') === 'true');

  useEffect(() => {
    if (!supabase || isFirebaseConfigured) return;

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });
    void isGoogleAuthEnabled().then(setGoogleEnabled);

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') || params.get('error');
    if (oauthError) {
      setErrorMessage(`Google OAuth chưa hoàn tất: ${oauthError.replaceAll('+', ' ')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (isFirebaseConfigured || !isSupabaseConfigured || !supabase) return <>{children}</>;
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8FAFC] text-slate-600">
        <div className="text-center">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-sky-600 animate-pulse" />
          <p className="text-xs font-mono uppercase tracking-widest">Đang xác thực phiên làm việc</p>
        </div>
      </div>
    );
  }
  if (session || guestMode) return <>{children}</>;

  const enableGuestMode = () => {
    window.localStorage.setItem('stem_v3_guest_mode', 'true');
    setGuestMode(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const result = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    setIsSubmitting(false);
    if (result.error) {
      setErrorMessage(getAuthErrorMessage(result.error));
      return;
    }
    if (isSignUp && !result.data.session) {
      setSuccessMessage('Đã tạo tài khoản. Hãy kiểm tra email để xác nhận trước khi đăng nhập.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setErrorMessage(getAuthErrorMessage(error));
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">STEM LAB OS</p>
            <h1 className="text-xl font-bold tracking-tight">{isSignUp ? 'Tạo tài khoản vận hành' : 'Đăng nhập Command Center'}</h1>
            <p className="mt-1 text-xs text-slate-500">Dữ liệu vận hành chỉ hiển thị sau khi xác thực.</p>
          </div>
          <LockKeyhole className="h-5 w-5 text-slate-400" />
        </div>

        {googleEnabled ? (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Chrome className="h-4 w-4" />
            Tiếp tục với Google
          </button>
        ) : (
          <div className="border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
            Google OAuth chưa được bật trong Supabase. Bạn vẫn có thể đăng nhập bằng email/mật khẩu.
          </div>
        )}

        <div className="my-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          hoặc email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Email
            <span className="relative mt-1 block">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                placeholder="you@example.com"
              />
            </span>
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              placeholder="Tối thiểu 6 ký tự"
            />
          </label>

          {errorMessage && <p className="border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">{errorMessage}</p>}
          {successMessage && <p className="border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">{successMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-sky-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-sky-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((current) => !current);
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className="mt-5 w-full text-center text-xs font-semibold text-sky-700 hover:text-sky-900"
        >
          {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>

        <button
          type="button"
          onClick={enableGuestMode}
          className="mt-3 flex w-full items-center justify-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
        >
          Tiếp tục bằng Guest Mode (Local Demo)
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-400">Chỉ dùng để test UI local. Dữ liệu guest không đồng bộ Supabase.</p>
      </section>
    </main>
  );
};
