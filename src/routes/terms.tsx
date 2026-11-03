import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Terms of Use — Cfg";
const DESC = "Terms of Use for free Cfg VPN configurations shared through our Discord server.";

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
  [
    "1. Acceptance of Terms",
    [
      'By accessing or using Cfg (the "Service"), including our website, our Discord server and the VPN configurations we share, you agree to be bound by these Terms of Use. If you do not agree, do not use the Service.',
    ],
  ],
  [
    "2. Eligibility",
    [
      "You must be at least 13 years old to use the Service. If you are under the age of majority in your jurisdiction, you may only use the Service with the consent of a parent or legal guardian.",
    ],
  ],
  [
    "3. The Service",
    [
      'Cfg provides free VPN configuration files (VLESS, WireGuard, Shadowsocks, Hysteria2 and others) and related support. Configurations are shared through our Discord server, are provided "as is", and availability, speed and locations may change at any time without notice.',
    ],
  ],
  [
    "4. Configuration Security",
    [
      "You are responsible for keeping your configuration links and files secure. Do not share private configurations or access credentials. Access may be suspended if you violate these Terms.",
    ],
  ],
  [
    "5. Acceptable Use",
    [
      "You agree not to use the Service to:",
      "• break any applicable law or regulation;",
      "• send spam, malware or engage in fraud, hacking or abuse of third-party networks;",
      "• sell, resell or redistribute configurations obtained from Cfg;",
      "• attempt to disrupt, overload or reverse-engineer our infrastructure.",
    ],
  ],
  [
    "6. Free Access and Discord",
    [
      "The Service is free of charge. Configurations are distributed in our Discord server, which you join through the invite link on our website. Your use of Discord is also subject to Discord's own Terms of Service and Community Guidelines.",
      "You must follow the rules of our Discord server. We may remove members or revoke access to configurations if these Terms or the server rules are violated.",
    ],
  ],
  [
    "7. Privacy",
    [
      "We do not log your browsing activity through our servers. We may process minimal technical data required to operate and secure the Service.",
    ],
  ],
  [
    "8. Disclaimer of Warranties",
    [
      'The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose, uninterrupted operation or error-free performance.',
    ],
  ],
  [
    "9. Limitation of Liability",
    [
      "To the maximum extent permitted by law, Cfg shall not be liable for any indirect, incidental, special or consequential damages arising out of or related to your use of the Service.",
    ],
  ],
  [
    "10. Termination",
    [
      "We may suspend or terminate your access at any time, with or without notice, if you violate these Terms.",
    ],
  ],
  [
    "11. Changes to These Terms",
    [
      "We may update these Terms from time to time. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.",
    ],
  ],
];

function Terms() {
  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Cfg
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: November 3, 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map(([h, ps]) => (
            <section key={h}>
              <h2 className="text-xl font-semibold">{h}</h2>
              {ps.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
