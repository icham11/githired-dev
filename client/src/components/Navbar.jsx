import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearInterview } from "../store/slices/interviewSlice";
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentSessionId");
    dispatch(clearInterview());
    navigate("/");
  };

  return (
    <nav className="glass-panel sticky top-0 z-50">
      <div className="container flex items-center justify-between h-20">
        <Link
          to="/"
          className="text-2xl font-bold text-gradient-gold tracking-tight"
        >
          GitHired
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              <span className="text-zinc-400 text-sm hidden sm:inline font-light tracking-wide">
                Welcome, {user?.name || "User"} do you ready for GitHired?
              </span>
              <Link
                to="/dashboard"
                className="text-zinc-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Profile
              </Link>
              <button variant="outline" onClick={handleLogout} className="px-6">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Login
              </Link>
              <Link to="/register" className="px-8 shadow-amber-500/20">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
