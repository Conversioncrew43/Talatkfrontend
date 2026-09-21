"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    const data = await api("/bookings", { token });
    setBookings(data.bookings);
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/account");
      return;
    }
    queueMicrotask(() => loadBookings().catch((err) => setError(err.message)));
  }, [ready, user, router, loadBookings]);

  const confirmed = useMemo(() => bookings.filter((booking) => booking.status === "confirmed"), [bookings]);
  const revenue = useMemo(() => bookings.reduce((total, booking) => total + (booking.amount || 0), 0), [bookings]);

  if (!ready || !user || user.role !== "admin") return null;

  return (
    <div className="dash-shell account-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1 className="display">Booking overview</h1>
          <p className="muted">Monitor consultations, payment states, and client appointments.</p>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="dashboard-stats">
        <div><span>Total bookings</span><strong>{bookings.length}</strong></div>
        <div><span>Confirmed</span><strong>{confirmed.length}</strong></div>
        <div><span>Booking value</span><strong>{formatMoney(revenue)}</strong></div>
      </div>
      <section className="booking-panel admin-bookings">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Operations</p>
            <h2>All appointments</h2>
          </div>
        </div>
        {bookings.length === 0 ? <p className="muted">No bookings yet.</p> : (
          <div className="appointment-list">
            {bookings.map((booking) => (
              <article className="appointment-card" key={booking._id}>
                <div className="appointment-date">
                  <span>{booking.slotId ? new Date(booking.slotId.startAt).toLocaleDateString("en-IN", { weekday: "short" }) : "TBD"}</span>
                  <strong>{booking.slotId ? new Date(booking.slotId.startAt).getDate() : "—"}</strong>
                </div>
                <div className="appointment-info">
                  <h3>{booking.serviceId?.title}</h3>
                  <p>{booking.clientId?.name} · {booking.clientId?.email}</p>
                  <span>{booking.slotId ? formatSlot(booking.slotId.startAt, booking.slotId.endAt) : "Coach will assign a time"} · {formatMoney(booking.amount)}</span>
                </div>
                <div className="appointment-actions">
                  <span className={`status status-${booking.status}`}>{booking.status.replaceAll("_", " ")}</span>
                  {booking.googleMeetUrl ? <a className="text-btn" href={booking.googleMeetUrl} target="_blank" rel="noreferrer">Open Meet</a> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
