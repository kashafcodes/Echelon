export default function SiteFooter() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr] md:px-8">
        <div>
          <p className="font-serif text-3xl">LokArt</p>
          <p className="mt-3 max-w-md text-ivory/80">
            No Craft Forgotten. No Creator Unseen.
          </p>
          <p className="mt-6 text-sm tracking-[0.16em] text-terai uppercase">
            Where Heritage Meets Opportunity
          </p>
        </div>
        <div className="text-sm leading-7 text-ivory/75">
          <p>A marketplace for artisans in Parsa and the Terai region of Nepal.</p>
          <p className="mt-4">
            Public listings appear only after the artisan approves them and LokArt verifies them.
          </p>
        </div>
      </div>
    </footer>
  );
}
