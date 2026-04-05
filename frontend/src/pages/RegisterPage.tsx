import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    clearError();
    try {
      await registerUser({ email: data.email, username: data.username, password: data.password });
      navigate("/feed");
    } catch {
      // error set in store
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Join Scroll<span className="text-brand-500">Ar</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Start discovering research today.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

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

          <div>
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
                maxLength: { value: 50, message: "Max 50 characters" },
                pattern: { value: /^[a-zA-Z0-9_-]+$/, message: "Letters, numbers, _ and - only" },
              })}
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === watch("password") || "Passwords don't match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
