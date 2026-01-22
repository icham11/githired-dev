import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

//useSelector nya buat ngecek isAuthenticated dari auth slice di redux store
//Jika user tidak terautentikasi, maka akan diarahkan ke halaman login
//Jika user terautentikasi, maka komponen anak (children) akan dirender seperti biasa
