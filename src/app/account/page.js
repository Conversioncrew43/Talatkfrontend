"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AccountPage() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [cancelling, setCancelling] = useState("");

  const loadBookings = useCallback(async () => {
    const data = await api("/bookings/me", { token });
    setBookings(data.bookings);
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/account");
      return;
    }
    if (user.role === "coach" || user.role === "admin") {
      router.replace("/coach");
      return;
    }
    queueMicrotask(() => loadBookings().catch((err) => setError(err.message)));
  }, [ready, user, router, loadBookings]);

  const upcoming = useMemo(
    () => bookings.filter((booking) => booking.slotId && new Date(booking.slotId.startAt) >= new Date() && booking.status !== "cancelled"),
    [bookings]
  );
  const pending = useMemo(
    () => bookings.filter((booking) => booking.status === "pending_payment" || booking.status === "awaiting_coach_slot"),
    [bookings]
  );
  const past = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled" || (booking.slotId && new Date(booking.slotId.startAt) < new Date())),
    [bookings]
  );
  const visibleBookings = filter === "upcoming" ? upcoming : filter === "pending" ? pending : past;
  const nextAppointment = upcoming[0];

  async function cancelBooking(booking) {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancelling(booking._id);
    setError("");
    try {
      await api(`/bookings/${booking._id}/cancel`, { method: "PATCH", token });
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling("");
    }
  }

  if (!ready || !user || user.role !== "client") return null;

  return (
    <div className="dash-shell account-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Client dashboard</p>
          <h1 className="display">Good to see you, {user.name}</h1>
          <p className="muted">Track your consultations and keep your next conversation in view.</p>
        </div>
        <Link href="/book" className="btn">Book a consultation</Link>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="dashboard-stats">
        <div><span>Upcoming</span><strong>{upcoming.length}</strong></div>
        <div><span>Needs attention</span><strong>{pending.length}</strong></div>
        <div><span>Total sessions</span><strong>{bookings.length}</strong></div>
      </div>

      <section className="next-appointment">
        <div>
          <p className="panel-kicker">Next appointment</p>
          {nextAppointment ? (
            <>
              <h2>{nextAppointment.serviceId?.title}</h2>
              <p className="next-date">{formatSlot(nextAppointment.slotId.startAt, nextAppointment.slotId.endAt)}</p>
              <p className="muted">With Talat K · {nextAppointment.serviceId?.durationMinutes} minutes</p>
            </>
          ) : (
            <>
              <h2>Your calendar is open.</h2>
              <p className="muted">Choose a consultation and make space for a new pattern.</p>
            </>
          )}
        </div>
        <Link href="/book" className="btn btn-ghost">Book another</Link>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Your appointments</p>
          <h2>Sessions</h2>
        </div>
        <div className="dashboard-tabs" role="tablist" aria-label="Appointment filters">
          <button className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")} type="button">Upcoming</button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")} type="button">Needs attention</button>
          <button className={filter === "past" ? "active" : ""} onClick={() => setFilter("past")} type="button">Past</button>
        </div>
      </div>

      {visibleBookings.length === 0 ? (
        <div className="dashboard-empty"><p>No appointments in this view.</p><Link href="/book">Find a consultation</Link></div>
      ) : (
        <div className="appointment-list">
          {visibleBookings.map((booking) => (
            <article className="appointment-card" key={booking._id}>
              <div className="appointment-date">
                <span>{booking.slotId ? new Date(booking.slotId.startAt).toLocaleDateString("en-IN", { weekday: "short" }) : "TBD"}</span>
                <strong>{booking.slotId ? new Date(booking.slotId.startAt).getDate() : "—"}</strong>
              </div>
              <div className="appointment-info">
                <h3>{booking.serviceId?.title}</h3>
                <p>{booking.slotId ? formatSlot(booking.slotId.startAt, booking.slotId.endAt) : "Coach will assign a time"}</p>
                <span>{booking.serviceId?.durationMinutes} minutes · {formatMoney(booking.amount)}</span>
              </div>
              <div className="appointment-actions">
                <span className={`status status-${booking.status}`}>{booking.status.replaceAll("_", " ")}</span>
                {booking.googleMeetUrl ? <a className="text-btn" href={booking.googleMeetUrl} target="_blank" rel="noreferrer">Join Meet</a> : null}
                {(booking.status === "pending_payment" || booking.status === "confirmed") ? <button type="button" className="text-btn cancel-btn" disabled={cancelling === booking._id} onClick={() => cancelBooking(booking)}>{cancelling === booking._id ? "Cancelling…" : "Cancel"}</button> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
