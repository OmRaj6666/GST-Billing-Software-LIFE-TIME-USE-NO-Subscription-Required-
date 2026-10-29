// Support & About - the docs-site twin of the app's Support & About page
// (src/components/SupportView.jsx). Keep the two saying the same things.
import QRCode from 'qrcode';
import { SITE } from '../site.mjs';

const UPI_ID = '9279126895@ptsbi';
const upi = (amount) => `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=OM%20RAJ&cu=INR`
  + `&tn=${encodeURIComponent('Free GST Billing support')}${amount ? `&am=${amount}.00` : ''}`;
// Drawn at build time: the page needs no script, and the QR works offline once saved.
const qrSvg = await QRCode.toString(upi(0), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });

const SERVICES = [
  ['Custom software &amp; web apps', 'Websites, web apps and business tools built for how you work.'],
  ['Customising this app', 'Your own invoice layout, reports or features in Free GST Billing.'],
  ['Setup &amp; data migration', 'Installation, moving your data from Tally or Excel, and training.'],
  ['Support plans for businesses', 'Priority help and updates on a yearly plan.'],
  ['AI integration', 'Add AI to your product: assistants, document reading, smart search.'],
  ['AI automation', 'Automate the repetitive work in the software you already use.'],
  ['Mobile apps', 'Android and iPhone apps for your business or customers.'],
];
const share = encodeURIComponent(`I make my GST invoices with Free GST Billing Software. It's free, works offline and keeps data on your own computer: ${SITE.repo}`);

export default [
{
  slug: 'support',
  title: 'Support & About',
  nav: 'Support & About',
  lead: 'Who makes Free GST Billing, how you can help it grow, and what OM RAJ builds for businesses.',
  body: `
<section id="about">
<h2>Free, and it stays free</h2>
<p>Free GST Billing is built and maintained by <a href="${SITE.publisher.url}">@omraj</a> in India. No ads, no account, no locked features, and your invoices never leave your computer. The full source code is on <a href="${SITE.repo}">GitHub</a> under the MIT licence.</p>
<p>If it saves you time every month, you can help keep the fixes and new features coming.</p>
</section>

<section id="upi">
<h2>Support with UPI</h2>
<p>Scan with GPay, PhonePe, Paytm or any UPI app. Any amount helps.</p>
<div class="upi-box">
  <div class="upi-qr" role="img" aria-label="UPI QR code to pay OM RAJ">${qrSvg}</div>
  <div class="upi-text">
    <p class="upi-label">UPI ID</p>
    <p class="upi-id"><code>${UPI_ID}</code></p>
    <p class="upi-amounts">On your phone, tap an amount to open your UPI app:
      <a href="${upi(101)}">₹101</a> <a href="${upi(251)}">₹251</a> <a href="${upi(501)}">₹501</a> <a href="${upi(0)}">Any amount</a></p>
  </div>
</div>
<p>The payment note says "Free GST Billing support". Paying from the app's Support &amp; About page adds your business name to it, so OM RAJ can thank you.</p>
</section>

<section id="supporters" class="supporters" hidden>
<h2>Supporters</h2>
<!-- Filled in by docs.js from supporters.json in the GitHub repo, which the
     maintainer updates; stays hidden when it cannot be read. -->
<p class="supporters-total"></p>
<p class="supporters-meta"></p>
<div class="supporters-goal" hidden>
  <p class="supporters-goal-text"></p>
  <div class="supporters-bar" role="progressbar" aria-label="Progress towards the goal" aria-valuemin="0"><span></span></div>
</div>
<p class="supporters-thanks" hidden></p>
</section>

<section id="free-ways">
<h2>Help without paying</h2>
<p>These matter just as much.</p>
<ul>
  <li><strong><a href="${SITE.repo}">Star it on GitHub</a></strong>: helps other businesses find it.</li>
  <li><strong><a href="https://wa.me/?text=${share}">Tell another business</a></strong>: send it to a friend on WhatsApp.</li>
  <li><strong><a href="${SITE.repo}/issues/new/choose">Report a bug or ask for a feature</a></strong>: many features started as a request.</li>
</ul>
</section>

<section id="weekly">
<h2>A new update every Saturday</h2>
<p>Every Saturday we release one update with that week's fixes and new features. The app tells you when it is ready: click <b>Update</b> in the sidebar, and your invoices and settings are kept. Anything urgent, such as the app not opening, is fixed straight away.</p>
<ul>
  <li><strong><a href="${SITE.repo}/issues/new?template=bug_report.yml">Report a problem</a></strong>: say which version, which computer, and what you did. That lets us fix it the same week.</li>
  <li><strong><a href="${SITE.repo}/issues/new?template=feature_request.yml">Ask for a feature</a></strong>: we read every request each week, and the ones most people ask for come first. Add a 👍 to an <a href="${SITE.repo}/issues">open request</a> to vote for it.</li>
</ul>
<p>You get a reply on GitHub when it ships. What each update changed is in the app under <b>Support &amp; About → What's new</b>, in the <a href="${SITE.repo}/blob/main/CHANGELOG.md">full changelog</a>, and on <a href="${SITE.repo}/releases">GitHub Releases</a>.</p>
</section>

<section id="services">
<h2>Work with OM RAJ</h2>
<p>The developer behind this app builds software for businesses too.</p>
<div class="service-grid">
${SERVICES.map(([t, d]) => `  <div class="service"><strong>${t}</strong><span>${d}</span></div>`).join('\n')}
</div>
<p>Email <a href="mailto:omraj6666@gmail.com?subject=${encodeURIComponent('Project enquiry (from the Free GST Billing docs)')}">omraj6666@gmail.com</a>.</p>
</section>

<section id="in-the-app">
<h2>In the app</h2>
<p>The same page is in the app: <b>Support &amp; About</b>, near the bottom of the sidebar. See <a href="shortcuts.html#support">Getting around</a> for the thank-you card and the GitHub star note.</p>
</section>
`,
},
];
