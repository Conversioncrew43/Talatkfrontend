"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Blocks,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Eye,
  Globe2,
  HeartHandshake,
  Camera,
  LockKeyhole,
  Menu,
  MoveRight,
  MoveUpRight,
  PanelsTopLeft,
  Play,
  Repeat2,
  Signpost,
  Sparkles,
  Waves,
  Video,
  X,
  UserRound,
} from "lucide-react";
import {
  challenges,
  coachingAreas,
  coachingMethod,
  faqs,
  navigation,
  steps,
  testimonials,
  trustPoints,
} from "@/data/landing";
import { apiRequest, formatPrice } from "@/lib/api";

const iconSet = {
  AudioLines,
  Blocks,
  BriefcaseBusiness,
  CalendarDays,
  Compass,
  Eye,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  MoveRight,
  MoveUpRight,
  PanelsTopLeft,
  Repeat2,
  Signpost,
  Sparkles,
  UserRound,
  Video,
  Waves,
};

function Icon({ name, ...props }) {
  const Component = iconSet[name];
  return Component ? <Component aria-hidden="true" {...props} /> : null;
}

function BookLink({ children = "Book a session", className = "", arrow = true, serviceName }) {
  const href = serviceName ? { pathname: "/book", query: { service: serviceName } } : "/book";
  return (
    <Link className={`button button-primary ${className}`} href={href}>
      <span>{children}</span>
      {arrow && <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />}
    </Link>
  );
}

function SectionHeading({ eyebrow, title, note, centered = false }) {
  return (
    <div className={`section-heading${centered ? " section-heading-centered" : ""}`} data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {note && <p className="section-note">{note}</p>}
    </div>
  );
}

function EditorialImage({ src, alt, className = "", caption = "Portrait placeholder", priority = false, sizes = "(max-width: 760px) 100vw, 50vw" }) {
  return (
    <div className={`editorial-image ${className}`}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
      <span className="image-caption">{caption}</span>
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="nav-shell">
        <Link className="wordmark" href="#home" aria-label="Talat K, home" onClick={() => setMenuOpen(false)}>
          <span className="brand-logo"><Image src="/images/Logo_fnal-removebg-preview.png" width={500} height={500} alt="" /></span>
        </Link>
        <nav className={`nav-links${menuOpen ? " nav-links-open" : ""}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
          <Link className="nav-login" href="/login" onClick={() => setMenuOpen(false)}><UserRound size={16} /> Login</Link>
          <BookLink className="nav-mobile-book" />
        </nav>
        <BookLink className="nav-book" />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section-wrap" id="home">
      <div className="hero-copy" data-reveal>
        <p className="eyebrow"><span className="eyebrow-dot" /> NLP COACHING <span className="eyebrow-divider">/</span> PERSONAL TRANSFORMATION</p>
        <h1>Rewire your mind.<br /><em>Redefine</em> your life.</h1>
        <p className="hero-intro">Break limiting patterns. Build confidence. Create change.</p>
        <div className="hero-actions">
          <BookLink>Book your session</BookLink>
          <a className="text-link" href="#coaching">Explore coaching <ArrowDownRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="hero-footnote"><span className="footnote-rule" />A quieter way forward, one conversation at a time.</div>
      </div>
      <div className="hero-visual" data-reveal>
        <div className="hero-photo-frame">
          <EditorialImage
            className="hero-photo"
            src="/images/Coach.png"
            alt="Portrait of NLP coach Talat K"
            caption="Coach portrait"
            priority
            sizes="(max-width: 760px) 88vw, 47vw"
          />
          <div className="photo-stamp" aria-hidden="true"><span>SPACE TO</span><strong>become</strong><span>MORE YOU</span></div>
        </div>
        <div className="floating-session">
          <span className="session-spark"><AudioLines size={17} aria-hidden="true" /></span>
          <span><strong>1:1 personal coaching</strong><small>Online · Private · Personalized</small></span>
        </div>
        <span className="visual-index">A MORE INTENTIONAL YOU <span>— 01</span></span>
      </div>
      <a className="hero-scroll" href="#approach" aria-label="Scroll to the coaching approach"><ArrowDown size={15} /> SCROLL TO EXPLORE</a>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Coaching approach">
      <div className="trust-inner section-wrap">
        <p>For people ready to<br /><em>make meaningful change.</em></p>
        <div className="trust-points">
          {trustPoints.map((point) => (
            <div className="trust-point" key={point.label}><Icon name={point.icon} size={17} strokeWidth={1.6} /><span>{point.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="problem-section section-wrap section-pad" id="approach">
      <div className="challenge-intro" data-reveal>
        <SectionHeading
          eyebrow="WHAT ARE YOU DEALING WITH?"
          title="What feels familiar right now?"
        />
        <p className="challenge-lead">You don’t need to have everything figured out before seeking support.</p>
        <p className="challenge-subhead">Coaching can help you explore patterns around:</p>
      </div>
      <div className="challenge-grid">
        {challenges.map((challenge) => (
          <article className={`challenge-card challenge-${challenge.tone}`} key={challenge.title} data-reveal>
            <span className="challenge-icon"><Icon name={challenge.icon} size={23} strokeWidth={1.6} /></span>
            <h3>{challenge.title}</h3>
            <ul>
              {challenge.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <div className="challenge-closing" data-reveal>
        <p>You don’t have to identify with every one of these.</p>
        <p><strong>Sometimes identifying one repeating pattern is enough to begin the conversation.</strong></p>
      </div>
    </section>
  );
}

function TransformationSection() {
  const cycle = [
    "Your thoughts influence how you interpret situations.",
    "Your interpretation influences your emotional response.",
    "Your emotional response can influence your behaviour.",
    "And repeated behaviours can become patterns.",
  ];
  const questions = [
    "What is happening?",
    "What may be driving it?",
    "What alternatives exist?",
    "What can you do differently?",
  ];

  return (
    <section className="transformation-section">
      <div className="section-wrap transition-inner">
        <div className="transition-top">
          <div className="transition-heading">
            <p className="eyebrow eyebrow-light">WHAT COACHING ACTUALLY DOES</p>
            <h2>The goal isn’t to change who you are.</h2>
            <h3>It’s to understand what’s already happening.</h3>
          </div>
          <div className="transition-visual" role="img" aria-label="Abstract lines move from a tangled pattern into a clear, purposeful path">
            <svg viewBox="0 0 800 450" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="path-glow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#c6b5dc" stopOpacity="0.12" />
                  <stop offset="0.55" stopColor="#c6b5dc" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#ffd447" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path className="tangle-line" d="M24 198 C80 48 125 382 198 205 C264 48 305 344 374 206 C409 136 438 185 470 225 C518 286 562 284 614 226 C658 177 710 183 776 142" />
              <path className="tangle-line tangle-line-two" d="M12 252 C90 370 128 72 205 240 C270 382 320 74 380 235 C415 285 443 235 475 213 C525 177 578 174 624 213 C678 259 733 222 786 204" />
              <path className="tangle-line tangle-line-three" d="M35 132 C100 292 159 102 216 184 C286 280 311 154 369 217 C410 267 439 240 482 207 C531 170 580 201 626 207 C684 217 727 147 781 166" />
              <path className="tangle-line tangle-line-four" d="M20 304 C81 154 143 354 202 211 C252 92 329 302 382 218 C421 163 446 215 478 219 C530 224 561 248 620 216 C679 184 738 246 784 226" />
              <path className="clear-path-glow" d="M386 220 C443 220 460 202 497 211 C547 223 562 254 610 225 C660 194 711 190 779 154" />
              <path className="clear-path" d="M386 220 C443 220 460 202 497 211 C547 223 562 254 610 225 C660 194 711 190 779 154" />
              <circle cx="389" cy="220" r="7" className="path-point" />
              <circle cx="779" cy="154" r="8" className="path-point path-point-end" />
            </svg>
          </div>
        </div>
        <p className="transition-cycle-label">How a pattern can take shape</p>
        <div className="transition-cycle" aria-label="How thoughts and responses can form a repeating pattern">
          {cycle.map((step, index) => (
            <div className="transition-step" key={step}>
              <span>0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <p className="transition-body">Coaching creates an opportunity to examine that cycle with curiosity rather than judgment.</p>
        <div className="transition-exploration">
          <p>Together, we explore:</p>
          <div className="transition-questions">
            {questions.map((question, index) => (
              <span className="transition-question" key={question}>
                {question}
                {index < questions.length - 1 && <ArrowRight size={15} aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
        <div className="transition-close">
          <p>The aim is not to give you another list of things you <em>should</em> do.</p>
          <p><strong>It’s to help you build greater awareness and more intentional choices.</strong></p>
        </div>
      </div>
    </section>
  );
}

function CoachingApproach() {
  return (
    <section className="method-section" id="method">
      <div className="section-wrap method-inner">
        <div className="method-heading">
          <p className="eyebrow">COACHING APPROACH</p>
          <h2>A coaching process <em>built around you.</em></h2>
          <div className="method-intro">
            <p>There is no universal formula for personal change. Your experiences, beliefs, environment and patterns are uniquely yours.</p>
            <p>That’s why coaching begins with <strong>understanding—not prescribing.</strong></p>
          </div>
        </div>
        <div className="method-journey" aria-label="Five stages of the coaching process">
          {coachingMethod.map((step) => (
            <article className="method-step" key={step.number}>
              <div className="method-node">
                <Icon name={step.icon} size={23} strokeWidth={1.6} />
                <span>{step.number}</span>
              </div>
              <div className="method-step-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="method-ending">
          <p><strong>The objective isn’t a temporary motivational high.</strong></p>
          <p>It’s greater awareness, better choices and more intentional action.</p>
        </div>
      </div>
    </section>
  );
}

function CoachSection() {
  return (
    <section className="coach-section section-wrap section-pad" id="about">
      <div className="coach-image-wrap" data-reveal>
        <EditorialImage
          className="coach-photo"
          src="/images/talat.png"
          alt="Portrait of Talat K"
          caption="Meet Talat"
          sizes="(max-width: 760px) 88vw, 40vw"
        />
        <div className="coach-image-note"><span>01</span> A little more space to listen.</div>
        <div className="coach-side-label">A PERSONAL APPROACH · NLP COACHING</div>
      </div>
      <div className="coach-copy" data-reveal>
        <p className="eyebrow">MEET TALAT</p>
        <h2>A space to think clearly, <em>without judgment.</em></h2>
        <p className="coach-name">Talat K</p>
        <p className="coach-bio">My approach to coaching begins with curiosity. Rather than telling you what you <em>should</em> think or do, I want to understand how you currently experience situations, what patterns may be influencing your responses, and what you would like to change.</p>
        <p className="coach-bio">Through structured coaching conversations and NLP-based techniques, I help clients explore their thinking, recognise recurring patterns and develop more intentional ways of responding.</p>
        <p className="coach-bio">Every coaching conversation is different because every person brings a different story, different goals and different challenges.</p>
        <p className="coach-role"><strong>My role isn’t to live your life for you.</strong><br />It’s to help you see it from a perspective that may give you more choices.</p>
        <BookLink>Start a Conversation</BookLink>
      </div>
    </section>
  );
}

function CoachingAreas() {
  return (
    <section className="areas-section section-pad" id="coaching">
      <div className="section-wrap">
        <div className="areas-heading-row">
          <SectionHeading eyebrow="YOUR WORK, YOUR WAY" title={<>What would you like<br /><em>to transform?</em></>} />
          <p className="areas-side-note">Bring what’s on your mind. We’ll begin there.</p>
        </div>
        <div className="areas-grid">
          {coachingAreas.map((area, index) => (
            <a className="area-item" key={area.title} href="#sessions" data-reveal>
              <span className="area-icon"><Icon name={area.icon} size={20} strokeWidth={1.6} /></span>
              <span className="area-content"><strong>{area.title}</strong><small>{area.description}</small></span>
              <ArrowUpRight className="area-arrow" size={17} aria-hidden="true" />
              <span className="area-index">0{index + 1}</span>
            </a>
          ))}
        </div>
        <div className="areas-cta"><span>Not sure where to start?</span><a className="text-link" href="#sessions">Find your session <ArrowRight size={17} /></a></div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="steps-section section-pad" id="how-it-works">
      <div className="section-wrap">
        <div className="steps-header">
          <SectionHeading title={<>Your transformation starts<br /><em>with one conversation.</em></>} />
          <BookLink className="steps-book">Book your session</BookLink>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number} data-reveal>
              <div className="step-top"><span>{step.number}</span><Icon name={step.icon} size={21} strokeWidth={1.6} /></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="step-connector" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sessions({ services }) {
  return (
    <section className="sessions-section section-pad" id="sessions">
      <div className="section-wrap">
        <div className="sessions-heading-row">
          <SectionHeading eyebrow="A GOOD PLACE TO START" title={<>Choose the support<br /><em>you need.</em></>} />
          <p className="sessions-side-note">Every session is one-to-one, online, and shaped around you.</p>
        </div>
        <div className="session-grid">
          {services === null ? <p className="catalog-loading">Loading current sessions…</p> : services.map((service, index) => (
            <article className={`session-card${index === 1 ? " session-card-featured" : ""}`} key={service._id}>
              {index === 1 && <div className="popular-tag"><Sparkles size={13} aria-hidden="true" /> A DEEPER DIVE</div>}
              <div className="session-number">SESSION / 0{index + 1}</div>
              <h3>{service.title}</h3>
              <p className="session-duration"><AudioLines size={15} aria-hidden="true" /> {service.durationMinutes} minutes <span>·</span> Online</p>
              <p className="session-description">{service.description}</p>
              <div className="session-price"><span>{formatPrice(service.price)}</span><small>per session</small></div>
              <BookLink className={index === 1 ? "session-book-featured" : "session-book"} serviceName={service.title}>Book this session</BookLink>
              <p className="session-footnote">Available online</p>
            </article>
          ))}
        </div>
        <p className="catalog-note">Session details and pricing are updated from the live catalog.</p>
      </div>
    </section>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);
  const move = (direction) => setActive((current) => (current + direction + testimonials.length) % testimonials.length);

  return (
    <section className="stories-section section-wrap section-pad" id="stories">
      <div className="stories-top">
        <SectionHeading eyebrow="WHEN YOU’RE READY TO SHARE" title={<>Real people.<br /><em>Real transformations.</em></>} />
        <div className="carousel-controls" aria-label="Testimonial controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><ArrowLeft size={17} /></button>
          <span>0{active + 1} <i>/</i> 0{testimonials.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next testimonial"><ArrowRight size={17} /></button>
        </div>
      </div>
      <div className="story-grid">
        {testimonials.map((story, index) => (
          <article className={`story-card${active === index ? " story-card-active" : ""}`} key={`${story.name}-${index}`}>
            <div className="story-quote-mark" aria-hidden="true">“</div>
            <div className="story-placeholder"><span>Approved client story to be added</span><p>Replace with a real quote, shared with permission.</p></div>
            <div className="story-person"><span className="story-avatar"><UserRound size={18} /></span><span><strong>{story.name}</strong><small>{story.role}</small></span><ArrowUpRight size={17} aria-hidden="true" /></div>
          </article>
        ))}
      </div>
      <div className="story-dots" aria-label="Choose a testimonial">
        {testimonials.map((story, index) => <button key={`${story.role}-${index}`} type="button" className={active === index ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show testimonial ${index + 1}`} aria-pressed={active === index} />)}
      </div>
      <p className="story-disclaimer">Client stories are placeholders. No testimonials have been published yet.</p>
    </section>
  );
}

function VisualCTA() {
  return (
    <section className="visual-cta">
      <div className="visual-cta-image" aria-hidden="true" />
      <div className="visual-cta-overlay" />
      <div className="visual-cta-content section-wrap" data-reveal>
        <p className="eyebrow eyebrow-light">A SMALL SHIFT CAN CHANGE THE VIEW</p>
        <h2>The life you want starts with the patterns <em>you choose to change.</em></h2>
        <BookLink>Start your transformation</BookLink>
      </div>
      <div className="visual-cta-caption">MAKE ROOM FOR WHAT’S NEXT <span>— TALAT K</span></div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="faq-section section-wrap section-pad" id="faq">
      <div className="faq-heading"><SectionHeading eyebrow="THE PRACTICAL DETAILS" title={<>Questions,<br /><em>answered.</em></>} /><p>Still wondering about something? Get in touch and we’ll take it from there.</p><a className="text-link" href="#contact">Ask a question <ArrowRight size={17} /></a></div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details className="faq-item" key={faq.question} open={index === 0}>
            <summary><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><span>{faq.question}</span><ChevronDown size={18} aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta section-wrap" data-reveal>
      <div className="final-cta-mark" aria-hidden="true"><span /><span /><span /></div>
      <p className="eyebrow">YOUR NEXT CHAPTER, ON YOUR TERMS</p>
      <h2>Ready to create<br /><em>a different future?</em></h2>
      <p className="final-cta-copy">Your next step can start with one conversation.</p>
      <div className="final-cta-actions"><BookLink>Book your session</BookLink><a className="text-link" href="#coaching">Learn about coaching <ArrowRight size={17} /></a></div>
      <span className="final-cta-side">BEGIN WHEN YOU’RE READY <ArrowDownRight size={15} /></span>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main section-wrap">
        <div className="footer-brand">
          <Link className="wordmark footer-wordmark" href="#home"><span className="brand-logo brand-logo-footer"><Image src="/images/Logo_fnal-removebg-preview.png" width={500} height={500} alt="" /></span><span className="wordmark-name">Talat K<small>Mindful change, made personal</small></span></Link>
          <p>Make space for a new perspective.</p>
          <div className="footer-socials" aria-label="Social profiles to be added">
            <span title="Instagram link to be added"><Camera size={16} /></span>
            <span title="LinkedIn link to be added" className="social-in">in</span>
            <span title="YouTube link to be added"><Play size={17} /></span>
            <small>Social links to be added</small>
          </div>
        </div>
        <div className="footer-links-group"><h3>EXPLORE</h3><a href="#home">Home</a><a href="#about">About</a><a href="#coaching">Coaching</a><a href="#sessions">Sessions</a><a href="#faq">FAQ</a></div>
        <div className="footer-links-group"><h3>GET IN TOUCH</h3><span>Email to be added</span><span>Phone to be added</span><a href="#contact">Contact details coming soon</a></div>
        <div className="footer-links-group"><h3>THE DETAILS</h3><a href="#contact">Privacy policy</a><a href="#contact">Terms &amp; conditions</a><a href="#contact">Cancellation &amp; refund</a></div>
      </div>
      <div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} Talat K. All rights reserved.</span><span>Coaching for a more intentional life.</span><a href="#home">Back to top <ArrowUpRight size={14} /></a></div>
    </footer>
  );
}

export default function LandingPage() {
  const [liveServices, setLiveServices] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest("/services")
      .then(({ services: list }) => active && setLiveServices(list))
      .catch(() => active && setLiveServices([]));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("has-js");
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("has-js");
    };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <TransformationSection />
        <CoachingApproach />
        <CoachSection />
        <CoachingAreas />
        <HowItWorks />
        <Sessions services={liveServices} />
        <Testimonials />
        <VisualCTA />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}