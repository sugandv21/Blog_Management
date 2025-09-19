import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // keep your named import
import api from "../api/axios";

const AuthContext = createContext(null);

function localDecodeJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Array.prototype.map
        .call(atob(payload), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("localDecodeJWT failed", err);
    return null;
  }
}

function safeDecode(token) {
  if (!token) return null;
  try {
    if (typeof jwtDecode === "function") {
      // Some builds expose a named export
      return jwtDecode(token);
    }
  } catch (err) {
    // ignore and fallback
  }
  return localDecodeJWT(token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (access) {
      try {
        const decoded = safeDecode(access);
        setUser({ username: decoded?.username || decoded?.user || decoded?.sub || decoded?.email || null });
      } catch {
        setUser(null);
      }
    }
  }, []);

  async function login(username, password) {
    const res = await api.post("auth/token/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);

    try {
      const decoded = safeDecode(res.data.access);
      setUser({ username: decoded?.username || decoded?.user || decoded?.sub || username });
    } catch {
      setUser({ username });
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }

  // register now accepts password2 and sends it to backend
  async function register(username, email, password, password2) {
    const res = await api.post("auth/register/", { username, email, password, password2 });
    return res.data;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

