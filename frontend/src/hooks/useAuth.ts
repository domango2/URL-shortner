import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  function authHeaders(): { Authorization: string } {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }

  function handleAuthError() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return { authHeaders, handleAuthError };
}
