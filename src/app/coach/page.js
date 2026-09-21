"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function CoachPage() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [meetingLoading, setMeetingLoading] = useState("");
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    price: 3000,
  });
  const [slotForm, setSlotForm] = useState({
    serviceId: "",
  });
  const today = new Date();
  const initialWeek = new Date(today);
  initialWeek.setDate(today.getDate() - today.getDay());
  initialWeek.setHours(0, 0, 0, 0);
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-${String(date.getDate()).padStart(2, "0")}`;
  }

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weekSlots = slots.filter((slot) => {
    const date = new Date(slot.startAt);
    return date >= weekStart && date < weekEnd;
  });

  function moveWeek(offset) {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + offset * 7);
    setWeekStart(next);
  }

  const scheduleHours = Array.from({ length: 12 }, (_, index) => index + 8);

  function selectCalendarCell(date, hour) {
    setSelectedDate(dateKey(date));
    setStartTime(`${String(hour).padStart(2, "0")}:00`);
    setEndTime(`${String(hour + 1).padStart(2, "0")}:00`);
  }

  const load = useCallback(async () => {
    if (!token) return;
    const [s, sl, b] = await Promise.all([
      api("/services/all", { token }),
      api("/slots/all", { token }),
      api("/bookings", { token }),
    ]);
    setServices(s.services);
    setSlots(sl.slots);
    setBookings(b.bookings);
    setSlotForm((prev) => ({
      ...prev,
      serviceId: prev.serviceId || s.services[0]?._id || "",
    }));
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/coach");
      return;
    }
    if (user.role !== "coach" && user.role !== "admin") {
      router.replace("/account");
      return;
    }
    queueMicrotask(() => load().catch((err) => setError(err.message)));
  }, [ready, user, router, load]);

  async function createService(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/services", { method: "POST", token, body: serviceForm });
      setServiceForm({ title: "", description: "", durationMinutes: 60, price: 3000 });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleService(service) {
    try {
      await api(`/services/${service._id}`, {
        method: "PATCH",
        token,
        body: { active: !service.active },
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createSlot(e) {
    e.preventDefault();
    setError("");
    if (!selectedDate) {
      setError("Choose a date on the calendar");
      return;
    }
    try {
      await api("/slots", {
        method: "POST",
        token,
        body: {
          serviceId: slotForm.serviceId,
          startAt: `${selectedDate}T${startTime}`,
          endAt: `${selectedDate}T${endTime}`,
        },
      });
      setSelectedDate("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function assignSlot(bookingId, slotId) {
    setError("");
    try {
      await api(`/bookings/${bookingId}/assign-slot`, {
        method: "PATCH",
        token,
        body: { slotId },
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createMeeting(bookingId) {
    setError("");
    setMeetingLoading(bookingId);
    try {
      const data = await api(`/bookings/${bookingId}/google-meet`, {
        method: "POST",
        token,
      });
      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? data.booking : booking
      )));
    } catch (err) {
      setError(err.message);
    } finally {
      setMeetingLoading("");
    }
  }

  if (!ready || !user || (user.role !== "coach" && user.role !== "admin")) return null;

  const openByService = (serviceId) =>
    slots.filter(
      (s) =>
        s.status === "open" &&
        (s.serviceId?._id || s.serviceId) === serviceId &&
        new Date(s.startAt) >= new Date()
    );

  return (
    <div className="dash-shell">
      <p className="eyebrow">Coach studio</p>
      <h1 className="display" style={{ fontSize: "3rem", marginTop: 0 }}>
        Practice desk
      </h1>
      {error ? <p className="error">{error}</p> : null}

      <h2>Services</h2>
      <form onSubmit={createService} className="receipt" style={{ marginBottom: "1.5rem" }}>
        <label>Title</label>
        <input
          required
          value={serviceForm.title}
          onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
        />
        <label>Description</label>
        <textarea
          required
          value={serviceForm.description}
          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
        />
        <div className="field-row">
          <div>
            <label>Minutes</label>
            <input
              type="number"
              required
              value={serviceForm.durationMinutes}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label>Price (INR)</label>
            <input
              type="number"
              required
              value={serviceForm.price}
              onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
            />
          </div>
        </div>
        <button className="btn" type="submit">
          Add service
        </button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s._id}>
              <td>{s.title}</td>
              <td>{s.durationMinutes} min</td>
              <td>{formatMoney(s.price)}</td>
              <td>
                <button type="button" className="text-btn" onClick={() => toggleService(s)}>
                  {s.active ? "On — hide" : "Off — show"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "3rem" }}>Open a slot</h2>
      <form onSubmit={createSlot} className="slot-creation">
        <div className="slot-service-field">
          <label>Service</label>
          <select
            value={slotForm.serviceId}
            onChange={(e) => setSlotForm({ ...slotForm, serviceId: e.target.value })}
          >
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="calendar-picker week-picker">
          <div className="calendar-picker-heading">
            <strong>{weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {weekDays[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
            <div>
              <button type="button" className="calendar-nav" aria-label="Previous week" onClick={() => moveWeek(-1)}>‹</button>
              <button type="button" className="calendar-nav" aria-label="Next week" onClick={() => moveWeek(1)}>›</button>
            </div>
          </div>
          <div className="calendly-grid">
            <div className="calendly-corner" />
            {weekDays.map((date) => <div className={`calendly-day-heading ${selectedDate === dateKey(date) ? "is-selected" : ""}`} key={dateKey(date)}><span>{date.toLocaleDateString("en-IN", { weekday: "short" })}</span><strong>{date.getDate()}</strong></div>)}
            {scheduleHours.map((hour) => (
              <div className="calendly-row" key={hour}>
                <span className="calendly-time">{new Date(2000, 0, 1, hour).toLocaleTimeString("en-IN", { hour: "numeric" })}</span>
                {weekDays.map((date) => {
                  const dayKey = dateKey(date);
                  const cellSlot = weekSlots.find((slot) => dateKey(new Date(slot.startAt)) === dayKey && new Date(slot.startAt).getHours() === hour);
                  return cellSlot ? <div className={`calendly-slot ${cellSlot.status}`} key={`${dayKey}-${hour}`}><strong>{cellSlot.status === "booked" ? "Booked" : "Available"}</strong><span>{cellSlot.serviceId?.title || "Slot"}</span></div> : <button className="calendly-empty" type="button" key={`${dayKey}-${hour}`} aria-label={`Create slot on ${dayKey} at ${hour}:00`} onClick={() => selectCalendarCell(date, hour)}>+</button>;
                })}
              </div>
            ))}
          </div>
          <div className="calendar-legend"><span><i className="legend-dot open" /> Available</span><span><i className="legend-dot booked" /> Booked</span></div>
        </div>
        <div className="slot-times">
          <div><label htmlFor="slot-start">Starts</label><input id="slot-start" type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          <div><label htmlFor="slot-end">Ends</label><input id="slot-end" type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
        </div>
        <button className="btn" type="submit">
          Add slot
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Service</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {slots.slice(0, 24).map((s) => (
            <tr key={s._id}>
              <td>{formatSlot(s.startAt, s.endAt)}</td>
              <td>{s.serviceId?.title}</td>
              <td>
                <span className="badge">{s.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "3rem" }}>Bookings</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>When</th>
            <th>Status</th>
            <th>Assign</th>
            <th>Google Meet</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const options = openByService(b.serviceId?._id || b.serviceId);
            return (
              <tr key={b._id}>
                <td>
                  {b.clientId?.name}
                  <br />
                  <span className="muted">{b.clientId?.email}</span>
                </td>
                <td>{b.serviceId?.title}</td>
                <td>
                  {b.slotId ? formatSlot(b.slotId.startAt, b.slotId.endAt) : "—"}
                </td>
                <td>
                  <span className="badge">{b.status.replaceAll("_", " ")}</span>
                </td>
                <td>
                  {b.status === "awaiting_coach_slot" ? (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) assignSlot(b._id, e.target.value);
                      }}
                    >
                      <option value="">Choose slot</option>
                      {options.map((s) => (
                        <option key={s._id} value={s._id}>
                          {formatSlot(s.startAt, s.endAt)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {b.googleMeetUrl ? (
                    <a className="text-btn" href={b.googleMeetUrl} target="_blank" rel="noreferrer">
                      Open Meet
                    </a>
                  ) : b.status === "confirmed" ? (
                    <button className="text-btn" type="button" disabled={meetingLoading === b._id} onClick={() => createMeeting(b._id)}>
                      {meetingLoading === b._id ? "Creating…" : "Create Meet"}
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
