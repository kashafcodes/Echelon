export default function SiteFooter({ onNavigate }) {
  function handleNav(view, target) {
    if (onNavigate) {
      onNavigate(view, target);
    }
  }

  return (
    <footer className="bg-charcoal text-ivory border-t-4 border-vermilion">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold tracking-tight text-ivory">LokArt</span>
              <span className="text-xs uppercase tracking-widest text-terai">Nepal</span>
            </div>
            <p className="font-serif text-lg leading-snug text-ivory/90">
              No Craft Forgotten.<br />No Creator Unseen.
            </p>
            <p className="text-sm text-ivory/70 leading-relaxed">
              Empowering rural artisans in Parsa and the Terai region of Nepal by bridging ancient craftsmanship with dignified online opportunities.
            </p>
            <p className="text-xs tracking-[0.16em] uppercase text-terai">
              Where Heritage Meets Opportunity
            </p>
          </div>

          {/* Traditional Crafts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-terai">
              Heritage Crafts
            </h4>
            <ul className="space-y-2 text-sm text-ivory/80">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Mithila Art & Kohbar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Riverbank Bamboo Crafts
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Handmade Cotton Crochet
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Wild Sikki Grass & Leaf Art
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Parsa Terracotta Pottery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "crafts")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Terai Folk Landscapes
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-terai">
              Platform & Trust
            </h4>
            <ul className="space-y-2 text-sm text-ivory/80">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "path")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  How LokArt Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "artisans")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Meet the Creators
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "mission")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Our Mission & Impact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("home", "faq")}
                  className="hover:text-terai transition-colors cursor-pointer text-left"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav("register")}
                  className="text-terai font-medium hover:underline cursor-pointer text-left"
                >
                  Become a Creator / Helper →
                </button>
              </li>
            </ul>
          </div>

          {/* Regional Desk & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-terai">
              Parsa Field Desk
            </h4>
            <div className="text-sm space-y-2 text-ivory/80">
              <p>📍 Bindabasini / Birgunj, Parsa District, Madhesh Province, Nepal</p>
              <p>📞 Phone / WhatsApp: +977-9800000000</p>
              <p>✉️ Email: namaste@lokart.org.np</p>
              <div className="pt-2">
                <span className="inline-block bg-teal/30 text-ivory px-2.5 py-1 rounded text-xs">
                  📦 Cash on Delivery Nepal-wide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-ivory/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60">
          <p>
            © {new Date().getFullYear()} LokArt Collective. All rights reserved. Made with reverence for Nepal’s living heritage.
          </p>
          <div className="flex gap-4">
            <span className="text-ivory/80">Consent-Driven</span>
            <span>·</span>
            <span className="text-ivory/80">Handcrafted Only</span>
            <span>·</span>
            <span className="text-ivory/80">Direct Artisan Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
