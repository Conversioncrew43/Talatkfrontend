"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function VerifyBookingPage() {
  const router = useRouter();
  const { completePasswordlessAuth } = useAuth();
  const [draft, setDraft] = useState(null);
  const [stage, setStage] = useState("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const raw = sessionStorage.getItem("talatk_booking_draft");
    if (!raw) {
      router.replace("/book");
      return;
    }
    queueMicrotask(() => setDraft(JSON.parse(raw)));
  }, [router]);

  useEffect(() => {
    if (stage !== "otp") return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  if (!draft) return null;

  const { service, slot } = draft;

  async function requestOtp(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/request-otp", {
        method: "POST",
        body: {
          email,
          serviceId: draft.serviceId,
          slotId: draft.slotId || undefined,
          coachWillAssignSlot: draft.coachWillAssignSlot,
        },
      });
      setChallengeId(data.challengeId);
      setExpiresAt(Date.now() + data.expiresInSeconds * 1000);
      setStage("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/verify-otp", { method: "POST", body: { challengeId, code: otp } });
      if (data.needsProfile) {
        setStage("profile");
        return;
      }
      finish(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    try {
      const data = await api("/auth/resend-otp", { method: "POST", body: { challengeId } });
      setExpiresAt(Date.now() + data.expiresInSeconds * 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function completeProfile(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/complete-profile", { method: "POST", body: { challengeId, ...profile } });
      finish(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function finish(data) {
    completePasswordlessAuth(data);
    sessionStorage.removeItem("talatk_booking_draft");
    sessionStorage.setItem("talatk_booking", JSON.stringify(data.booking));
    router.push("/book/pay");
  }

  return (
    <div className="book-shell verify-shell">
      <div className="booking-heading">
        <div>
          <p className="eyebrow">Booking details</p>
          <h1 className="display">Almost there</h1>
        </div>
        <div className="stepper">
          <span className="on">01 Book</span>
          <span className="on">02 Confirm</span>
          <span>03 Pay</span>
        </div>
      </div>

      <div className="verify-layout">
        <aside className="booking-panel selected-summary">
          <p className="panel-kicker">Your selection</p>
          <h2>{service?.title}</h2>
          <dl className="summary-list">
            <div><dt>Coach</dt><dd>Talat K</dd></div>
            <div><dt>Consultation</dt><dd>{service?.title}</dd></div>
            <div><dt>Date & time</dt><dd>{slot ? formatSlot(slot.startAt, slot.endAt) : "Time to be chosen by the coach"}</dd></div>
            <div><dt>Duration</dt><dd>{service?.durationMinutes} minutes</dd></div>
            <div><dt>Price</dt><dd>{formatMoney(service?.price || 0)}</dd></div>
          </dl>
          <button className="text-btn" type="button" onClick={() => router.push("/book")}>Change service or time</button>
        </aside>

        <section className="booking-panel verify-panel">
          {error ? <p className="error">{error}</p> : null}
          {stage === "email" ? (
            <form className="booking-auth-step" onSubmit={requestOtp}>
              <p className="panel-kicker">Email confirmation</p>
              <h2>Enter your email to continue with your booking.</h2>
              <label htmlFor="verify-email">Email address</label>
              <input id="verify-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button className="btn" type="submit" disabled={loading}>{loading ? "Sending…" : "Continue"}</button>
              <p className="muted auth-hint">We&apos;ll send you a one-time verification code.</p>
            </form>
          ) : null}
          {stage === "otp" ? (
            <form className="booking-auth-step" onSubmit={verifyOtp}>
              <p className="panel-kicker">Verify your email</p>
              <h2>We&apos;ve sent a 6-digit verification code to {email}.</h2>
              <label htmlFor="verify-otp">Verification code</label>
              <input id="verify-otp" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required />
              <button className="btn" type="submit" disabled={loading}>{loading ? "Verifying…" : "Verify & Continue"}</button>
              <div className="auth-links"><button type="button" className="text-btn" onClick={resendOtp}>Resend code</button><button type="button" className="text-btn" onClick={() => { setOtp(""); setStage("email"); }}>Change email</button></div>
              {expiresAt ? <p className="muted auth-hint">Code expires in {Math.max(0, Math.ceil((expiresAt - now) / 60000))} minutes.</p> : null}
            </form>
          ) : null}
          {stage === "profile" ? (
            <form className="booking-auth-step" onSubmit={completeProfile}>
              <p className="panel-kicker">Your details</p>
              <h2>Tell us who we&apos;re preparing this consultation for.</h2>
              <label htmlFor="verify-name">Full name</label>
              <input id="verify-name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
              <label htmlFor="verify-phone">Phone number <span className="optional">Optional</span></label>
              <input id="verify-phone" type="tel" autoComplete="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
              <button className="btn" type="submit" disabled={loading}>{loading ? "Preparing…" : "Continue to payment"}</button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
