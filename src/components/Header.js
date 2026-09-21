"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user, logout, ready } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solid = pathname !== "/" || scrolled;

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`site-header ${solid ? "is-solid" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">TK</span>
          <span className="brand-text">
            Talat K
            <small>NLP Coach</small>
          </span>
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="site-navigation" className={`nav ${menuOpen ? "is-open" : ""}`}>
          <Link href="/#home" onClick={closeMenu}>Home</Link>
          <Link href="/#about" onClick={closeMenu}>About</Link>
          <Link href="/#coaching" onClick={closeMenu}>Coaching</Link>
          <Link href="/#nlp" onClick={closeMenu}>NLP</Link>
          <Link href="/#stories" onClick={closeMenu}>Success stories</Link>
          <Link href="/#faq" onClick={closeMenu}>Resources</Link>
          <Link href="/book" className="nav-cta" onClick={closeMenu}>
            Book a discovery call
          </Link>
          {ready && user ? (
            <>
              {user.role === "coach" || user.role === "admin" ? (
                <Link href="/coach" onClick={closeMenu}>Studio</Link>
              ) : (
                <Link href="/account" onClick={closeMenu}>My sessions</Link>
              )}
              <button type="button" className="text-btn" onClick={() => { logout(); closeMenu(); }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={closeMenu}>Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
