import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import client from "../api/client";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  async function onSubmit({ email }: { email: string }) {
    setLoading(true);
    try {
      await client.post("/auth/forgot-password", { email });
    } catch {
      // Always show success to avoid leaking if email exists
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
          <p className="text-gray-400 mt-2 text-sm">We'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-4 text-center">
            <p className="font-medium">Check your inbox</p>
            <p className="mt-1 text-green-500/70">If that email exists, a reset link is on its way.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-brand-500 hover:text-brand-400">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
