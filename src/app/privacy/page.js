export const metadata = {
  title: "Privacy Policy | Talat K",
  description: "How Talat K handles information shared through the coaching booking website.",
};

export default function PrivacyPage() {
  return (
    <article className="legal-shell">
      <p className="eyebrow">Your information</p>
      <h1>Privacy policy</h1>
      <p className="lede">
        Your trust matters. This policy explains the information collected when
        you use the Talat K coaching website and how it is used.
      </p>

      <h2>Information we collect</h2>
      <p>
        When you create an account or book a session, we may collect your name,
        email address, account details, booking preferences, and information you
        choose to share about your goals. Payment details are handled by the
        payment provider and are not stored by this website.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To create and manage your account.</li>
        <li>To schedule sessions and send booking-related updates.</li>
        <li>To provide, maintain, and improve the service.</li>
        <li>To protect the website and prevent misuse.</li>
      </ul>

      <h2>Sharing and retention</h2>
      <p>
        We do not sell your personal information. We share information only
        with service providers needed to operate the website, process payments,
        or provide communications. We retain information only for as long as it
        is needed for these purposes or as required by law.
      </p>

      <h2>Your choices</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        information by contacting the practice. You can also stop receiving
        non-essential communications at any time.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, please contact Talat K through the
        email address provided for your coaching relationship.
      </p>
    </article>
  );
}
