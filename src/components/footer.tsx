import { ArrowUp, ArrowUpRight } from "lucide-react";
import { site, socialLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer site-wrap" data-print-hide>
      <section
        className="contact"
        id="contact"
        data-od-id="contact"
        aria-labelledby="contact-heading"
      >
        <div>
          <h2 id="contact-heading">Let’s compare notes.</h2>
          <p>On platforms, a tricky systems problem, or something you’re building.</p>
        </div>
        <div className="contact-details">
          <a className="email-link" href={`mailto:${site.email}`}>
            <span>{site.email}</span><ArrowUpRight aria-hidden />
          </a>
          <nav className="contact-social" aria-label="Elsewhere">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.icon === "newsletter" ? "RSS" : link.label}
                <ArrowUpRight aria-hidden />
              </a>
            ))}
          </nav>
        </div>
      </section>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href="#top">Back to top<ArrowUp aria-hidden /></a>
      </div>
    </footer>
  );
}
