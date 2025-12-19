"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/dashboard"); // or dashboard
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-96 rounded-xl bg-slate-900 p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Login</h2>

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
          onClick={login}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
