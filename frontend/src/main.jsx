import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import ResidentDisplay from "./ResidentDisplay.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/resident-display" element={<ResidentDisplay />} />
        <Route path="/resident-display/:id" element={<ResidentDisplay />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);