"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatMoney, formatSlot } from "@/lib/api";

export default function BookPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [coachWillAssign, setCoachWillAssign] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/services")
      .then((data) => {
        setServices(data.services);
        if (data.services[0]) setServiceId(data.services[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    queueMicrotask(() => setLoadingSlots(true));
    api(`/slots?serviceId=${serviceId}`)
      .then((data) => setSlots(data.slots))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [serviceId]);

  const selectedService = useMemo(
    () => services.find((s) => s._id === serviceId),
    [services, serviceId]
  );
  const noSlots = !loadingSlots && slots.length === 0;

  const canContinue = selectedService && (slotId || (noSlots && coachWillAssign));

  function continueToVerification() {
    const selectedSlot = slots.find((slot) => slot._id === slotId);
    sessionStorage.setItem("talatk_booking_draft", JSON.stringify({
      serviceId,
      slotId: slotId || null,
      coachWillAssignSlot: noSlots && coachWillAssign,
      service: selectedService,
      slot: selectedSlot || null,
    }));
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.push("/book/verify", { scroll: true });
  }

  return (
    <div className="book-shell">
      <div className="booking-heading">
        <div>
          <p className="eyebrow">Appointment</p>
          <h1 className="display">Book a consultation</h1>
        </div>
        <div className="stepper">
          <span className="on">01 Book</span>
          <span>02 Confirm</span>
          <span>03 Pay</span>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <div className="booking-layout">
        <aside className="coach-card">
          <div className="booking-coach-image" role="img" aria-label="Talat K, NLP coach" />
          <div className="coach-card-copy">
            <p className="eyebrow">Your coach</p>
            <h2>Talat K</h2>
            <p className="muted">NLP Coach · Language & pattern work</p>
            <div className="coach-details">
              <span>Online sessions</span>
              <span>45–75 minutes</span>
            </div>
          </div>
        </aside>

        <section className="booking-panel services-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Step 01</p>
              <h2>Choose your focus</h2>
            </div>
            <span className="panel-count">{services.length} options</span>
          </div>
          <div className="service-options">
            {services.map((s, index) => (
              <button
                key={s._id}
                type="button"
                className={`service-choice ${serviceId === s._id ? "is-on" : ""}`}
                onClick={() => {
                  setServiceId(s._id);
                  setSlotId("");
                  setCoachWillAssign(false);
                }}
              >
                <span className="service-index">0{index + 1}</span>
                <span className="service-copy">
                  <strong>{s.title}</strong>
                  <span className="service-description">{s.description}</span>
                  <span className="service-meta">{s.durationMinutes} min <i /> {formatMoney(s.price)}</span>
                </span>
                <span className="service-check" aria-hidden="true">{serviceId === s._id ? "✓" : ""}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="booking-panel slots-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Step 02</p>
              <h2>Find your time</h2>
            </div>
            <span className="timezone">Your local time</span>
          </div>
          {loadingSlots ? <p className="muted">Looking at the calendar…</p> : null}
          {!loadingSlots && slots.length > 0 ? (
            <div className="slot-list">
              {slots.map((slot) => (
                <button
                  key={slot._id}
                  type="button"
                  className={`slot ${slotId === slot._id ? "is-on" : ""}`}
                  onClick={() => {
                    setSlotId(slot._id);
                    setCoachWillAssign(false);
                  }}
                >
                  {formatSlot(slot.startAt, slot.endAt)}
                </button>
              ))}
            </div>
          ) : null}
          {noSlots ? (
            <>
              <p className="notice">No open times for this service right now. You can still book and let Talat choose a slot from their availability.</p>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={coachWillAssign}
                  onChange={(e) => setCoachWillAssign(e.target.checked)}
                />
                <span>Coach can choose a slot as per their availability</span>
              </label>
            </>
          ) : null}
          <div className="booking-action">
            <div>
              <span className="action-label">Selected service</span>
              <strong>{selectedService?.title || "Choose a service"}</strong>
            </div>
            <button className="btn" type="button" disabled={!canContinue} onClick={continueToVerification}>
              Continue
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
