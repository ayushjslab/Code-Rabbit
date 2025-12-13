"use client"
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "../../../lib/auth-client";

export default function LoginUI() {
  const [loading, setLoading] = useState(false);

  const handleGithubLogin = async() => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "github"
      })
    } catch (error) {
      console.log(error)
    } finally{
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-900 via-black to-zinc-800">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Code<span className="text-rose-500">Rabbit</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Sign in to continue hopping 🚀
          </p>
        </div>

        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 rounded-2xl font-semibold py-3 transition shadow-lg
            ${loading ? "bg-zinc-400 cursor-not-allowed" : "bg-white text-black hover:shadow-xl"}`}
        >
          {loading ? (
            <span className="animate-pulse">Connecting to GitHub…</span>
          ) : (
            <>
              <FaGithub className="text-xl" />
              Sign in with GitHub
            </>
          )}
        </button>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By continuing, you agree to our
          <span className="text-zinc-300"> Terms</span> &
          <span className="text-zinc-300"> Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
