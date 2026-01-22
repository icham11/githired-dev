import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { clearInterview } from "../store/slices/interviewSlice";
import Button from "./Button";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Crown, Trophy, User, LogOut } from "lucide-react";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative text-sm font-heading font-bold tracking-widest transition-colors duration-300 ${
        isActive ? "text-champion-gold" : "text-gray-400 hover:text-white"
      }`}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-champion-gold"
        />
      )}
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearInterview());
    navigate("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-champion-dark/90 backdrop-blur-md border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-champion-gold flex items-center justify-center rounded-sm group-hover:bg-white transition-colors">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-heading font-bold text-white tracking-widest group-hover:text-champion-gold transition-colors">
              GIT_HIRED
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">DASHBOARD</NavLink>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-champion-gold transition-colors group"
                  >
                    <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-champion-gold/10">
                      <User size={16} />
                    </div>
                    <span className="font-sans font-medium uppercase">
                      {user?.username || "Guest"}
                    </span>
                    {user?.isPro && (
                      <span className="bg-champion-gold text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-[0_0_12px_rgba(255,215,0,0.35)]">
                        PRO <Crown size={10} />
                      </span>
                    )}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="!px-3 !py-1 text-xs border-red-900/30 text-red-400 hover:border-red-500 hover:text-red-500"
                  >
                    <LogOut size={14} />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">LOGIN</NavLink>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="ml-4">
                    BECOME A LEGEND
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white hover:text-champion-gold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-40 bg-champion-dark flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-heading text-white hover:text-champion-gold"
                >
                  DASHBOARD
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-heading text-white hover:text-champion-gold flex items-center gap-2"
                >
                  PROFILE
                  {user?.isPro && (
                    <span className="bg-champion-gold text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-[0_0_12px_rgba(255,215,0,0.35)]">
                      PRO <Crown size={10} />
                    </span>
                  )}
                </Link>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-heading text-white hover:text-champion-gold"
                >
                  LOGIN
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary">START JOURNEY</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
