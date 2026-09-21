"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function PayPage() {
  const { token, user, ready } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

  useEffect(() => {
    const raw = sessionStorage.getItem("talatk_booking");
    if (!raw) {
      router.replace("/book");
      return;
    }
    queueMicrotask(() => setBooking(JSON.parse(raw)));
  }, [router]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/book/pay");
  }, [ready, user, router]);

  if (!booking) return null;

  const service = booking.serviceId;
  const slot = booking.slotId;

  async function pay(e) {
    e.preventDefault();
    setError("");
    setPaying(true);
    try {
      const data = await api("/payments/mock-complete", {
        method: "POST",
        token,
        body: { bookingId: booking._id },
      });
      sessionStorage.setItem("talatk_booking", JSON.stringify(data.booking));
      router.push("/book/confirmed");
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="book-shell">
      <div className="stepper">
        <span>01 Book</span>
        <span>02 Confirm</span>
        <span className="on">03 Pay</span>
      </div>
      <div className="pay-grid">
        <form onSubmit={pay}>
          <p className="eyebrow">Demo checkout</p>
          <h1 className="display" style={{ fontSize: "2.6rem", marginTop: 0 }}>
            Payment
          </h1>
          <p className="muted">Review your consultation details before completing payment.</p>
          {error ? <p className="error">{error}</p> : null}
          <label>Name on card</label>
          <input
            required
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
          />
          <label>Card number</label>
          <input
            required
            inputMode="numeric"
            minLength={16}
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
          />
          <div className="field-row">
            <div>
              <label>Expiry</label>
              <input
                required
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              />
            </div>
            <div>
              <label>CVC</label>
              <input
                required
                maxLength={4}
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={paying} style={{ width: "100%" }}>
            {paying ? "Confirming…" : `Pay ${formatMoney(booking.amount)}`}
          </button>
        </form>
        <aside className="receipt">
          <p className="eyebrow">Summary</p>
          <h2 style={{ fontSize: "1.8rem", marginTop: 0 }}>{service?.title}</h2>
          <p className="muted">{service?.durationMinutes} minutes</p>
          <p><strong>Coach:</strong> Talat K</p>
          <p><strong>Consultation:</strong> {service?.title}</p>
          <p><strong>Date & time:</strong> {slot ? formatSlot(slot.startAt, slot.endAt) : "Time to be chosen by the coach"}</p>
          <p><strong>Duration:</strong> {service?.durationMinutes} minutes</p>
          <p><strong>Customer:</strong> {user?.name || booking.clientId?.name || "Verified customer"}</p>
          <p><strong>Email:</strong> {user?.email || booking.clientId?.email || "Verified email"}</p>
          <p><strong>Consultation:</strong> <span className="meta">{formatMoney(booking.amount)}</span></p>
          <p><strong>Taxes / fees:</strong> <span className="meta">{formatMoney(0)}</span></p>
          <p><strong>Total payable:</strong> <span className="meta">{formatMoney(booking.amount)}</span></p>
        </aside>
      </div>
    </div>
  );
}
