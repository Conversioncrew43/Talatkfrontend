"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/book");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Begin here</p>
        <h1 className="display" style={{ fontSize: "2.4rem", marginTop: 0 }}>
          Create an account
        </h1>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={onSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1.4rem" }}>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
