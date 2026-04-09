import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Home />
    </AuthProvider>
  </React.StrictMode>
);
