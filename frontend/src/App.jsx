import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";
import Register from "./Components/Register.jsx";
import DashboardChef from "./Components/DasheboardChef.jsx";
import DashboardProf from "./Components/DashebordProf.jsx";
import DashboardEtudiant from "./Components/DashboardEtudiant.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard-chef" element={<DashboardChef />} />
      <Route path="/dashboard-prof" element={<DashboardProf />} />
      <Route path="/dashboard-etudiant" element={<DashboardEtudiant />} />
    </Routes>
  );
}

export default App;