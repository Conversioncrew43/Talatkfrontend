"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const [stage, setStage] = useState("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setChallengeId(result.challengeId);
      setCode("");
      setStage("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ challengeId, code }),
      });
      if (result.needsProfile) {
        setEmail(result.email);
        setStage("profile");
        return;
      }
      finishLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function completeProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/auth/complete-profile", {
        method: "POST",
        body: JSON.stringify({ challengeId, name, phone }),
      });
      finishLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function finishLogin(result) {
    window.localStorage.setItem("talat-auth-token", result.token);
    window.location.assign(result.user?.role === "admin" ? "/admin" : "/dashboard");
  }

  async function resendCode() {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ challengeId }),
      });
      setCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    setError("");
    setStage(stage === "profile" ? "otp" : "email");
  }

  return (
    <main className="login-page">
      <header className="booking-header login-header">
        <Link className="booking-brand" href="/" aria-label="Talat K home">
          <Image src="/images/Logo_fnal-removebg-preview.png" alt="" width={500} height={500} priority />
          <span>Talat K<small>PERSONAL NLP COACHING</small></span>
        </Link>
        <Link className="booking-back-site" href="/">Back to site <ArrowRight size={15} /></Link>
      </header>

      <section className="login-panel">
        <p className="booking-eyebrow">YOUR PRIVATE COACHING SPACE</p>
        <h1>{stage === "otp" ? "Check your inbox." : stage === "profile" ? "Complete your profile." : "Welcome back."}</h1>
        <p className="login-intro">
          {stage === "otp" ? <>Enter the six-digit code sent to <strong>{email}</strong>.</> : stage === "profile" ? "Your email is verified. Add your name to finish creating your account." : "Sign in securely with your email. We will send a one-time code."}
        </p>

        {stage === "email" && (
          <form className="booking-form" onSubmit={requestCode}>
            <label htmlFor="login-email">Email address</label>
            <div className="booking-input-wrap"><Mail size={18} /><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <button className="booking-primary" disabled={busy} type="submit">{busy ? "Sending code…" : "Send login code"}<ArrowRight size={17} /></button>
          </form>
        )}

        {stage === "otp" && (
          <form className="booking-form" onSubmit={verifyCode}>
            <button className="booking-back-step" type="button" onClick={goBack}><ArrowLeft size={15} /> Change email</button>
            <label htmlFor="login-code">Verification code</label>
            <input className="booking-code-input" id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
            <button className="booking-primary" disabled={busy || code.length !== 6} type="submit">{busy ? "Verifying…" : "Verify and sign in"}<ArrowRight size={17} /></button>
            <button className="booking-resend" type="button" onClick={resendCode} disabled={busy}>Didn’t receive a code? Send again</button>
          </form>
        )}

        {stage === "profile" && (
          <form className="booking-form" onSubmit={completeProfile}>
            <button className="booking-back-step" type="button" onClick={goBack}><ArrowLeft size={15} /> Back to verification</button>
            <label htmlFor="login-name">Your name</label>
            <input className="booking-text-input" id="login-name" autoComplete="name" placeholder="First and last name" required value={name} onChange={(event) => setName(event.target.value)} />
            <label htmlFor="login-phone">Phone</label>
            <input className="booking-text-input" id="login-phone" type="tel" autoComplete="tel" placeholder="Add a contact number" required value={phone} onChange={(event) => setPhone(event.target.value)} />
            <button className="booking-primary" disabled={busy} type="submit">{busy ? "Creating account…" : "Finish sign in"}<ArrowRight size={17} /></button>
          </form>
        )}

        {error && <p className="booking-error" role="alert">{error}</p>}
        <p className="booking-privacy"><LockKeyhole size={14} /> Your login is remembered for 30 days.</p>
      </section>
    </main>
  );
}
