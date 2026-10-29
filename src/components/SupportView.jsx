// v1.10.75 - Support & About. Who builds the app, how to help (free ways
// first, then UPI), and what OM RAJ does for businesses. Decided with the
// maintainer: ask gently, never lock a feature, never print anything on a
// user's invoice. UPI only for money: it works offline (the QR is drawn here)
// and costs the giver nothing.
import { useState } from 'react';
import { Heart, Star, Share2, Bug, Mail, Globe, Code, Wrench, Database, LifeBuoy, Bot, Smartphone, Workflow, Users } from 'lucide-react';
import { toast } from './Toast';
import useSupporters from './useSupporters';
import WhatsNew from './WhatsNew';
import SupportersList from './SupportersList';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const UPI_NAME = 'Omraj';
const CUSTOM_QR_IMAGE = '/support-qr.jpeg';
const REPO = 'https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-';
const GITHUB_PROFILE = 'https://github.com/OmRaj6666';
const LINKEDIN_PROFILE = 'https://www.linkedin.com/in/om-raj-vit/';
const EMAIL = 'omraj6666@gmail.com';

const SERVICES = [
  { icon: Code, title: 'Custom software & web apps', text: 'Websites, web apps and business tools built for how you work.' },
  { icon: Wrench, title: 'Customising this app', text: 'Your own invoice layout, reports or features in Free GST Billing.' },
  { icon: Database, title: 'Setup & data migration', text: 'Installation, moving your data from Tally or Excel, and training.' },
  { icon: LifeBuoy, title: 'Support plans for businesses', text: 'Priority help and updates on a yearly plan.' },
  { icon: Bot, title: 'AI integration', text: 'Add AI to your product: assistants, document reading, smart search.' },
  { icon: Workflow, title: 'AI automation', text: 'Automate the repetitive work in the software you already use.' },
  { icon: Smartphone, title: 'Mobile apps', text: 'Android and iPhone apps for your business or customers.' },
];

export default function SupportView() {
  const tracker = useSupporters();

  const shareText = `I make my GST invoices with Free GST Billing Software. It's free, works offline and keeps data on your own computer: ${REPO}`;
  const freeWays = [
    { icon: Star, title: 'Star it on GitHub', text: 'Helps other businesses find it.', href: REPO },
    { icon: Share2, title: 'Tell another business', text: 'Send it to a friend on WhatsApp.', href: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
    { icon: Users, title: 'Connect on LinkedIn', text: 'Follow updates and engineering work.', href: LINKEDIN_PROFILE },
    { icon: Bug, title: 'Report a bug or ask for a feature', text: 'Many features started as a request.', href: `${REPO}/issues/new/choose` },
  ];

  const card = { padding: '1.25rem 1.5rem' };
  const linkRow = { display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', color: 'inherit', textDecoration: 'none' };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support &amp; About</h1>
          <p className="page-subtitle">Who makes Free GST Billing, and how you can help it grow</p>
        </div>
      </div>

      <div className="glass-panel" style={{ ...card, marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Heart size={28} style={{ color: '#e11d48', flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>Free, and it stays free</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '70ch' }}>
            Free GST Billing is built and maintained by <b><a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@omraj</a></b> in India. No ads, no account, no locked features,
            and your invoices never leave this computer. If it saves you time every month, you can help keep the
            fixes and new features coming.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="glass-panel" style={card}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Support with UPI QR</h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Scan with GPay, PhonePe, Paytm, BHIM, SBI or any UPI app. Any amount helps keep updates coming.</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 12, lineHeight: 0, border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <img src={CUSTOM_QR_IMAGE} width={200} height={200} style={{ objectFit: 'contain', borderRadius: 8 }} alt={`UPI QR code to pay ${UPI_NAME}`} />
            </div>
            <p style={{ marginTop: '0.85rem', marginBottom: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Scan the QR code above with any UPI app to support ongoing open-source development.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={card}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Help without paying</h3>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>These matter just as much.</p>
          {freeWays.map((w) => (
            <a key={w.title} href={w.href} target="_blank" rel="noopener noreferrer" style={linkRow}>
              <w.icon size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
              <span>
                <span style={{ display: 'block', fontWeight: 600 }}>{w.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.text}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {tracker && (
        <div className="glass-panel" style={{ ...card, marginBottom: '1.25rem' }} aria-label="Supporters">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Users size={26} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <h3 style={{ margin: '0 0 0.2rem', fontSize: '1rem' }}>
                {tracker.totalReceived > 0
                  ? <>{inr(tracker.totalReceived)} received so far{tracker.supporters ? ` from ${tracker.supporters} supporter${tracker.supporters === 1 ? '' : 's'}` : ''}</>
                  : 'Be the first to support Free GST Billing'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Every rupee goes into fixes and new features.{tracker.updated ? ` Updated ${new Date(`${tracker.updated}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.` : ''}
              </p>
              {tracker.goal && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span>Goal{tracker.goal.label ? `: ${tracker.goal.label}` : ''}</span>
                    <span style={{ fontWeight: 600 }}>{inr(tracker.totalReceived)} of {inr(tracker.goal.amount)}</span>
                  </div>
                  <div role="progressbar" aria-valuemin={0} aria-valuemax={tracker.goal.amount} aria-valuenow={Math.min(tracker.totalReceived, tracker.goal.amount)}
                    aria-label="Progress towards the goal"
                    style={{ height: 8, borderRadius: 4, background: 'var(--bg-secondary)', marginTop: '0.35rem', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (tracker.totalReceived / tracker.goal.amount) * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                  </div>
                </div>
              )}
              <SupportersList names={tracker.thanks} />
            </div>
          </div>
        </div>
      )}

      <WhatsNew />

      <div className="glass-panel" style={card}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Work with OM RAJ</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>OM RAJ builds modern software and custom business solutions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.1rem' }}>
          {SERVICES.map((w) => (
            <div key={w.title} style={{ display: 'flex', gap: '0.7rem', padding: '0.85rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
              <w.icon size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{w.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.45 }}>{w.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry (from Free GST Billing)')}`}>
            <Mail size={16} /> Email {EMAIL}
          </a>
          <a className="btn btn-secondary" href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">
            <Globe size={16} /> GitHub @OmRaj6666
          </a>
          <a className="btn btn-secondary" href={LINKEDIN_PROFILE} target="_blank" rel="noopener noreferrer">
            <Users size={16} /> LinkedIn /om-raj-vit
          </a>
        </div>
      </div>
    </div>
  );
}
