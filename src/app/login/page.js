"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const { completePasswordlessAuth } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";
  const isAdminLogin = params.get("admin") === "1";
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("email");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/request-otp", { method: "POST", body: { email } });
      setChallengeId(data.challengeId);
      setStage("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/verify-otp", { method: "POST", body: { challengeId, code: otp } });
      if (data.needsProfile) {
        setStage("profile");
        return;
      }
      completePasswordlessAuth(data);
      router.push(next || (data.user.role === "coach" ? "/coach" : "/account"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeProfile(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/complete-profile", { method: "POST", body: { challengeId, name } });
      completePasswordlessAuth(data);
      router.push(next || "/account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">{isAdminLogin ? "Admin access" : "Passwordless access"}</p>
        <h1 className="display" style={{ fontSize: "2.4rem", marginTop: 0 }}>
          {stage === "email" ? "Enter your email" : stage === "otp" ? "Verify your email" : "Almost there"}
        </h1>
        {error ? <p className="error">{error}</p> : null}
        {stage === "email" ? (
          <form onSubmit={requestCode}>
            <p className="muted">We&apos;ll send you a one-time verification code.</p>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Sending…" : "Continue"}
            </button>
          </form>
        ) : null}
        {stage === "otp" ? (
          <form onSubmit={verifyCode}>
            <p className="muted">We&apos;ve sent a 6-digit verification code to {email}.</p>
            <label htmlFor="otp">Verification code</label>
            <input id="otp" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required />
            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <button type="button" className="text-btn" style={{ marginTop: "1rem" }} onClick={() => setStage("email")}>Change email</button>
          </form>
        ) : null}
        {stage === "profile" ? (
          <form onSubmit={completeProfile}>
            <p className="muted">Your details are not saved yet. Add your name to continue.</p>
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Preparing…" : "Continue"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
