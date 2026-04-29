import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ResultatsPage from "./components/ResultatsPage";
import DashboardPage from "./components/DashboardPage";
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resultats" element={<ResultatsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}