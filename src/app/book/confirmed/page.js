"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatSlot } from "@/lib/api";

export default function ConfirmedPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("talatk_booking");
    if (!raw) {
      router.replace("/account");
      return;
    }
    queueMicrotask(() => setBooking(JSON.parse(raw)));
  }, [router]);

  if (!booking) return null;
  const service = booking.serviceId;
  const slot = booking.slotId;
  const waiting = booking.status === "awaiting_coach_slot";

  function addToCalendar() {
    if (!slot) return;
    const start = new Date(slot.startAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(slot.endAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${service?.title || "Talat K consultation"}\nDESCRIPTION:Consultation with Talat K\nEND:VEVENT\nEND:VCALENDAR`;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "talat-k-consultation.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="book-shell">
      <div className="stepper">
        <span>01 Book</span>
        <span>02 Confirm</span>
        <span className="on">03 Pay</span>
      </div>
      <div className="receipt" style={{ maxWidth: 560 }}>
        <p className="eyebrow">Consultation</p>
        <h1 className="display" style={{ fontSize: "2.8rem", marginTop: 0 }}>
          {waiting ? "Held — awaiting a time" : "Consultation Booked Successfully 🎉"}
        </h1>
        <p className="muted">
          {waiting
            ? "Payment is complete. The coach will assign a slot and you will see it in My sessions."
            : "Your session is confirmed. A copy of this receipt lives in your account."}
        </p>
        <p><strong>Coach:</strong> Talat K</p>
        <p><strong>Consultation:</strong> {service?.title}</p>
        <p><strong>Date & time:</strong> {slot ? formatSlot(slot.startAt, slot.endAt) : "Slot to be assigned"}</p>
        <p><strong>Duration:</strong> {service?.durationMinutes} minutes</p>
        <p><strong>Booking ID:</strong> {booking._id}</p>
        <p><strong>Payment:</strong> <span className="meta">{formatMoney(booking.amount)}</span></p>
        <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.6rem" }}>
          <Link className="btn" href="/account">
            View My Booking
          </Link>
          {slot ? <button className="btn btn-ghost" type="button" onClick={addToCalendar}>Add to Calendar</button> : null}
          <Link className="btn btn-ghost" href="/">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
