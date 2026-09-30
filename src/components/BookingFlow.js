"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, LockKeyhole, Mail, Video } from "lucide-react";
import { API_BASE_URL, apiRequest, formatDate, formatPrice, formatTime, getServiceTitle, getSlot } from "@/lib/api";

const STORAGE_KEY = "talat-booking-flow";
const progressItems = ["Time", "Details", "Review", "Confirmed"];

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.dataset.razorpay = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Secure payment could not load. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

function slotDateKey(slot) {
  const date = new Date(slot.startAt);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function BookingFlow() {
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [coachWillAssignSlot, setCoachWillAssignSlot] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [stage, setStage] = useState("time");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const service = services.find((item) => item._id === serviceId) || null;
  const availableDates = useMemo(() => {
    const found = new Map();
    for (const slot of slots) {
      const key = slotDateKey(slot);
      if (!found.has(key)) found.set(key, slot.startAt);
    }
    return [...found.entries()].map(([key, value]) => ({ key, value }));
  }, [slots]);
  const dateSlots = slots.filter((slot) => slotDateKey(slot) === dateKey);
  const selectedSlot = slots.find((slot) => slot._id === slotId) || null;
  const stageIndex = stage === "time" ? 0 : ["email", "otp", "profile"].includes(stage) ? 1 : stage === "review" ? 2 : 3;
  const accountToken = typeof window !== "undefined" ? window.localStorage.getItem("talat-auth-token") : null;

  useEffect(() => {
    let active = true;
    const saved = (() => {
      try {
        return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
      } catch {
        return {};
      }
    })();
    setServiceId(saved.serviceId || "");
    setSlotId(saved.slotId || "");
    setCoachWillAssignSlot(Boolean(saved.coachWillAssignSlot));
    setDateKey(saved.dateKey || "");
    setStage(saved.stage || "time");
    setEmail(saved.email || "");
    setChallengeId(saved.challengeId || "");
    setCode("");
    setName(saved.name || "");
    setPhone(saved.phone || "");
    setUser(saved.user || null);
    setBooking(saved.booking || null);
    setPaymentPending(Boolean(saved.paymentPending));

    const preferredService = new URLSearchParams(window.location.search).get("service");
    apiRequest("/services")
      .then(({ services: list }) => {
        if (!active) return;
        const preferred = list.find((item) => item.title === preferredService);
        const savedService = list.find((item) => item._id === saved.serviceId);
        setServices(list);
        setServiceId(savedService?._id || preferred?._id || list[0]?._id || "");
        setServiceError(list.length ? "" : "No coaching sessions are available right now.");
      })
      .catch((err) => active && setServiceError(err.message));

    setHydrated(true);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ serviceId, slotId, coachWillAssignSlot, dateKey, stage, email, challengeId, name, phone, user, booking, paymentPending }));
  }, [hydrated, serviceId, slotId, coachWillAssignSlot, dateKey, stage, email, challengeId, name, phone, user, booking, paymentPending]);

  useEffect(() => {
    if (!serviceId) return;
    let active = true;
    setLoadingSlots(true);
    setError("");
    apiRequest(`/slots?serviceId=${encodeURIComponent(serviceId)}`)
      .then(({ slots: list }) => {
        if (!active) return;
        setSlots(list);
        const retainedSlot = list.find((slot) => slot._id === slotId);
        const retainedDate = retainedSlot ? slotDateKey(retainedSlot) : list.some((slot) => slotDateKey(slot) === dateKey) ? dateKey : "";
        setDateKey(retainedDate || (list[0] ? slotDateKey(list[0]) : ""));
        if (!retainedSlot) setSlotId("");
        if (list.length > 0) setCoachWillAssignSlot(false);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoadingSlots(false));
    return () => { active = false; };
  }, [serviceId]);

  function changeService(nextServiceId) {
    if (nextServiceId === serviceId) return;
    setServiceId(nextServiceId);
    setSlotId("");
    setCoachWillAssignSlot(false);
    setDateKey("");
    setError("");
  }

  async function requestCode(event) {
    event.preventDefault();
    if (!service || (!selectedSlot && !coachWillAssignSlot)) {
      setError("Choose a session and a time option to continue.");
      setStage("time");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email, serviceId, slotId: selectedSlot?._id || null, coachWillAssignSlot }),
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
      window.localStorage.setItem("talat-auth-token", result.token);
      setUser(result.user);
      setBooking(result.booking);
      setName(result.user.name || "");
      setPhone(result.user.phone || "");
      setStage("review");
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
      window.localStorage.setItem("talat-auth-token", result.token);
      setUser(result.user);
      setBooking(result.booking);
      setStage("review");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkPaymentStatus() {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest(`/payments/status/${booking._id}`, { token: accountToken });
      setBooking(result.booking);
      if (result.paid) {
        setPaymentPending(false);
        setStage("success");
      } else if (result.booking.paymentStatus === "failed") {
        setPaymentPending(false);
        setError("The payment was not completed. You can try again.");
      } else {
        setPaymentPending(true);
        setError("Your payment is still being confirmed. Please check again shortly.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function payAndConfirm() {
    setBusy(true);
    setError("");
    try {
      const [{ keyId, order, customer }] = await Promise.all([
        apiRequest("/payments/orders", {
          method: "POST",
          token: accountToken,
          body: JSON.stringify({ bookingId: booking._id }),
        }),
        loadRazorpay(),
      ]);
      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Talat K · NLP Coaching",
        description: service?.title || getServiceTitle(booking.serviceId),
        order_id: order.id,
        prefill: customer,
        theme: { color: "#17372f" },
        handler: async (paymentResult) => {
          setBusy(true);
          try {
            const verified = await apiRequest("/payments/verify", {
              method: "POST",
              token: accountToken,
              body: JSON.stringify({ bookingId: booking._id, ...paymentResult }),
            });
            if (!verified.paid) {
              const status = await apiRequest(`/payments/status/${booking._id}`, { token: accountToken });
              setBooking(status.booking);
              if (status.paid) {
                setPaymentPending(false);
                setStage("success");
              } else if (status.booking.paymentStatus === "failed") {
                setPaymentPending(false);
                setError("The payment was not completed. You can try again.");
              } else {
                setPaymentPending(true);
                setError(verified.message || "Your payment is still being confirmed. Please check again shortly.");
              }
              return;
            }
            setPaymentPending(false);
            setBooking(verified.booking);
            setStage("success");
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", (paymentError) => setError(paymentError.error?.description || "Payment failed. You can try again."));
      checkout.open();
      setBusy(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/auth/resend-otp", { method: "POST", body: JSON.stringify({ challengeId }) });
      setCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    setError("");
    if (stage === "otp") setStage("email");
    else if (stage === "profile") setStage("otp");
    else if (stage === "review") setStage("email");
    else setStage("time");
  }

  const bookingSlot = getSlot(booking) || selectedSlot;
  const bookingServiceTitle = getServiceTitle(booking?.serviceId) || service?.title;

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link className="booking-brand" href="/" aria-label="Talat K home">
          <Image src="/images/Logo_fnal-removebg-preview.png" alt="" width={500} height={500} priority />
          <span>Talat K<small>PERSONAL NLP COACHING</small></span>
        </Link>
        <Link className="booking-back-site" href="/">Back to site <ArrowRight size={15} /></Link>
      </header>

      <div className="booking-layout">
        <section className="booking-main">
          <p className="booking-eyebrow">ONE CONVERSATION AT A TIME</p>
          <h1>{stage === "success" ? "Your consultation is booked." : stage === "review" ? "Review your session." : stage === "otp" ? "Continue to booking." : stage === "profile" ? "Let’s get to know you." : "Book your session."}</h1>
          <p className="booking-intro">{stage === "success" ? "Your next step is already on the calendar." : "Choose your time first. We’ll take care of the rest together."}</p>

          <ol className="booking-progress" aria-label="Booking progress">
            {progressItems.map((item, index) => (
              <li className={index < stageIndex ? "is-complete" : index === stageIndex ? "is-current" : ""} key={item}>
                <span>{index < stageIndex ? <Check size={14} /> : `0${index + 1}`}</span>{item}
              </li>
            ))}
          </ol>

          {error && <p className="booking-error" role="alert">{error}</p>}
          {serviceError && stage === "time" && <p className="booking-error" role="alert">{serviceError} Make sure the booking API is running and available at {API_BASE_URL}.</p>}

          {stage === "time" && (
            <div className="booking-panel">
              <div className="booking-panel-heading"><span>01 / YOUR SESSION</span><h2>Choose your consultation</h2></div>
              {services.length > 0 ? (
                <div className="booking-service-list">
                  {services.map((item) => (
                    <button type="button" className={`booking-service-option${serviceId === item._id ? " is-selected" : ""}`} key={item._id} onClick={() => changeService(item._id)}>
                      <span><strong>{item.title}</strong><small>{item.durationMinutes} minutes · One-to-one online</small></span>
                      <b>{formatPrice(item.price)}</b>
                    </button>
                  ))}
                </div>
              ) : serviceError ? (
                <button className="booking-retry" onClick={() => window.location.reload()} type="button">Retry loading sessions</button>
              ) : <p className="booking-muted">Loading available sessions…</p>}

              <div className="booking-panel-heading booking-date-heading"><span>02 / YOUR TIME</span><h2>Select a date</h2></div>
              {loadingSlots ? <p className="booking-muted">Finding available times…</p> : availableDates.length > 0 ? (
                <>
                  <div className="booking-date-list">
                    {availableDates.map(({ key, value }) => (
                      <button type="button" className={`booking-date-option${dateKey === key ? " is-selected" : ""}`} key={key} onClick={() => { setDateKey(key); setSlotId(""); }}>
                        <small>{formatDate(value, { weekday: "short" })}</small>
                        <strong>{formatDate(value, { day: "numeric" })}</strong>
                        <small>{formatDate(value, { month: "short" })}</small>
                      </button>
                    ))}
                  </div>
                  <div className="booking-times-heading"><Clock3 size={17} /><span>Available times</span></div>
                  <div className="booking-time-list">
                    {dateSlots.map((slot) => (
                      <button type="button" className={`booking-time-option${slotId === slot._id ? " is-selected" : ""}`} key={slot._id} onClick={() => setSlotId(slot._id)}>{formatTime(slot.startAt)}</button>
                    ))}
                  </div>
                </>
              ) : !error && !serviceError && service ? (
                <div className="booking-coach-time-wrap">
                  <p className="booking-muted">There are no open times right now. You can still book, and Talat will follow up to arrange a time that works for you.</p>
                  <button
                    className={`booking-coach-time-option${coachWillAssignSlot ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={coachWillAssignSlot}
                    onClick={() => { setCoachWillAssignSlot(true); setSlotId(""); }}
                  >
                    <span className="booking-coach-time-check">{coachWillAssignSlot && <Check size={15} />}</span>
                    <span><strong>Talat will choose the time</strong><small>Book now and arrange your session time together later.</small></span>
                    <CalendarDays size={19} />
                  </button>
                </div>
              ) : <p className="booking-muted">No upcoming times are available for this session.</p>}

              <button className="booking-primary" disabled={!service || (!selectedSlot && !coachWillAssignSlot) || loadingSlots || Boolean(error) || Boolean(serviceError)} onClick={() => { setError(""); setStage("email"); }} type="button">Continue <ArrowRight size={17} /></button>
            </div>
          )}

          {stage === "email" && (
            <form className="booking-panel booking-form" onSubmit={requestCode}>
              <button className="booking-back-step" type="button" onClick={goBack}><ArrowLeft size={15} /> Change session time</button>
              <div className="booking-panel-heading"><span>02 / YOUR DETAILS</span><h2>Continue to booking</h2></div>
              <p>Enter your email. We’ll check for your account and send a secure one-time code.</p>
              <label htmlFor="booking-email">Email address</label>
              <div className="booking-input-wrap"><Mail size={18} /><input id="booking-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <button className="booking-primary" disabled={busy} type="submit">{busy ? "Sending code…" : "Continue"}<ArrowRight size={17} /></button>
              <p className="booking-privacy"><LockKeyhole size={14} /> Your details stay private and are used only for this booking.</p>
            </form>
          )}

          {stage === "otp" && (
            <form className="booking-panel booking-form" onSubmit={verifyCode}>
              <button className="booking-back-step" type="button" onClick={goBack}><ArrowLeft size={15} /> Change email</button>
              <div className="booking-panel-heading"><span>02 / VERIFY EMAIL</span><h2>Check your inbox</h2></div>
              <p>Enter the six-digit code sent to <strong>{email}</strong>. {coachWillAssignSlot ? "Your session choice will be kept while you continue." : "Your chosen session and time are held while you continue."}</p>
              <label htmlFor="booking-code">Verification code</label>
              <input className="booking-code-input" id="booking-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
              <button className="booking-primary" disabled={busy || code.length !== 6} type="submit">{busy ? "Verifying…" : "Verify & continue"}<ArrowRight size={17} /></button>
              <button className="booking-resend" type="button" onClick={resendCode} disabled={busy}>Didn’t receive a code? Send again</button>
            </form>
          )}

          {stage === "profile" && (
            <form className="booking-panel booking-form" onSubmit={completeProfile}>
              <button className="booking-back-step" type="button" onClick={goBack}><ArrowLeft size={15} /> Back to verification</button>
              <div className="booking-panel-heading"><span>02 / YOUR DETAILS</span><h2>Let’s create your account</h2></div>
              <p>Your email is verified. Add just your name to continue with this booking.</p>
              <label htmlFor="booking-name">Your name</label>
              <input className="booking-text-input" id="booking-name" autoComplete="name" placeholder="First and last name" required value={name} onChange={(event) => setName(event.target.value)} />
              <label htmlFor="booking-phone">Phone</label>
              <input className="booking-text-input" id="booking-phone" type="tel" autoComplete="tel" placeholder="Add a contact number" required value={phone} onChange={(event) => setPhone(event.target.value)} />
              <button className="booking-primary" disabled={busy} type="submit">{busy ? "Creating your account…" : "Continue to booking"}<ArrowRight size={17} /></button>
            </form>
          )}

          {stage === "review" && (
            <div className="booking-panel booking-review">
              <div className="booking-panel-heading"><span>03 / FINAL CHECK</span><h2>{user?.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Review your consultation."}</h2></div>
              <p>{booking?.coachWillAssignSlot ? "Talat will arrange a suitable time with you after your booking is confirmed." : "Everything look right? Your selected time is held while you complete this step."}</p>
              <dl className="booking-review-list">
                <div><dt>Consultation</dt><dd>{bookingServiceTitle || service?.title}</dd></div>
                <div><dt>With</dt><dd>Talat K · NLP Coach</dd></div>
                <div><dt>Date</dt><dd>{bookingSlot ? formatDate(bookingSlot.startAt) : "To be arranged with Talat"}</dd></div>
                <div><dt>Time</dt><dd>{bookingSlot ? formatTime(bookingSlot.startAt) : "Coach will choose the time"} · {service?.durationMinutes || booking?.serviceId?.durationMinutes} min</dd></div>
                <div><dt>Format</dt><dd>Online video session</dd></div>
                <div><dt>Your email</dt><dd>{user?.email || email}</dd></div>
              </dl>
              <div className="booking-total"><span>Total</span><strong>{formatPrice(booking?.amount ?? service?.price)}</strong></div>
              {paymentPending ? (
                <button className="booking-primary" disabled={busy} onClick={checkPaymentStatus} type="button">{busy ? "Checking payment…" : "Check payment status"}<ArrowRight size={17} /></button>
              ) : (
                <button className="booking-primary" disabled={busy} onClick={payAndConfirm} type="button">{busy ? "Preparing secure payment…" : "Confirm & pay"}<ArrowRight size={17} /></button>
              )}
              <p className="booking-privacy"><LockKeyhole size={14} /> Secure payment powered by Razorpay.</p>
            </div>
          )}

          {stage === "success" && (
            <div className="booking-panel booking-success">
              <span className="booking-success-mark"><Check size={26} /></span>
              <p className="booking-step-label">04 / CONFIRMED</p>
              <h2>Your consultation is booked.</h2>
              <p>Your session with <strong>Talat K</strong> is confirmed.</p>
              <div className="booking-success-details"><strong>{bookingSlot ? formatDate(bookingSlot.startAt) : "Time to be arranged"}</strong><span>{bookingSlot ? `${formatTime(bookingSlot.startAt)} · ` : "Talat will confirm your time · "}{service?.durationMinutes || booking?.serviceId?.durationMinutes} minutes</span></div>
              <div className="booking-meet-note"><Video size={19} /><span><strong>Online coaching session</strong><small>{booking?.googleMeetUrl ? "Your private meeting link is ready." : booking?.coachWillAssignSlot && !bookingSlot ? "Your meeting details will appear after Talat confirms your time." : "Your meeting details will appear here when available."}</small></span></div>
              {booking?.googleMeetUrl ? <a className="booking-primary booking-meet-link" href={booking.googleMeetUrl} target="_blank" rel="noreferrer">Join consultation <ArrowRight size={17} /></a> : <button className="booking-primary" type="button" disabled>{booking?.coachWillAssignSlot && !bookingSlot ? "Time to be arranged" : "Join consultation"}<ArrowRight size={17} /></button>}
              <div className="booking-next-list"><strong>What happens next?</strong><span><Check size={14} /> Your booking has been confirmed</span><span><Check size={14} /> A confirmation notification will be sent</span><span><Check size={14} /> Your session details are in your dashboard</span></div>
              <Link className="booking-dashboard-link" href="/dashboard">Go to dashboard <ArrowRight size={16} /></Link>
            </div>
          )}
        </section>

        <aside className="booking-summary">
          <p>YOUR SESSION</p>
          <div className="booking-coach-summary">
            <Image src="/images/talat.png" width={82} height={82} alt="Talat K" />
            <span><strong>Talat K</strong><small>NLP Coach · Online</small></span>
          </div>
          <div className="booking-summary-service"><span>{service?.title || "Choose a session"}</span><strong>{service ? formatPrice(service.price) : ""}</strong><small>{service ? `${service.durationMinutes} minutes · One-to-one` : "Select a consultation to begin"}</small></div>
          <div className="booking-summary-time"><CalendarDays size={17} /><span>{selectedSlot ? formatDate(selectedSlot.startAt) : coachWillAssignSlot ? "Time to be arranged" : "Choose a date and time"}</span></div>
          <div className="booking-summary-time"><Clock3 size={17} /><span>{selectedSlot ? formatTime(selectedSlot.startAt) : coachWillAssignSlot ? "Talat will follow up" : "Available sessions online"}</span></div>
          <p className="booking-summary-foot">Private, personal coaching shaped around what you need.</p>
        </aside>
      </div>
      <footer className="booking-footer">A quieter way forward, one conversation at a time.</footer>
    </main>
  );
}