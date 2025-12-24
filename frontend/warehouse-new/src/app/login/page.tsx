"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const authenticate = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:8080/api/auth/login"
          : "http://localhost:8080/api/auth/register";

      const res = await axios.post(endpoint, { username, password });

      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/dashboard"); // or dashboard
    } catch (err) {
      const fallback = mode === "login" ? "Invalid credentials" : "Signup failed";
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  const heading = mode === "login" ? "Login" : "Create account";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-96 rounded-xl bg-slate-900 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{heading}</h2>
          <div className="flex rounded-lg bg-slate-800 p-1 text-xs text-slate-300">
            <button
              className={`px-3 py-1 rounded-md ${
                mode === "login" ? "bg-emerald-500 text-white" : "hover:bg-slate-700"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                mode === "signup" ? "bg-emerald-500 text-white" : "hover:bg-slate-700"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <input
          className="w-full mb-3 p-2 rounded bg-slate-800 text-white"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-slate-800 text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={authenticate}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white p-2 rounded"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </button>

        <p className="mt-3 text-center text-sm text-slate-400">
          {mode === "login" ? "Don't have an account?" : "Already registered?"} {" "}
          <button
            className="text-emerald-400 hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create one" : "Go to login"}
          </button>
        </p>
      </div>
    </div>
  );
}
