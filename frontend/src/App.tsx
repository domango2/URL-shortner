import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ShortenPage from "./pages/ShortenPage";
import PrivateRoute from "./components/PrivateRoute";
import StatsPage from "./pages/StatsPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          token ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/shorten"
        element={
          <PrivateRoute>
            <ShortenPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/stats/:shortCode"
        element={
          <PrivateRoute>
            <StatsPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
