import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Terms of Use — Cfg";
const DESC = "Terms of Use for Cfg VPN configs, subscriptions and the Cfg Discord community.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

const sections: [string, string[]][] = [
  ["1. Acceptance of Terms", ["By accessing or using Cfg (the \"Service\"), including our website, VPN configurations, subscriptions and Discord server, you agree to be bound by these Terms of Use. If you do not agree, do not use the Service."]],
  ["2. Eligibility", ["You must be at least 13 years old to use the Service. If you are under the age of majority in your jurisdiction, you may only use the Service with the consent of a parent or legal guardian."]],
  ["3. The Service", ["Cfg provides VPN configuration files (VLESS, WireGuard, Shadowsocks, Hysteria2 and others) and related support. Configurations are provided \"as is\" and availability, speed and locations may change at any time without notice."]],
  ["4. Accounts and Discord", ["Access to configurations is distributed through our Discord server. You are responsible for your Discord account and any activity under it. We may remove access for users who violate these Terms or Discord's own rules."]],
  ["5. Acceptable Use", ["You agree not to use the Service to:", "• break any applicable law or regulation;", "• send spam, malware or engage in fraud, hacking or abuse of third-party networks;", "• resell, redistribute or publicly share paid configurations;", "• attempt to disrupt, overload or reverse-engineer our infrastructure."]],
  ["6. Payments and Refunds", ["Paid plans (Plus and Pro) are billed in advance for the selected period. Unless required by law, payments are non-refundable. Prices may change; changes will not affect a period you have already paid for."]],
  ["7. Privacy", ["We do not log your browsing activity through our servers. We may process minimal technical data required to operate and secure the Service."]],
  ["8. Disclaimer of Warranties", ["The Service is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including fitness for a particular purpose, uninterrupted operation or error-free performance."]],
  ["9. Limitation of Liability", ["To the maximum extent permitted by law, Cfg shall not be liable for any indirect, incidental, special or consequential damages arising out of or related to your use of the Service."]],
  ["10. Termination", ["We may suspend or terminate your access at any time, with or without notice, if you violate these Terms."]],
  ["11. Changes to These Terms", ["We may update these Terms from time to time. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms."]],
  ["12. Contact", ["Questions about these Terms? Contact us on our Discord server: discord.gg/6DsXVJkEJw."]],
];

function Terms() {
  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Cfg</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 20, 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map(([h, ps]) => (
            <section key={h}>
              <h2 className="text-xl font-semibold">{h}</h2>
              {ps.map((p) => <p key={p} className="mt-3 leading-relaxed text-muted-foreground">{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
