"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  LogOut,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { apiRequest, formatDate, formatPrice, formatTime, getServiceTitle } from "@/lib/api";

const emptyForm = {
  title: "",
  description: "",
  durationMinutes: "45",
  price: "",
  active: true,
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDrafts, setServiceDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [updatingServiceId, setUpdatingServiceId] = useState("");

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("talat-auth-token");

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    Promise.all([
      apiRequest("/auth/me", { token }),
      apiRequest("/bookings", { token }),
      apiRequest("/services/all", { token }),
    ])
      .then(([account, bookingResult, serviceResult]) => {
        if (!active) return;
        if (account.user?.role !== "admin") {
          window.location.assign("/dashboard");
          return;
        }
        setUser(account.user);
        setBookings(bookingResult.bookings || []);
        setServices(serviceResult.services || []);
        setServiceDrafts(Object.fromEntries(serviceResult.services.map((service) => [service._id, {
          title: service.title,
          description: service.description,
          durationMinutes: String(service.durationMinutes),
          price: String(service.price),
          active: service.active,
        }])));
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        if (/token|auth|unauthorized/i.test(err.message)) {
          window.localStorage.removeItem("talat-auth-token");
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  function signOut() {
    window.localStorage.removeItem("talat-auth-token");
    window.location.assign("/");
  }

  const recentBookings = useMemo(
    () => bookings
      .filter((booking) => booking.status === "confirmed")
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8),
    [bookings]
  );

  const transactionBookings = useMemo(
    () => bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [bookings]
  );

  const stats = useMemo(() => {
    const revenue = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
    const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
    const upcomingConsultations = bookings.filter((booking) => ["confirmed", "awaiting_coach_slot"].includes(booking.status)).length;
    const activeServices = services.filter((service) => service.active).length;
    const pendingPayments = bookings.filter((booking) => booking.status === "pending_payment").length;

    return {
      revenue,
      confirmedBookings,
      upcomingConsultations,
      activeServices,
      pendingPayments,
    };
  }, [bookings, services]);

  async function updateService(serviceId, updates) {
    const token = window.localStorage.getItem("talat-auth-token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    const { service } = await apiRequest(`/services/${serviceId}`, {
      token,
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    setServices((current) => current.map((item) => (item._id === serviceId ? service : item)));
  }

  function updateServiceDraft(serviceId, field, value) {
    setServiceDrafts((current) => ({
      ...current,
      [serviceId]: { ...current[serviceId], [field]: value },
    }));
  }

  async function handleSaveService(serviceId) {
    const draft = serviceDrafts[serviceId];
    const durationMinutes = Number(draft?.durationMinutes);
    const price = Number(draft?.price);
    if (!draft?.title.trim() || !draft.description.trim() || !durationMinutes || Number.isNaN(price)) {
      setError("Please complete every service field before saving.");
      return;
    }

    try {
      setUpdatingServiceId(serviceId);
      setError("");
      await updateService(serviceId, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        durationMinutes,
        price,
        active: draft.active,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingServiceId("");
    }
  }

  async function handleCreateService(event) {
    event.preventDefault();
    const token = window.localStorage.getItem("talat-auth-token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
        active: form.active,
      };

      if (!payload.title || !payload.description || !payload.durationMinutes || Number.isNaN(payload.price)) {
        throw new Error("Please complete every service field before saving.");
      }

      const { service } = await apiRequest("/services", {
        token,
        method: "POST",
        body: JSON.stringify(payload),
      });

      setServices((current) => [service, ...current]);
      setServiceDrafts((current) => ({ ...current, [service._id]: {
        title: service.title,
        description: service.description,
        durationMinutes: String(service.durationMinutes),
        price: String(service.price),
        active: service.active,
      } }));
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteService(serviceId) {
    const token = window.localStorage.getItem("talat-auth-token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    try {
      setUpdatingServiceId(serviceId);
      setError("");
      await apiRequest(`/services/${serviceId}`, {
        token,
        method: "DELETE",
      });
      setServices((current) => current.filter((service) => service._id !== serviceId));
      setServiceDrafts((current) => {
        const next = { ...current };
        delete next[serviceId];
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingServiceId("");
    }
  }

  if (loading) {
    return <main className="dashboard-page"><p className="dashboard-loading">Loading admin dashboard…</p></main>;
  }

  if (!window.localStorage.getItem("talat-auth-token")) {
    return (
      <main className="dashboard-page dashboard-gate">
        <div className="dashboard-gate-mark"><ShieldCheck size={24} /></div>
        <h1>Admin access required.</h1>
        <p>Please sign in with your admin account to open the coaching dashboard.</p>
        <Link className="booking-primary" href="/">Return home <ArrowRight size={17} /></Link>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="booking-brand" href="/" aria-label="Talat K home">
          <Image src="/images/Logo_fnal-removebg-preview.png" alt="Talat K" width={500} height={500} priority />
          <span>Talat K<small>ADMIN COMMAND</small></span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link className="booking-back-site" href="/dashboard">Client view</Link>
          <button className="dashboard-signout" type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="booking-eyebrow">OPERATIONS OVERVIEW</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Admin"}.</h1>
          <p>Monitor bookings, adjust your offers, and keep each coaching session running smoothly.</p>
        </div>

        {error && <p className="booking-error" role="alert">{error}</p>}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-icon"><DollarSign size={18} /></span>
            <div>
              <small>Total revenue</small>
              <strong>{formatPrice(stats.revenue)}</strong>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon"><CalendarClock size={18} /></span>
            <div>
              <small>Confirmed</small>
              <strong>{stats.confirmedBookings}</strong>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon"><Users size={18} /></span>
            <div>
              <small>Upcoming</small>
              <strong>{stats.upcomingConsultations}</strong>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon"><Video size={18} /></span>
            <div>
              <small>Active services</small>
              <strong>{stats.activeServices}</strong>
            </div>
          </div>
        </section>

        <section className="admin-grid">
          <article className="admin-panel admin-panel-wide">
            <div className="dashboard-section-heading">
              <div>
                <p className="booking-eyebrow">SERVICE CATALOG</p>
                <h2>Manage programs</h2>
              </div>
              <span className="admin-panel-pill">{services.length} total</span>
            </div>

            <div className="admin-service-stack">
              {services.map((service) => (
                <div className="admin-service-card" key={service._id}>
                  <div className="admin-service-edit-grid">
                    <label>
                      <span>Service title</span>
                      <input type="text" value={serviceDrafts[service._id]?.title || ""} onChange={(event) => updateServiceDraft(service._id, "title", event.target.value)} />
                    </label>
                    <label>
                      <span>Duration (minutes)</span>
                      <input type="number" min="15" step="15" value={serviceDrafts[service._id]?.durationMinutes || ""} onChange={(event) => updateServiceDraft(service._id, "durationMinutes", event.target.value)} />
                    </label>
                    <label>
                      <span>Price (₹)</span>
                      <input type="number" min="0" step="100" value={serviceDrafts[service._id]?.price || ""} onChange={(event) => updateServiceDraft(service._id, "price", event.target.value)} />
                    </label>
                    <label>
                      <span>Status</span>
                      <select value={serviceDrafts[service._id]?.active ? "active" : "paused"} onChange={(event) => updateServiceDraft(service._id, "active", event.target.value === "active")}>
                        <option value="active">Live</option>
                        <option value="paused">Paused</option>
                      </select>
                    </label>
                  </div>
                  <label className="admin-service-description">
                    <span>Description</span>
                    <textarea rows="3" value={serviceDrafts[service._id]?.description || ""} onChange={(event) => updateServiceDraft(service._id, "description", event.target.value)} />
                  </label>

                  <div className="admin-service-actions">
                    <button
                      type="button"
                      className="booking-primary"
                      onClick={() => handleSaveService(service._id)}
                      disabled={updatingServiceId === service._id}
                    >
                      <Save size={16} /> {updatingServiceId === service._id ? "Saving…" : "Save changes"}
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => handleDeleteService(service._id)}
                      disabled={updatingServiceId === service._id}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form className="admin-create-form" onSubmit={handleCreateService}>
              <div className="dashboard-section-heading">
                <div>
                  <p className="booking-eyebrow">ADD NEW</p>
                  <h2>Create service</h2>
                </div>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>Service title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Example: Career clarity session"
                  />
                </label>

                <label>
                  <span>Duration (minutes)</span>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={form.durationMinutes}
                    onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                  />
                </label>

                <label>
                  <span>Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="2500"
                  />
                </label>

                <label className="admin-toggle-field">
                  <span>Status</span>
                  <select
                    value={form.active ? "active" : "paused"}
                    onChange={(event) => setForm((current) => ({ ...current, active: event.target.value === "active" }))}
                  >
                    <option value="active">Live</option>
                    <option value="paused">Paused</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Description</span>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe the transformation, session flow, and what the client can expect."
                />
              </label>

              <button className="booking-primary" type="submit" disabled={submitting}>
                <Plus size={17} /> {submitting ? "Saving…" : "Add service"}
              </button>
            </form>
          </article>

          <article className="admin-panel">
            <div className="dashboard-section-heading">
              <div>
                <p className="booking-eyebrow">BOOKING TRACKER</p>
                <h2>Recent bookings</h2>
              </div>
              <span className="admin-panel-pill">{recentBookings.length} confirmed</span>
            </div>

            <div className="admin-booking-list">
              {recentBookings.length ? recentBookings.map((booking) => (
                <div className="admin-booking-row" key={booking._id}>
                  <div>
                    <strong>{booking.clientId?.name || "Client"}</strong>
                    <small>{getServiceTitle(booking.serviceId)}</small>
                  </div>
                  <div className="admin-booking-meta">
                    <span className={`admin-booking-status ${booking.status}`}>{booking.status}</span>
                    <small>{booking.slotId ? `${formatDate(booking.slotId.startAt)} · ${formatTime(booking.slotId.startAt)}` : "Slot pending"}</small>
                    <small>{formatPrice(booking.amount)}</small>
                  </div>
                </div>
              )) : <p className="dashboard-muted">No confirmed bookings yet.</p>}
            </div>

            <div className="admin-meet-panel">
              <div className="admin-meet-head">
                <BarChart3 size={18} />
                <span>Google Meet integration</span>
              </div>
              <p>The next step is to connect calendar OAuth and auto-create session links for confirmed appointments.</p>
              <span className="admin-meet-status">Ready for the next build</span>
            </div>
          </article>
        </section>

        <section className="admin-panel admin-transactions-panel">
          <div className="dashboard-section-heading">
            <div>
              <p className="booking-eyebrow">TRANSACTIONS</p>
              <h2>All booking activity</h2>
            </div>
            <span className="admin-panel-pill">{bookings.length} entries</span>
          </div>

          <div className="admin-booking-list admin-transactions-list">
            {transactionBookings.length ? transactionBookings.map((booking) => (
              <div className="admin-booking-row admin-transaction-row" key={booking._id}>
                <div>
                  <strong>{booking.clientId?.name || "Client"}</strong>
                  <small>{getServiceTitle(booking.serviceId)}</small>
                </div>
                <div className="admin-booking-meta">
                  <span className={`admin-booking-status ${booking.status}`}>{booking.status}</span>
                  <small>{booking.slotId ? `${formatDate(booking.slotId.startAt)} · ${formatTime(booking.slotId.startAt)}` : "Slot pending"}</small>
                  <small>{booking.paymentStatus ? `Payment: ${booking.paymentStatus}` : "Payment not started"}</small>
                  <small>{formatPrice(booking.amount)}</small>
                </div>
              </div>
            )) : <p className="dashboard-muted">No transactions yet.</p>}
          </div>
        </section>

        <section className="admin-brief-row">
          <div className="admin-panel">
            <div className="dashboard-section-heading">
              <div>
                <p className="booking-eyebrow">LIVE STATUS</p>
                <h2>Operational pulse</h2>
              </div>
            </div>
            <div className="admin-brief-list">
              <div><span>Pending payments</span><strong>{stats.pendingPayments}</strong></div>
              <div><span>Paused services</span><strong>{services.length - stats.activeServices}</strong></div>
              <div><span>Average session value</span><strong>{bookings.length ? formatPrice(stats.revenue / bookings.length) : formatPrice(0)}</strong></div>
            </div>
          </div>
          <div className="admin-panel">
            <div className="dashboard-section-heading">
              <div>
                <p className="booking-eyebrow">SYSTEM HEALTH</p>
                <h2>Admin notes</h2>
              </div>
            </div>
            <ul className="admin-checklist">
              <li><CheckCircle2 size={16} /> Review and assign coach slots daily.</li>
              <li><CheckCircle2 size={16} /> Keep pricing aligned with demand and package value.</li>
              <li><CheckCircle2 size={16} /> Pause any offer that is temporarily unavailable.</li>
            </ul>
          </div>
        </section>
      </div>

      <footer className="booking-footer">Built for calm, high-converting client experiences.</footer>
    </main>
  );
}
