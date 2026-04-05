import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const isBookmarks = location.pathname === "/bookmarks";

  return (
    <nav
      className="flex items-center justify-between px-5 py-3 border-b border-white/8"
      style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      {/* Logo — visually distinct */}
      <Link to="/feed" className="flex items-center gap-1 select-none">
        <span className="text-xl font-black tracking-tight text-white">Scroll</span>
        <span
          className="text-xl font-black tracking-tight px-1 rounded-md"
          style={{
            background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
            color: "#fff",
          }}
        >
          Ar
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-2">
          {/* Saved */}
          <Link
            to="/bookmarks"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              isBookmarks
                ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/8 border border-transparent"
            }`}
          >
            <BookmarkIcon />
            Saved
          </Link>

          {/* Admin */}
          {user.is_admin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all duration-150"
            >
              ⚙ Admin
            </Link>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Sign out — icon only, always visible */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
          >
            <SignOutIcon />
          </button>
        </div>
      )}
    </nav>
  );
}
