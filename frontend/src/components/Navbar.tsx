import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link to="/feed" className="text-xl font-black text-white tracking-tight">
        Scroll<span className="text-brand-500">Ar</span>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <Link
            to="/bookmarks"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Saved
          </Link>
          {user.email === "mohammedjunaidah@gmail.com" && (
            <>
              <span className="text-gray-600">|</span>
              <Link
                to="/admin"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                ⚙ Admin
              </Link>
            </>
          )}
          <span className="text-gray-600">|</span>
          <span className="text-sm text-gray-400">@{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
