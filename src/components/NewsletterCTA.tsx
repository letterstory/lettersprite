import { env } from "@/env";

/**
 * Newsletter sign-up. Subscriptions are the long-term goal for these
 * publications, so the capture is treated as first-class furniture, not an
 * afterthought. If `NEWSLETTER_ACTION` is set it posts there (Mailchimp,
 * Buttondown, etc.); otherwise it renders as a polished, inert form so the site
 * still looks like it has an audience.
 *
 * `variant`:
 *  - "band"    — a full-width call-to-action block (homepage, footer).
 *  - "inline"  — a compact card (end of an article, sidebar rail).
 */
export function NewsletterCTA({
  variant = "band",
  className = "",
  eyebrow = "The Newsletter",
  heading,
  blurb,
}: {
  variant?: "band" | "inline";
  className?: string;
  eyebrow?: string;
  heading?: string;
  blurb?: string;
}) {
  if (!env.newsletterEnabled) return null;

  const title =
    heading ?? `Get ${env.siteTitle} in your inbox`;
  const description =
    blurb ??
    "The stories that matter, distilled and delivered. Join thousands of readers — free, every week.";

  const action = env.newsletterAction || undefined;
  const method = action ? "post" : undefined;

  const form = (
    <form
      action={action}
      method={method}
      className={
        variant === "band"
          ? "flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
          : "flex w-full flex-col gap-2.5"
      }
    >
      <label className="sr-only" htmlFor={`nl-${variant}`}>
        Email address
      </label>
      <input
        id={`nl-${variant}`}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="min-w-0 flex-1 rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
      />
      <button
        type="submit"
        className="pill-solid shrink-0 rounded-[var(--radius)] px-5 py-2.5 text-[0.8rem] transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  );

  if (variant === "inline") {
    return (
      <aside
        className={`cta-band flex flex-col gap-3 rounded-[var(--radius)] p-6 ${className}`}
      >
        <p className="kicker">{eyebrow}</p>
        <h3 className="font-display text-xl font-bold leading-tight text-heading">
          {title}
        </h3>
        <p className="text-sm text-muted">{description}</p>
        {form}
        <p className="text-xs text-muted">No spam. Unsubscribe anytime.</p>
      </aside>
    );
  }

  return (
    <section
      className={`cta-band rounded-[var(--radius)] px-6 py-10 sm:px-10 sm:py-12 ${className}`}
    >
      <div className="container-content flex flex-col items-center gap-4 text-center">
        <p className="kicker">{eyebrow}</p>
        <h2 className="display max-w-xl text-3xl text-heading sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-lg text-muted">{description}</p>
        <div className="mt-1 flex w-full justify-center">{form}</div>
        <p className="text-xs text-muted">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
