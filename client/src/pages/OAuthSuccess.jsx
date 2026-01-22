import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, fetchCurrentUser } from "../store/slices/authSlice";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      dispatch(setCredentials({ token, user: null }));
      dispatch(fetchCurrentUser());
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-retro-bg font-mono text-retro-green flex flex-col items-center justify-center relative overflow-hidden">
      <div className="scanlines"></div>
      <h1 className="text-2xl font-pixel mb-4 animate-pulse">
        ESTABLISHING CONNECTION...
      </h1>
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-retro-green">
        <div
          className="h-full bg-retro-green animate-[width_2s_ease-in-out_infinite]"
          style={{ width: "100%" }}
        ></div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest">
        Secure handshake in progress
      </p>
    </div>
  );
};

export default OAuthSuccess;
