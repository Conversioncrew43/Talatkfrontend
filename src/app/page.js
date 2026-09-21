import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Private NLP practice</p>
          <h1>Change the sentence. Change the life around it.</h1>
          <p className="lede">
            A quiet, precise coaching space for people who are ready to notice
            how they speak to themselves — and to rewrite the patterns that
            keep looping.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/book">
              Book a consultation
            </Link>
            <Link className="btn btn-ghost" href="#work">
              How we work
            </Link>
          </div>
        </div>
        <div className="hero-panel" aria-hidden="true" />
      </section>

      <section className="section alt" id="work">
        <div className="section-head">
          <h2>The work</h2>
          <p className="muted" style={{ maxWidth: "28rem", margin: 0 }}>
            Neuro-linguistic programming as a craft: attention, language, and
            the body in the same room.
          </p>
        </div>
        <div className="split">
          <p className="muted">
            Sessions are unhurried. We listen for the metaphor you live inside,
            the belief that sounds like a fact, the gesture that arrives before
            the story. From there, we practice new language until it feels
            ordinary — not theatrical, not forced.
          </p>
          <p className="muted">
            This is not a lecture. It is a conversation with structure: what you
            want, what gets in the way, and a set of tools you can take home.
            You leave with something you can use the same evening.
          </p>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-head">
          <h2>Services</h2>
          <Link href="/book">Choose a session →</Link>
        </div>
        <div className="service-grid">
          <article className="card">
            <img className="card-image" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85" alt="Person writing notes during a focused coaching session" />
            <div className="card-body">
              <h3>Discovery</h3>
              <p className="muted">A first map to name the pattern, clarify the outcome, and see whether this work is the right fit.</p>
              <p className="meta">45 minutes · from ₹2,500</p>
              <Link className="btn" href="/book">Explore discovery</Link>
            </div>
          </article>
          <article className="card">
            <img className="card-image" src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85" alt="Friends sharing a thoughtful conversation outdoors" />
            <div className="card-body">
              <h3>Deep pattern</h3>
              <p className="muted">Belief work, reframing, and anchoring for the patterns you already feel ready to change.</p>
              <p className="meta">75 minutes · from ₹4,800</p>
              <Link className="btn" href="/book">Explore deep pattern</Link>
            </div>
          </article>
          <article className="card">
            <img className="card-image" src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=85" alt="Person enjoying a calm moment in warm natural light" />
            <div className="card-body">
              <h3>Integration</h3>
              <p className="muted">A gentle follow-up to keep the new language alive and carry your next practice into daily life.</p>
              <p className="meta">40 minutes · from ₹3,200</p>
              <Link className="btn" href="/book">Explore integration</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section alt">
        <div className="section-head">
          <h2>How booking works</h2>
        </div>
        <div className="steps">
          <div>
            <div className="step-num">01</div>
            <h3 className="display" style={{ fontSize: "1.5rem" }}>
              Choose a service
            </h3>
            <p className="muted">Pick the session that matches where you are.</p>
          </div>
          <div>
            <div className="step-num">02</div>
            <h3 className="display" style={{ fontSize: "1.5rem" }}>
              Take a slot — or wait
            </h3>
            <p className="muted">
              If nothing is open, you can ask the coach to place you when a
              time appears.
            </p>
          </div>
          <div>
            <div className="step-num">03</div>
            <h3 className="display" style={{ fontSize: "1.5rem" }}>
              Confirm with payment
            </h3>
            <p className="muted">
              A short checkout holds the consultation. Then you are on the
              calendar.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
