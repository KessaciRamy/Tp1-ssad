"use client"

import type React from "react"

import { useState } from "react"
import { Lock } from "lucide-react"

interface AuthModalProps {
  onAuthenticate: () => void
}

export function AuthModal({ onAuthenticate }: { onAuthenticate: (username: string) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFailedAttempts((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5) {
            alert("Too many failed attempts. Refreshing page...");
            window.location.reload();
          }

          return newCount;
      });
      // Login failed — show the error, do NOT authenticate
      setTimeout(() => {
        setError(data.error || "Invalid username or password");
        setPassword("");
      }, 2000);
      return;
    }
    console.log(username)
    onAuthenticate(username);

  } catch (err: any) {
    // Handle network or unexpected errors
    setError("Something went wrong. Please try again.");
    setPassword("");
    console.error(err);
  }
};
  

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crypto app</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 mt-6"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
