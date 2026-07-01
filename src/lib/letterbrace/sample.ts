import type { Post } from "./types";

/**
 * Sample posts shown when no Letterbrace collection is connected (i.e. no
 * LETTERBRACE_API_KEY). They keep a fresh deployment looking alive and double
 * as a live preview of the active theme. They vanish the moment a key is set.
 */
export const samplePosts: Post[] = [
  {
    id: "sample-1",
    slug: "designing-for-calm",
    title: "Designing for calm: the case for less",
    excerpt:
      "The most memorable products rarely shout. A short field guide to designing interfaces that feel effortless.",
    content: `
<p>The most memorable products rarely shout. They earn attention by removing friction until what remains feels effortless — almost inevitable.</p>
<h2>Start with subtraction</h2>
<p>Before adding another panel, ask what could be taken away. Every element you keep should justify its presence on the page.</p>
<ul>
<li>Cut anything that repeats information already on screen.</li>
<li>Default to one clear action per view.</li>
<li>Let whitespace do the work that borders used to.</li>
</ul>
<blockquote>Simplicity is not the absence of clutter; it is the presence of clarity.</blockquote>
<p>Calm interfaces aren't empty. They're considered. The restraint <em>is</em> the design.</p>`,
    status: "published",
    author: "Maya Chen",
    coverImage: "https://picsum.photos/seed/calm-design/1200/675",
    tags: ["Design"],
    createdAt: "2026-06-20T09:00:00.000Z",
    updatedAt: null,
  },
  {
    id: "sample-2",
    slug: "shipping-fast-without-breaking-things",
    title: "Shipping fast without breaking things",
    excerpt:
      "Moving fast and staying safe aren't opposites — they're the same discipline seen from two angles.",
    content: `
<p>Shipping quickly and shipping safely are not opposites. The teams that move fastest are usually the ones that made mistakes cheap to make and easy to undo.</p>
<h2>Make reverting boring</h2>
<p>If a rollback is a routine, one-command affair, you can afford to be bold. Invest there first.</p>
<pre><code>git revert HEAD --no-edit &amp;&amp; deploy</code></pre>
<p>Feature flags, small pull requests, and fast tests turn scary releases into non-events.</p>
<ul>
<li>Keep changes small enough to hold in your head.</li>
<li>Automate the checks you'd otherwise skip under pressure.</li>
</ul>
<p>Speed is a byproduct of confidence, and confidence is a byproduct of good guardrails.</p>`,
    status: "published",
    author: "Diego Alvarez",
    coverImage: "https://picsum.photos/seed/ship-fast/1200/675",
    tags: ["Engineering"],
    createdAt: "2026-06-12T09:00:00.000Z",
    updatedAt: null,
  },
  {
    id: "sample-3",
    slug: "the-quiet-power-of-typography",
    title: "The quiet power of good typography",
    excerpt:
      "The best typography is invisible. Notes on rhythm, measure, and letting the words lead.",
    content: `
<p>Typography is the interface most people never notice — and that's precisely the point. Good type gets out of the way of the words.</p>
<h2>Rhythm before decoration</h2>
<p>Consistent spacing, a sensible measure, and a clear hierarchy will do more for readability than any typeface ever could.</p>
<blockquote>Aim for 60–75 characters per line. Your readers' eyes will thank you.</blockquote>
<p>Choose one family, learn its weights, and let contrast — not variety — create emphasis.</p>`,
    status: "published",
    author: "Priya Nair",
    coverImage: "https://picsum.photos/seed/typography/1200/675",
    tags: ["Typography"],
    createdAt: "2026-05-28T09:00:00.000Z",
    updatedAt: null,
  },
];
