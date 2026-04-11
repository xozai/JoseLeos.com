const SOCIAL = [
  { href: "https://github.com/joseleos", label: "GitHub" },
  { href: "https://twitter.com/joseleos", label: "Twitter / X" },
  { href: "https://linkedin.com/in/joseleos", label: "LinkedIn" },
  { href: "/feed.xml", label: "RSS Feed" },
];

export default function Footer() {
  return (
    <footer className="bg-[--background-secondary] py-20">
      <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="text-lg font-black tracking-tighter text-[--foreground]">
          JOSE LEOS
        </span>

        <div className="flex gap-8">
          {SOCIAL.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-[0.75rem] font-bold uppercase tracking-[0.05em] text-[--foreground-muted] hover:text-[--foreground] transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        <span className="text-[0.75rem] font-bold uppercase tracking-[0.05em] text-[--foreground-muted]">
          &copy; {new Date().getFullYear()} Jose Leos
        </span>
      </div>
    </footer>
  );
}
