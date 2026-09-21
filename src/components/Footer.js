import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="eyebrow footer-eyebrow">Make room for a new pattern</p>
          <p className="brand-word">Talat K</p>
          <p className="footer-copy">NLP coaching for language, pattern, and quiet change.</p>
          <Link className="btn footer-btn" href="/book">Book a consultation</Link>
        </div>
        <div>
          <p className="footer-label">Practice</p>
          <Link href="/#about">About</Link>
          <Link href="/#coaching">Coaching</Link>
          <Link href="/#nlp">NLP</Link>
          <Link href="/#method">The method</Link>
        </div>
        <div>
          <p className="footer-label">Information</p>
          <Link href="/#stories">Success stories</Link>
          <Link href="/#faq">Resources & FAQ</Link>
          <Link href="/book">Book a discovery call</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms & conditions</Link>
          <p className="footer-note">Online or in-studio sessions by appointment.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Talat K</span>
        <span>Thoughtful change, one conversation at a time.</span>
      </div>
    </footer>
  );
}
