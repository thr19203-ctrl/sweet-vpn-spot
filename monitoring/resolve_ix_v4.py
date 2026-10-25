content = open(r'C:\Users\User\sweet-vpn-spot\src\routes\index.tsx', encoding='utf-8').read()

# Replace the 5 conflict markers
replacements = [
    # 1. Reveal component props
    ("<<<<<<< HEAD\nfunction Reveal({\n  children,\n  className = \"\",\n  delay = 0,\n}: {\n  children: React.ReactNode;\n=======\n  children: ReactNode;\n}>>>>>>> 37edbc4 (auto-fix: SRE health monitoring and quality gate repairs)\n  className?: string;\n  delay?: number;\n}) {\n  const ref = useRef<HTMLDivElement>(null);",
     """function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);"""),
    
    # 2. IntersectionObserver
    ("<<<<<<< HEAD\n    // Without IntersectionObserver the reveal would never fire and the whole\n    // section would stay at opacity 0, so render it immediately instead.\n    if (typeof IntersectionObserver === \"undefined\") {\n      setOn(true);\n      return;\n    }\n=======\n}>>>>>>> 37edbc4 (auto-fix: SRE health monitoring and quality gate repairs)\n    const io = new IntersectionObserver(\"\"",
     """    const io = new IntersectionObserver("""),
    
    # 3. Btn component
    ("const Btn = ({\n  href,\n  children,\n  light,\n}: {\n  href: string;\n  children: React.ReactNode;\n  light?: boolean;\n}) => (""",
     """const Btn = ({ href, children, light }: { href: string; children: ReactNode; light?: boolean }) => ("""),
    
    # 4. Nav items
    ("    { id: \"Продукт\", label: t.nav[0] },\n    { id: \"Протоколы\", label: t.nav[1] },\n    { id: \"Скачать\", label: t.nav[2] },\n    { id: \"Тарифы\", label: t.nav[3] },\"",
     """    { id: "Продукт", label: t.nav[0] ?? "Product" },\n    { id: "Протоколы", label: t.nav[1] ?? "Protocols" },\n    { id: "Скачать", label: t.nav[2] ?? "Download" },\n    { id: "Тарифы", label: t.nav[3] ?? "Pricing" },\n    { id: "Поддержка", label: t.nav[4] ?? "Support" },"""),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        count += 1
        print(f"Resolved: {count}/4")

open(r'C:\Users\User\sweet-vpn-spot\src\routes\index.tsx', 'w', encoding='utf-8').write(content)
print(f'Total resolved: {count}/4')
