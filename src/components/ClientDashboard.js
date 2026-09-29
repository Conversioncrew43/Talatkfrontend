"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, FileText, LogOut, UserRound, Video } from "lucide-react";
import { apiRequest, formatDate, formatPrice, formatTime, getServiceTitle, getSlot } from "@/lib/api";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("talat-auth-token");
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }
    Promise.all([apiRequest("/auth/me", { token }), apiRequest("/bookings/me", { token })])
      .then(([account, result]) => {
        if (!active) return;
        setUser(account.user);
        setBookings(result.bookings || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        if (/token|auth|unauthorized/i.test(err.message)) window.localStorage.removeItem("talat-auth-token");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  function signOut() {
    window.localStorage.removeItem("talat-auth-token");
    window.location.assign("/");
  }

  const upcoming = bookings
    .filter((booking) => ["confirmed", "awaiting_coach_slot"].includes(booking.status))
    .sort((a, b) => new Date(getSlot(a)?.startAt || Infinity) - new Date(getSlot(b)?.startAt || Infinity));
  const nextBooking = upcoming[0];
  const nextSlot = getSlot(nextBooking);
  const pastBookings = bookings.filter((booking) => {
    const slot = getSlot(booking);
    return slot && new Date(slot.endAt) < new Date();
  });

  if (loading) {
    return <main className="dashboard-page"><p className="dashboard-loading">Opening your private dashboard…</p></main>;
  }

  if (!window.localStorage.getItem("talat-auth-token")) {
    return (
      <main className="dashboard-page dashboard-gate">
        <div className="dashboard-gate-mark"><UserRound size={24} /></div>
        <h1>Your coaching space.</h1>
        <p>Continue with a booking to create your account and open your private dashboard.</p>
        <Link className="booking-primary" href="/book">Book a session <ArrowRight size={17} /></Link>
        <Link className="dashboard-text-link" href="/">Return to Talat K</Link>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="booking-brand" href="/" aria-label="Talat K home">
          <Image src="/images/Logo_fnal-removebg-preview.png" alt="" width={500} height={500} priority />
          <span>Talat K<small>YOUR COACHING SPACE</small></span>
        </Link>
        <button className="dashboard-signout" type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="booking-eyebrow">A MORE INTENTIONAL YOU</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "there"}.</h1>
          <p>Your sessions and next steps, all in one place.</p>
        </div>

        {error && <p className="booking-error" role="alert">{error}</p>}

        <section className="dashboard-upcoming" id="upcoming">
          <div className="dashboard-section-heading"><div><p className="booking-eyebrow">YOUR NEXT STEP</p><h2>Upcoming consultation</h2></div><Link href="/book">Book another <ArrowRight size={15} /></Link></div>
          {nextBooking ? (
            <article className="dashboard-session-card">
              <div className="dashboard-session-profile">
                <Image src="/images/talat.png" alt="Talat K" width={76} height={76} />
                <span><strong>Talat K</strong><small>NLP Coach · Online</small></span>
                <span className={`dashboard-status${nextBooking.status === "confirmed" ? " is-confirmed" : ""}`}>{nextBooking.status === "confirmed" ? "Confirmed" : "Time to be arranged"}</span>
              </div>
              <h3>{getServiceTitle(nextBooking.serviceId)}</h3>
              <div className="dashboard-session-facts">
                <span><CalendarDays size={17} />{nextSlot ? formatDate(nextSlot.startAt) : "Talat will confirm your time"}</span>
                {nextSlot && <span><Clock3 size={17} />{formatTime(nextSlot.startAt)} · {nextBooking.serviceId?.durationMinutes || ""} minutes</span>}
                <span><Video size={17} />Online coaching</span>
              </div>
              {nextBooking.googleMeetUrl ? <a className="booking-primary" href={nextBooking.googleMeetUrl} target="_blank" rel="noreferrer">Join consultation <ArrowRight size={17} /></a> : <button className="booking-primary" type="button" disabled>Meeting details will appear here</button>}
              <p className="dashboard-payment-note">{formatPrice(nextBooking.amount)} · {nextBooking.paymentStatus === "paid" ? "Paid" : "Payment status: " + nextBooking.paymentStatus}</p>
            </article>
          ) : (
            <div className="dashboard-empty"><CalendarDays size={22} /><div><strong>No upcoming consultation yet</strong><p>When you book a session, its details will appear here.</p></div><Link className="dashboard-empty-link" href="/book">Choose a session <ArrowRight size={15} /></Link></div>
          )}
        </section>

        <section className="dashboard-lower-grid">
          <article className="dashboard-history" id="past">
            <div className="dashboard-section-heading"><div><p className="booking-eyebrow">YOUR JOURNEY</p><h2>Past consultations</h2></div></div>
            {pastBookings.length ? pastBookings.map((booking) => (
              <div className="dashboard-history-row" key={booking._id}><span><strong>{getServiceTitle(booking.serviceId)}</strong><small>{formatDate(getSlot(booking)?.startAt)}</small></span><span>{formatPrice(booking.amount)}</span></div>
            )) : <p className="dashboard-muted">Completed sessions will be listed here.</p>}
          </article>
          <article className="dashboard-profile" id="profile">
            <div className="dashboard-section-heading"><div><p className="booking-eyebrow">YOUR DETAILS</p><h2>Profile</h2></div><UserRound size={19} /></div>
            <dl><div><dt>Name</dt><dd>{user?.name || "—"}</dd></div><div><dt>Email</dt><dd>{user?.email || "—"}</dd></div><div><dt>Phone</dt><dd>{user?.phone || "Not added"}</dd></div></dl>
          </article>
          <article className="dashboard-documents" id="documents">
            <div className="dashboard-section-heading"><div><p className="booking-eyebrow">SHARED WITH YOU</p><h2>Notes & documents</h2></div><FileText size={19} /></div>
            <p className="dashboard-muted">Notes or resources shared after a session will appear here.</p>
          </article>
        </section>
      </div>
      <footer className="booking-footer">A quieter way forward, one conversation at a time.</footer>
    </main>
  );
}