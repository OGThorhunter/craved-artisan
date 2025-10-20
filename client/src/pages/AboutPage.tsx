import {
  Sparkles, HeartHandshake, Leaf, Users, TrendingUp, Factory,
  Star, Quote, BadgeCheck, Store, ShoppingBasket, Handshake,
  CalendarDays, Cookie, UtensilsCrossed, MapPin, LeafyGreen
} from "lucide-react";

const colors = {
  bg: "bg-[#F7F2EC]",
  card: "bg-white/70",
  border: "border-[#7F232E]/15",
  primaryBtn:
    "bg-[#7F232E] text-white hover:bg-[#6b1e27] focus-visible:ring-2 focus-visible:ring-[#7F232E]/40",
  accent: "text-[#5B6E02]",
  ink: "text-[#2b2b2b]",
  sub: "text-[#4b4b4b]",
};

const STATS = [
  { label: "Local Vendors", value: "1,200+", icon: Store },
  { label: "Products Listed", value: "48k+", icon: ShoppingBasket },
  { label: "Orders Fulfilled", value: "1.1M", icon: BadgeCheck },
  { label: "Cities Served", value: "320+", icon: MapPin },
];

const VALUES = [
  {
    title: "Community First",
    icon: HeartHandshake,
    desc: "We help neighbors buy from neighbors—keeping dollars in local communities.",
  },
  {
    title: "Craft & Quality",
    icon: Factory,
    desc: "From sourdough to smithing, we celebrate skilled work and honest ingredients.",
  },
  {
    title: "Sustainability",
    icon: Leaf,
    desc: "Shorter supply lines, seasonal menus, and less waste through smarter planning.",
  },
  {
    title: "Transparency",
    icon: Star,
    desc: "Clear pricing, real vendors, and production you can trust.",
  },
];

const TIMELINE = [
  {
    year: "2022",
    title: "The spark",
    text:
      "Craved began as a simple way to pre-order from local bakers and makers.",
  },
  {
    year: "2023",
    title: "Windows & inventory",
    text:
      "We launched Sales Windows and a lightweight inventory system tailored to small producers.",
  },
  {
    year: "2024",
    title: "Labels & delivery",
    text:
      "Introduced smart labels, pickup flows, and delivery partners for citywide reach.",
  },
  {
    year: "2025",
    title: "AI for artisans",
    text:
      "Receipt parsing, restock insights, and pricing suggestions—tools that feel like a teammate.",
  },
];

const TEAM = [
  {
    name: "Avery Johnson",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Morgan Lee",
    role: "Product & Design",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Sam Patel",
    role: "Engineering",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Riley Kim",
    role: "Vendor Success",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <main className={`${colors.bg} min-h-screen`}>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-8 md:p-12 shadow-sm backdrop-blur-sm`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-[#7F232E] mb-2">
                <Sparkles className="h-4 w-4" />
                Crafted locally, discovered easily
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold ${colors.ink}`}>
                The marketplace for modern artisans
              </h1>
              <p className={`mt-3 ${colors.sub}`}>
                Craved connects small producers—bakers, growers, artists, and makers—with nearby customers through pickup windows, delivery options, and a clean online shop. We build tools that let independents thrive.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/marketplace" className={`rounded-xl px-4 py-2 ${colors.primaryBtn}`}>
                  Explore the marketplace
                </a>
                <a
                  href="/signup"
                  className="rounded-xl px-4 py-2 border border-[#7F232E]/30 text-[#7F232E] bg-white/80 hover:bg-white"
                >
                  Become a vendor
                </a>
              </div>
            </div>
            <div className="relative h-64 md:h-72 lg:h-80 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1518131678677-a12f0f36f81e?q=80&w=1400&auto=format&fit=crop"
                alt="Local artisans at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Review Ribbon - Centered */}
          <div className="mt-8 flex justify-center">
            <div className="max-w-4xl w-full bg-white/90 border border-[#7F232E]/20 rounded-2xl px-8 py-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-lg font-bold text-[#2b2b2b]">5.0</div>
                  <div className="text-sm text-[#4b4b4b]">Based on 1,247 reviews</div>
                </div>
                
                <div className="text-center flex-1 mx-8">
                  <Quote className="h-6 w-6 text-[#7F232E] mx-auto mb-2" />
                  <p className="text-lg font-medium text-[#2b2b2b] italic">
                    "The artisan cheese selection is incredible!"
                  </p>
                  <p className="text-sm text-[#4b4b4b] mt-1">Emma L. • Verified Customer</p>
                </div>
                
                <div className="text-right text-sm text-[#4b4b4b]">
                  <div>Featured Review</div>
                  <div>Updated daily</div>
                  <div>6 hours ago</div>
                  <div>Local Community</div>
                </div>
              </div>
              
              {/* Carousel dots */}
              <div className="flex justify-center mt-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-[#7F232E]/30"></div>
                <div className="w-2 h-2 rounded-full bg-[#7F232E]"></div>
                <div className="w-2 h-2 rounded-full bg-[#7F232E]/30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-6xl px-4 mt-10 grid gap-6 md:grid-cols-3">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6`}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-[#7F232E]" /> Our mission
          </h2>
          <p className={`mt-2 ${colors.sub}`}>
            Empower independent producers with technology that's simple, fair, and built for real-world workflows.
          </p>
        </div>
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6`}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#7F232E]" /> Our belief
          </h2>
          <p className={`mt-2 ${colors.sub}`}>
            Strong local economies come from many small businesses—not a few massive ones.
          </p>
        </div>
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6`}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LeafyGreen className="h-5 w-5 text-[#7F232E]" /> Our approach
          </h2>
          <p className={`mt-2 ${colors.sub}`}>
            Practical features first: simple order windows, inventory that makes sense, and labels that pass the sniff test.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6 md:p-8`}>
          <h2 className="text-2xl font-bold mb-4">What we value</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border p-5 bg-white/70 border-[#7F232E]/10">
                <div className="flex items-center gap-2 mb-2">
                  <v.icon className="h-5 w-5 text-[#7F232E]" />
                  <div className="font-semibold">{v.title}</div>
                </div>
                <p className={`${colors.sub} text-sm`}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6 md:p-8`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border bg-white/70 border-[#7F232E]/10 p-5">
                <div className="flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-[#7F232E]" />
                  <div className="text-sm text-[#4b4b4b]">{s.label}</div>
                </div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY TIMELINE */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6 md:p-8`}>
          <h2 className="text-2xl font-bold mb-6">Our story</h2>
          <ol className="relative border-s border-dashed border-[#7F232E]/30 ms-4">
            {TIMELINE.map((t, i) => (
              <li key={t.year} className="mb-8 ms-4">
                <div className="absolute -start-3.5 mt-1.5 rounded-full bg-[#7F232E] w-3 h-3" />
                <div className="rounded-2xl border border-[#7F232E]/10 bg-white/70 p-4">
                  <div className="text-sm text-[#7F232E] font-semibold">{t.year}</div>
                  <div className="font-semibold">{t.title}</div>
                  <p className={`${colors.sub} text-sm mt-1`}>{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6 md:p-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Meet the team</h2>
            <a href="/careers" className="text-[#7F232E] text-sm">We're hiring →</a>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map((m) => (
              <figure key={m.name} className="rounded-2xl overflow-hidden border border-[#7F232E]/10 bg-white/80">
                <div className="h-44 w-full overflow-hidden">
                  <img src={m.img} alt={m.name} className="h-full w-full object-cover" />
                </div>
                <figcaption className="p-4">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-[#4b4b4b]">{m.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className={`rounded-3xl ${colors.card} border ${colors.border} p-6 md:p-8`}>
          <h2 className="text-2xl font-bold mb-4">What makers say</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote:
                  "Craved turned my Saturday market line into weekday pre-orders. Scheduling pickups is a breeze.",
                name: "Jules — Sourdough Baker",
              },
              {
                quote:
                  "Labels and windows saved me hours each week. Customers know exactly when and where.",
                name: "Mateo — Small-batch Roaster",
              },
              {
                quote:
                  "The inventory insights are clutch. I restock right before I run out.",
                name: "Nia — Jam & Preserves",
              },
            ].map((t, i) => (
              <blockquote
                key={i}
                className="rounded-2xl border border-[#7F232E]/10 bg-white/70 p-5"
              >
                <Quote className="h-5 w-5 text-[#7F232E]" />
                <p className="mt-2">{t.quote}</p>
                <footer className="mt-3 text-sm text-[#4b4b4b]">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 my-12">
        <div className="rounded-3xl p-6 md:p-8 border border-[#7F232E]/15 bg-[#E8CBAE]">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold">Join the movement</h3>
              <p className={`${colors.sub} mt-2`}>
                Whether you're a cottage baker or a seasoned craftsperson, Craved gives you modern tools without the bloat.
              </p>
            </div>
            <div className="flex gap-3 justify-start md:justify-end">
              <a href="/signup" className={`rounded-xl px-4 py-2 ${colors.primaryBtn}`}>
                Become a vendor
              </a>
              <a href="/marketplace" className="rounded-xl px-4 py-2 border border-[#7F232E]/30 text-[#7F232E] bg-white/80 hover:bg-white">
                Shop local
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}