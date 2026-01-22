import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../store/slices/authSlice";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-retro-bg font-mono text-retro-text selection:bg-retro-pink selection:text-white relative overflow-hidden">
      <div className="scanlines"></div>

      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative z-10">
        <div className="w-full max-w-md border-2 border-retro-pink p-8 bg-black/80 shadow-neon-pink relative group">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-retro-cyan -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-retro-cyan -translate-y-1 translate-x-1"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-retro-cyan translate-y-1 -translate-x-1"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-retro-cyan translate-y-1 translate-x-1"></div>

          <h2 className="text-3xl font-pixel text-center text-neon-pink mb-8 uppercase animate-pulse">
            Access_Control
          </h2>

          {error && (
            <div className="mb-6 p-4 border border-red-500 bg-red-900/20 text-red-500 text-xs text-center uppercase tracking-widest crt-flicker">
              [ACCESS_DENIED]: {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="User_ID (Email)"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER EMAIL..."
              required
            />
            <Input
              label="Passcode"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER KEY..."
              required
            />

            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-4 text-sm"
              >
                {loading ? "AUTHENTICATING..." : "INITIATE_LOGIN_SEQUENCE"}
              </Button>
            </div>
          </form>

          <div className="mt-6 mb-8 relative group">
            <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"></div>
            <a
              href="https://api.gethire.studio/auth/google"
              className="relative flex items-center justify-center gap-3 w-full bg-white text-black font-bold py-3 uppercase tracking-widest hover:bg-gray-200 transition-colors clip-corners"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                alt="G"
              />
              [ACCESS_VIA_GOOGLE]
            </a>
          </div>

          <div className="text-center text-xs text-retro-green/70">
            NO_CREDENTIALS?{" "}
            <Link
              to="/register"
              className="text-retro-cyan hover:underline hover:text-white decoration-dashed"
            >
              [CREATE_NEW_IDENTITY]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
