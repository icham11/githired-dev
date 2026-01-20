import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage"; // Nanti kita buat

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>Dashboard (Coming Soon)</div>} />
    </Routes>
  );
}

export default App;
