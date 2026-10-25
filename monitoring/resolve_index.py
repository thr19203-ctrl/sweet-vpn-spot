#!/usr/bin/env python3
"""Resolve merge conflicts in index.tsx."""

import sys
from pathlib import Path

PROJECT = Path("/c/Users/User/sweet-vpn-spot")
INDEX = PROJECT / "src/routes/index.tsx"

content = INDEX.read_text(encoding="utf-8")

# Replace the Reveal component props conflict
old1 = """<<<<<<< HEAD
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
=======
  children: ReactNode;
>>>>>>> 37edbc4 (auto-fix: SRE health monitoring and quality gate repairs)
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);"""

new1 = """function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);"""

if old1 in content:
    content = content.replace(old1, new1, 1)
    print("Resolved Reveal component props conflict")
else:
    print("Reveal props conflict not found")

# Replace the IntersectionObserver conflict
old2 = """<<<<<<< HEAD
    // Without IntersectionObserver the reveal would never fire and the whole
    // section would stay at opacity 0, so render it immediately instead.
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
=======
>>>>>>> 37edbc4 (auto-fix: SRE health monitoring and quality gate repairs)"""

new2 = """    const io = new IntersectionObserver("""

if old2 in content:
    content = content.replace(old2, new2, 1)
    print("Resolved IntersectionObserver conflict")
else:
    print("IntersectionObserver conflict not found")

# Replace the Btn component conflict (React.ReactNode -> ReactNode)
old3 = """const Btn = ({
  href,
  children,
  light,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) => ("""

new3 = """const Btn = ({ href, children, light }: { href: string; children: ReactNode; light?: boolean }) => ("""

if old3 in content:
    content = content.replace(old3, new3, 1)
    print("Resolved Btn component conflict")
else:
    print("Btn component conflict not found")

# Replace the Nav items conflict
old4 = """    { id: "Продукт", label: t.nav[0] },
    { id: "Протоколы", label: t.nav[1] },
    { id: "Скачать", label: t.nav[2] },
    { id: "Тарифы", label: t.nav[3] },"""

new4 = """    { id: "Продукт", label: t.nav[0] ?? "Product" },
    { id: "Протоколы", label: t.nav[1] ?? "Protocols" },
    { id: "Скачать", label: t.nav[2] ?? "Download" },
    { id: "Тарифы", label: t.nav[3] ?? "Pricing" },
    { id: "Поддержка", label: t.nav[4] ?? "Support" },"""

if old4 in content:
    content = content.replace(old4, new4, 1)
    print("Resolved Nav items conflict")
else:
    print("Nav items conflict not found")

INDEX.write_text(content, encoding="utf-8")
print("Done")
