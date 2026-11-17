import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

const crafts = [
  "Mithila Art",
  "Crochet",
  "Bamboo Crafts",
  "Leaf Crafts",
  "Handmade Decor",
  "Paintings and Sketches",
  "Traditional Crafts",
  "Custom Creations",
];

const steps = [
  {
    title: "A listing is prepared",
    text: "An artisan, or a helper working with that artisan’s consent, adds photographs and a description in English and Nepali.",
  },
  {
    title: "The artisan decides",
    text: "The artisan reviews the listing and approves it, or asks for changes. A helper cannot publish it alone.",
  },
  {
    title: "LokArt verifies it",
    text: "An administrator checks the listing. Only a verified creation can appear in the public marketplace.",
  },
  {
    title: "A customer orders",
    text: "Customers can order without an account and pay cash on delivery. The order goes to the artisan who made the piece.",
  },
];

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:bg-ivory focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content">
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_0.8fr] md:px-8 md:py-24">
          <div>
            <p className="text-sm tracking-[0.2em] text-teal uppercase">Parsa · The Terai · Nepal</p>
            <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-charcoal md:text-7xl">
              Every creation has a story. Every creator deserves a stage.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/80">
              Discover handmade treasures, connect with local creators and bring the beauty of
              traditional craftsmanship into everyday life.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#products" className="bg-vermilion px-6 py-3 text-center text-ivory hover:bg-charcoal">
                Explore Creations
              </a>
              <a
                href="#creators"
                className="border border-charcoal px-6 py-3 text-center text-charcoal hover:bg-charcoal hover:text-ivory"
              >
                Become a Creator
              </a>
            </div>
          </div>
          <aside className="flex flex-col justify-between bg-teal px-7 py-8 text-ivory md:min-h-80">
            <p className="font-serif text-3xl leading-tight">No Craft Forgotten. No Creator Unseen.</p>
            <p className="mt-10 text-sm tracking-[0.16em] text-terai uppercase">
              Where Heritage Meets Opportunity
            </p>
          </aside>
        </section>

        <section className="bg-charcoal text-ivory">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-sm tracking-[0.14em] uppercase md:grid-cols-3 md:px-8">
            <p>Craft first</p>
            <p className="text-terai">Consent before listing</p>
            <p>Verified before public</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2 md:px-8">
          <h2 className="font-serif text-4xl leading-tight">A stage for the people who make the work.</h2>
          <div className="space-y-5 text-lg leading-8 text-charcoal/80">
            <p>
              LokArt is a digital marketplace for local artisans, particularly women artisans in
              Parsa and the Terai. It helps creators show their work, manage products, receive
              orders and reach customers beyond the immediate local market.
            </p>
            <p>
              This is not a catalogue of anonymous goods. The person, the place and the craft stay
              beside the creation.
            </p>
          </div>
        </section>

        <section id="crafts" className="border-y border-charcoal/10 bg-sand">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <div className="max-w-2xl">
              <p className="text-sm tracking-[0.18em] text-vermilion uppercase">Explore crafts</p>
              <h2 className="mt-3 font-serif text-4xl">Creations will be listed by craft.</h2>
              <p className="mt-4 leading-7 text-charcoal/80">
                These are the first categories. A product appears in the marketplace only after
                artisan approval and admin verification. Unverified work stays hidden, so this page
                does not invent pieces, prices or reviews.
              </p>
            </div>
            <ol className="mt-12 grid gap-x-12 sm:grid-cols-2">
              {crafts.map((craft, index) => (
                <li key={craft} className="flex items-baseline justify-between border-b border-charcoal/15 py-4">
                  <span className="font-serif text-2xl">{craft}</span>
                  <span className="text-sm text-teal">{String(index + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="path" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <p className="text-sm tracking-[0.18em] text-teal uppercase">How LokArt works</p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl">Four steps from workshop to customer.</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p className="font-serif text-3xl text-terai">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-7 text-charcoal/75">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="mission" className="bg-teal text-ivory">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <p className="text-sm tracking-[0.18em] text-terai uppercase">Our mission</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Keep traditional craft visible, and make the business around it understandable.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ivory/85">
              LokArt exists so makers in Parsa and the Terai can present their work with dignity,
              decide what is published in their name, and receive orders without handing that
              control to someone else.
            </p>
          </div>
        </section>

        <section id="creators" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-sm tracking-[0.18em] text-vermilion uppercase">For customers</p>
            <h2 className="mt-3 font-serif text-4xl">Browse when the first verified creations are ready.</h2>
            <p className="mt-4 leading-7 text-charcoal/80">
              Ordering will not require an account. Cash on delivery is the payment method for this
              version. The marketplace opens when real, approved products are in the database.
            </p>
          </div>
          <div className="border-t-4 border-terai pt-6">
            <p className="text-sm tracking-[0.18em] text-teal uppercase">For creators</p>
            <h2 className="mt-3 font-serif text-4xl">Your craft. Your approval. Your orders.</h2>
            <p className="mt-4 leading-7 text-charcoal/80">
              Artisans will manage listings from LokArt Studio. Helpers can prepare a listing only
              with explicit consent, and they cannot approve or publish it. Studio sign-in is the
              next part of the build. It is not available on this page yet.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
