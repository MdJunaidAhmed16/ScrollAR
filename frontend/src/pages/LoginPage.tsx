import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginPage() {
  const { user, isLoading, error, loginWithGoogle, sendMagicLink, completeMagicLink, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Complete magic-link sign-in if this is a callback URL
  useEffect(() => {
    completeMagicLink();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect once logged in
  useEffect(() => {
    if (user) navigate("/feed", { replace: true });
  }, [user, navigate]);

  async function handleGoogle() {
    clearError();
    try {
      await loginWithGoogle();
    } catch {
      // error set in store
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setSending(true);
    try {
      await sendMagicLink(email);
      setLinkSent(true);
    } catch {
      // error set in store
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Scroll<span className="text-brand-500">Ar</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Doom scroll, but make it science.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {linkSent ? (
          <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-semibold">Check your inbox</p>
            <p className="text-gray-400 text-sm mt-2">
              We sent a sign-in link to <strong className="text-white">{email}</strong>.<br />
              Tap the link in the email to continue.
            </p>
            <button
              onClick={() => { setLinkSent(false); clearError(); }}
              className="mt-4 text-xs text-brand-500 hover:text-brand-400"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !email}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {sending ? "Sending…" : "Send magic link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
