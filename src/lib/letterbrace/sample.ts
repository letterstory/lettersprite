import type { Post } from "./types";

/**
 * Sample posts shown when no Letterbrace collection is connected (i.e. no
 * LETTERBRACE_API_KEY). They keep a fresh deployment looking alive and double
 * as a live preview of the active theme — enough of them, across enough
 * sections, to populate the magazine layouts (broadsheet rivers, feeds,
 * mosaics). They vanish the moment a key is set.
 *
 * The set deliberately mixes: some posts carry an author, most don't (to
 * exercise the deterministic byline generator); some carry a cover image, most
 * don't (to exercise the generated tessellation covers); some carry a date,
 * most don't (to exercise the stable synthesized datelines).
 */

const P = (
  id: string,
  slug: string,
  title: string,
  tag: string,
  excerpt: string,
  body: string,
  extra: Partial<Post> = {},
): Post => ({
  id,
  slug,
  title,
  excerpt,
  content: body,
  status: "published",
  author: null,
  coverImage: null,
  tags: [tag],
  createdAt: null,
  updatedAt: null,
  ...extra,
});

export const samplePosts: Post[] = [
  P(
    "sample-1",
    "the-quiet-revolution-in-small-models",
    "The quiet revolution in small language models",
    "Technology",
    "While the industry chased ever-larger models, a wave of compact, specialized systems began quietly outperforming them where it counts.",
    `<p>For two years the story was size. Bigger models, bigger clusters, bigger bills. Then, almost without anyone announcing it, the frontier moved somewhere else entirely.</p>
<h2>Small, fast, and specialized</h2>
<p>The new generation of compact models doesn't try to know everything. It knows one domain deeply, runs on a single card, and answers in milliseconds. For most real products, that trade is not a compromise — it's the whole point.</p>
<ul>
<li>Lower latency changes what interactions feel possible.</li>
<li>On-device inference sidesteps a class of privacy problems.</li>
<li>Fine-tuning a small model is cheap enough to do weekly.</li>
</ul>
<blockquote>The best model is rarely the biggest one you can afford. It's the smallest one that clears the bar.</blockquote>
<p>What comes next is not one model to rule them all, but a fleet of them — each small, each sharp, each disposable.</p>`,
    { author: "Priya Nair", createdAt: "2026-07-02T09:00:00.000Z", coverImage: "https://picsum.photos/seed/small-models/1200/675" },
  ),
  P(
    "sample-2",
    "inside-the-new-space-economy",
    "Inside the new space economy's boom year",
    "Business",
    "Launch costs have fallen faster than almost anyone predicted. The businesses being built on top of that curve are only now coming into view.",
    `<p>When the cost of reaching orbit falls by an order of magnitude, the interesting question isn't who flies — it's what suddenly becomes worth flying.</p>
<h2>The picks-and-shovels years</h2>
<p>The last decade rewarded the companies building the rockets. The next will reward the ones building on top of routine, boring, cheap access to space.</p>
<p>Earth observation, in-orbit servicing, and a genuine market for logistics beyond the atmosphere are all moving from slide decks to signed contracts.</p>
<blockquote>Infrastructure is invisible right up until the moment everything depends on it.</blockquote>
<p>The boom is real. Whether it becomes an industry or a bubble depends on the least glamorous thing of all: unit economics.</p>`,
    { createdAt: "2026-06-28T09:00:00.000Z" },
  ),
  P(
    "sample-3",
    "designing-for-calm",
    "Designing for calm: the case for less",
    "Design",
    "The most memorable products rarely shout. A short field guide to interfaces that feel effortless because someone did the hard work of removing things.",
    `<p>The most memorable products rarely shout. They earn attention by removing friction until what remains feels effortless — almost inevitable.</p>
<h2>Start with subtraction</h2>
<p>Before adding another panel, ask what could be taken away. Every element you keep should justify its presence on the page.</p>
<ul>
<li>Cut anything that repeats information already on screen.</li>
<li>Default to one clear action per view.</li>
<li>Let whitespace do the work that borders used to.</li>
</ul>
<blockquote>Simplicity is not the absence of clutter; it is the presence of clarity.</blockquote>
<p>Calm interfaces aren't empty. They're considered. The restraint <em>is</em> the design.</p>`,
    { author: "Maya Chen", coverImage: "https://picsum.photos/seed/calm-design/1200/675" },
  ),
  P(
    "sample-4",
    "the-city-that-taught-itself-to-cool-down",
    "The city that taught itself to cool down",
    "Science",
    "Faced with brutal summers, one metropolis rebuilt itself around shade, water and paint — and became a live experiment in urban survival.",
    `<p>The heat came for the city first in the afternoons, then all day, then all summer. So the city did something unusual: it treated temperature as infrastructure.</p>
<h2>Shade as a public good</h2>
<p>Reflective pavement, restored waterways, and a canopy target written into law turned a slogan into a measurable program.</p>
<p>Early results are modest but real — a few degrees here, a cooler bus stop there. Multiplied across a summer, a few degrees is the difference between inconvenience and emergency.</p>
<blockquote>You cannot air-condition your way out of a hotter planet. You have to design for it.</blockquote>
<p>Other cities are watching, notebooks open.</p>`,
    {},
  ),
  P(
    "sample-5",
    "shipping-fast-without-breaking-things",
    "Shipping fast without breaking things",
    "Technology",
    "Moving fast and staying safe aren't opposites — they're the same discipline seen from two angles.",
    `<p>Shipping quickly and shipping safely are not opposites. The teams that move fastest are usually the ones that made mistakes cheap to make and easy to undo.</p>
<h2>Make reverting boring</h2>
<p>If a rollback is a routine, one-command affair, you can afford to be bold. Invest there first.</p>
<pre><code>git revert HEAD --no-edit &amp;&amp; deploy</code></pre>
<p>Feature flags, small pull requests, and fast tests turn scary releases into non-events.</p>
<ul>
<li>Keep changes small enough to hold in your head.</li>
<li>Automate the checks you'd otherwise skip under pressure.</li>
</ul>
<p>Speed is a byproduct of confidence, and confidence is a byproduct of good guardrails.</p>`,
    { author: "Diego Alvarez" },
  ),
  P(
    "sample-6",
    "the-comeback-of-the-humble-newsletter",
    "The improbable comeback of the humble newsletter",
    "Culture",
    "In an age of algorithms, the most intimate medium on the internet turned out to be the oldest one: an email from someone you trust.",
    `<p>Every few years someone declares email dead. Every few years it quietly wins again.</p>
<h2>Ownership beats reach</h2>
<p>A feed can be reshuffled overnight. A subscriber list is yours. Writers rediscovering that fact have built real livelihoods on a medium the platforms forgot to enclose.</p>
<blockquote>The inbox is the last place online where you decide what you see.</blockquote>
<p>The lesson isn't nostalgia. It's control — over the relationship, the format, and the business.</p>`,
    { createdAt: "2026-06-15T09:00:00.000Z" },
  ),
  P(
    "sample-7",
    "the-quiet-power-of-typography",
    "The quiet power of good typography",
    "Design",
    "The best typography is invisible. Notes on rhythm, measure, and letting the words lead.",
    `<p>Typography is the interface most people never notice — and that's precisely the point. Good type gets out of the way of the words.</p>
<h2>Rhythm before decoration</h2>
<p>Consistent spacing, a sensible measure, and a clear hierarchy will do more for readability than any typeface ever could.</p>
<blockquote>Aim for 60–75 characters per line. Your readers' eyes will thank you.</blockquote>
<p>Choose one family, learn its weights, and let contrast — not variety — create emphasis.</p>`,
    {},
  ),
  P(
    "sample-8",
    "what-markets-misunderstand-about-patience",
    "What the markets keep misunderstanding about patience",
    "Business",
    "The companies that compound quietly are rarely the ones on the front page — until, suddenly, they are the only story that matters.",
    `<p>Impatience is expensive. It shows up as churn, as pivots, as the constant re-pricing of things that were never going to move on a quarterly schedule.</p>
<h2>Compounding is boring on purpose</h2>
<p>The most valuable businesses of the last generation looked unremarkable for years. Their advantage wasn't a secret; it was the willingness to keep doing an obvious thing for longer than anyone else.</p>
<blockquote>The market can stay irrational, but it cannot stay uninterested forever.</blockquote>
<p>Patience isn't passivity. It's a bet that time rewards the disciplined.</p>`,
    {},
  ),
  P(
    "sample-9",
    "the-return-of-the-generalist",
    "The return of the generalist",
    "Ideas",
    "As tools automate the specialist's edge, the people who can connect distant fields are quietly becoming the most valuable in the room.",
    `<p>For a long time the advice was clear: specialize, go deep, own a niche. That advice is aging fast.</p>
<h2>Range as an advantage</h2>
<p>When any single skill can be summoned on demand, the scarce ability is knowing which skills to combine, and when. The generalist's old weakness — a little of everything — becomes a strength.</p>
<ul>
<li>Translation between disciplines is where new ideas live.</li>
<li>Judgment doesn't automate the way execution does.</li>
</ul>
<p>The future belongs to people who are curious in more than one direction.</p>`,
    { author: "Elias Bennett" },
  ),
  P(
    "sample-10",
    "a-field-guide-to-honest-metrics",
    "A field guide to honest metrics",
    "Technology",
    "Every dashboard tells a story. The trick is noticing which stories your numbers are quietly refusing to tell.",
    `<p>Metrics are not neutral. They encode what you decided to care about, and — just as loudly — what you decided to ignore.</p>
<h2>Vanity, actionable, honest</h2>
<p>A number is honest when it can go down. If a metric only ever rises, it is decoration, not instrumentation.</p>
<blockquote>Measure the thing you would be embarrassed to see fall.</blockquote>
<p>Good teams argue about definitions before they argue about targets. The definition is where the honesty lives.</p>`,
    {},
  ),
  P(
    "sample-11",
    "the-politics-of-the-fifteen-minute-city",
    "The politics of the fifteen-minute city",
    "Politics",
    "A planning idea about walkable neighborhoods became, improbably, a lightning rod. What the fight is really about.",
    `<p>The premise sounds anodyne: arrange a city so daily needs sit within a short walk. The reaction has been anything but.</p>
<h2>Convenience, and its discontents</h2>
<p>Beneath the noise is a real debate about who gets to shape a neighborhood, and who pays for the change. Those are old questions wearing new clothes.</p>
<blockquote>Every map of a better city is also a map of someone's inconvenience.</blockquote>
<p>The idea will outlast the outrage. The hard part — governing the trade-offs — is only beginning.</p>`,
    {},
  ),
  P(
    "sample-12",
    "why-we-still-read-the-classics",
    "Why we still read the classics on screens",
    "Culture",
    "The format changed completely; the appetite didn't. On the stubborn persistence of long, old, difficult books.",
    `<p>By every prediction, the long book should be extinct. Attention is shorter, screens are brighter, the competition is infinite. And yet.</p>
<h2>Difficulty as a feature</h2>
<p>Some things can only be said slowly. Readers keep returning to demanding books for the same reason people climb mountains: the effort is the experience.</p>
<blockquote>A great book doesn't fit your schedule. It rearranges it.</blockquote>
<p>The device is new. The hunger is very, very old.</p>`,
    { author: "Naomi Okafor", createdAt: "2026-05-30T09:00:00.000Z" },
  ),
];
