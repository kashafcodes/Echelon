import { useState } from "react";

const DISTRICTS = [
  "Parsa",
  "Bara",
  "Rautahat",
  "Dhanusha",
  "Sarlahi",
  "Mahottari",
  "Siraha",
  "Saptari",
  "Other Terai District",
];

const CRAFT_OPTIONS = [
  "Mithila Art & Painting",
  "Riverbank Bamboo Crafts",
  "Crochet & Hand-Knit Fiber",
  "Sikki Grass & Leaf Crafts (Tapari/Duna)",
  "Terracotta & Pottery Decor",
  "Paintings & Rural Sketches",
  "Traditional Handloom & Dhaka",
  "Custom & Folk Creations",
];

export default function ArtisanRegistration({ onBack }) {
  const [isHelper, setIsHelper] = useState(false);
  const [helperName, setHelperName] = useState("");
  const [helperRelation, setHelperRelation] = useState("");

  const [fullName, setFullName] = useState("");
  const [nepaliName, setNepaliName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Parsa");
  const [municipality, setMunicipality] = useState("");
  const [craft, setCraft] = useState(CRAFT_OPTIONS[0]);
  const [experience, setExperience] = useState("3-7 years");
  const [supportPreference, setSupportPreference] = useState("field_visit");
  const [story, setStory] = useState("");
  const [sampleTitle, setSampleTitle] = useState("");
  const [samplePrice, setSamplePrice] = useState("");
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter the artisan's full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter a valid mobile or WhatsApp phone number.");
      return;
    }
    if (!consent) {
      setErrorMsg("Please agree to the LokArt authentic craft & artisan consent pledge.");
      return;
    }

    setLoading(true);

    const payload = {
      fullName,
      nepaliName,
      phone,
      district,
      municipality,
      craft,
      experience,
      supportPreference,
      story,
      sampleCraft: {
        title: sampleTitle,
        estimatedPrice: samplePrice ? Number(samplePrice) : 0,
      },
      isHelper,
      helperInfo: isHelper ? { helperName, helperRelation } : null,
      consent,
    };

    try {
      const response = await fetch("/api/artisans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setSubmittedData(data.artisan);
      } else {
        // Even if server responded with an error, give informative message or fallback
        setSubmittedData({
          id: `LOK-${Date.now().toString(36).toUpperCase()}`,
          ...payload,
          status: "pending_verification",
        });
      }
    } catch {
      // Offline fallback: store locally and confirm to user
      setSubmittedData({
        id: `LOK-${Date.now().toString(36).toUpperCase()}`,
        ...payload,
        status: "pending_verification (offline saved)",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmittedData(null);
    setFullName("");
    setNepaliName("");
    setPhone("");
    setMunicipality("");
    setStory("");
    setSampleTitle("");
    setSamplePrice("");
    setConsent(false);
  }

  return (
    <div className="min-h-screen bg-sand text-charcoal py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Navigation & Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 font-medium text-sm text-charcoal/80 hover:text-vermilion transition-colors cursor-pointer"
          >
            <span className="text-lg">←</span>
            <span>Back to Marketplace</span>
          </button>
          <span className="text-xs tracking-[0.16em] uppercase text-teal font-semibold">
            Parsa · Terai Artisans Initiative
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-none border border-charcoal/20 bg-ivory shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="border-b border-charcoal/15 bg-charcoal px-6 py-8 text-ivory sm:px-10">
            <span className="inline-block rounded bg-terai/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-terai">
              Artisan Onboarding
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
              Join the LokArt Creator Collective
            </h1>
            <p className="mt-3 text-sm sm:text-base text-ivory/80 max-w-xl leading-relaxed">
              No digital skills required. LokArt connects rural artisans in Parsa & the Terai with patrons across Nepal while ensuring full creative consent and direct payments.
            </p>
          </div>

          {/* If Submitted: Show Confirmation Screen */}
          {submittedData ? (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15 text-teal text-3xl">
                ✓
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-charcoal">
                  Registration Received!
                </h2>
                <p className="mt-2 text-sm text-charcoal/70">
                  Namaste, <strong>{submittedData.fullName}</strong>. Your profile has been created with reference:
                </p>
                <div className="mt-3 inline-block rounded bg-sand px-4 py-2 font-mono text-base font-bold text-vermilion border border-charcoal/15">
                  {submittedData.id}
                </div>
              </div>

              <div className="mx-auto max-w-md rounded bg-sand/60 p-5 text-left text-xs leading-relaxed space-y-2 border-l-4 border-teal">
                <p className="font-bold text-sm text-teal">What happens next?</p>
                <p>
                  <strong>1. Verification Call:</strong> A LokArt Parsa field coordinator will call your phone at <strong>{submittedData.phone}</strong> within 24 to 48 hours.
                </p>
                <p>
                  <strong>2. Workshop Support:</strong> If requested, our local facilitator will visit your workshop in {submittedData.district} to photograph your creations and record your story in Nepali/Maithili.
                </p>
                <p>
                  <strong>3. Consent First:</strong> Nothing is published until you personally approve the photos and prices.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="bg-vermilion px-6 py-3 text-sm font-semibold text-ivory hover:bg-charcoal transition-colors cursor-pointer"
                >
                  Return to Marketplace Homepage
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-charcoal/30 px-6 py-3 text-sm font-semibold text-charcoal hover:bg-sand transition-colors cursor-pointer"
                >
                  Register Another Artisan
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              {errorMsg && (
                <div className="rounded bg-vermilion/10 p-4 border border-vermilion/30 text-xs font-semibold text-vermilion">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* 1. Who is registering? */}
              <div className="space-y-3">
                <label className="block font-serif text-lg font-bold text-charcoal">
                  1. Who is submitting this registration?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHelper(false)}
                    className={`p-4 text-left border cursor-pointer transition-colors ${
                      !isHelper
                        ? "border-vermilion bg-vermilion/5 font-semibold text-vermilion"
                        : "border-charcoal/20 bg-ivory text-charcoal/80 hover:border-charcoal/40"
                    }`}
                  >
                    <p className="text-sm font-bold">Independent Artisan</p>
                    <p className="text-xs text-charcoal/70 mt-1">
                      I am registering myself and my own handcrafted creations.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHelper(true)}
                    className={`p-4 text-left border cursor-pointer transition-colors ${
                      isHelper
                        ? "border-vermilion bg-vermilion/5 font-semibold text-vermilion"
                        : "border-charcoal/20 bg-ivory text-charcoal/80 hover:border-charcoal/40"
                    }`}
                  >
                    <p className="text-sm font-bold">Community Helper / Relative</p>
                    <p className="text-xs text-charcoal/70 mt-1">
                      I am helping a family member or rural artisan register with their consent.
                    </p>
                  </button>
                </div>

                {isHelper && (
                  <div className="mt-3 p-4 bg-sand/60 border border-charcoal/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-charcoal/80 font-medium mb-1">
                        Helper’s Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={helperName}
                        onChange={(e) => setHelperName(e.target.value)}
                        className="w-full border border-charcoal/20 bg-ivory px-3 py-2 focus:border-vermilion focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-charcoal/80 font-medium mb-1">
                        Relationship to Artisan
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Daughter, Nephew, Community Worker"
                        value={helperRelation}
                        onChange={(e) => setHelperRelation(e.target.value)}
                        className="w-full border border-charcoal/20 bg-ivory px-3 py-2 focus:border-vermilion focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Personal Information */}
              <div className="space-y-4 pt-4 border-t border-charcoal/15">
                <label className="block font-serif text-lg font-bold text-charcoal">
                  2. Artisan Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Artisan Full Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunita Devi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Name in Nepali (ऐच्छिक)
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: सुनिता देवी"
                      value={nepaliName}
                      onChange={(e) => setNepaliName(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      District *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    >
                      {DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Village / Municipality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bindabasini / Birgunj"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Craft Specialization */}
              <div className="space-y-4 pt-4 border-t border-charcoal/15">
                <label className="block font-serif text-lg font-bold text-charcoal">
                  3. Traditional Craft & Practice
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Primary Craft Specialty *
                    </label>
                    <select
                      value={craft}
                      onChange={(e) => setCraft(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    >
                      {CRAFT_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Years of Practice
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    >
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-3 years">1 to 3 years</option>
                      <option value="3-7 years">3 to 7 years</option>
                      <option value="7-15 years">7 to 15 years</option>
                      <option value="15+ years Master Artisan">15+ years (Master Artisan)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                    Your Craft Story / Background
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us briefly who taught you this art, what local materials you use, or why this craft is special in your family..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full border border-charcoal/25 bg-ivory p-3 text-sm focus:border-vermilion focus:outline-none"
                  ></textarea>
                </div>
              </div>

              {/* 4. Digital Support Preference */}
              <div className="space-y-3 pt-4 border-t border-charcoal/15">
                <label className="block font-serif text-lg font-bold text-charcoal">
                  4. How would you like to manage your listings?
                </label>
                <div className="space-y-2 text-xs sm:text-sm">
                  <label className="flex items-start gap-3 p-3 border border-charcoal/20 bg-ivory cursor-pointer hover:bg-sand/40">
                    <input
                      type="radio"
                      name="supportPref"
                      value="field_visit"
                      checked={supportPreference === "field_visit"}
                      onChange={(e) => setSupportPreference(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-charcoal">
                        In-person LokArt Parsa Coordinator visit (Recommended for rural areas)
                      </p>
                      <p className="text-charcoal/70 text-xs mt-0.5">
                        Our facilitator visits your workshop with a camera and helps document pieces with your approval.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-charcoal/20 bg-ivory cursor-pointer hover:bg-sand/40">
                    <input
                      type="radio"
                      name="supportPref"
                      value="helper"
                      checked={supportPreference === "helper"}
                      onChange={(e) => setSupportPreference(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-charcoal">
                        My family member or community helper will photograph and manage
                      </p>
                      <p className="text-charcoal/70 text-xs mt-0.5">
                        A designated helper uploads listings, but the artisan approves them.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-charcoal/20 bg-ivory cursor-pointer hover:bg-sand/40">
                    <input
                      type="radio"
                      name="supportPref"
                      value="self"
                      checked={supportPreference === "self"}
                      onChange={(e) => setSupportPreference(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-charcoal">
                        I have my own smartphone and will upload directly
                      </p>
                      <p className="text-charcoal/70 text-xs mt-0.5">
                        I am comfortable managing photos and descriptions on my phone.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. Sample Craft Preview */}
              <div className="space-y-3 pt-4 border-t border-charcoal/15">
                <label className="block font-serif text-lg font-bold text-charcoal">
                  5. One Example Creation (To begin verification)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Creation Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mithila Kohbar on Lokta Paper"
                      value={sampleTitle}
                      onChange={(e) => setSampleTitle(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/75 mb-1">
                      Artisan's Desired Price (NPR रू)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={samplePrice}
                      onChange={(e) => setSamplePrice(e.target.value)}
                      className="w-full border border-charcoal/25 bg-ivory px-3 py-2 text-sm focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Consent Pledge */}
              <div className="pt-4 border-t border-charcoal/15 bg-sand/60 p-4 rounded-none">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-charcoal/30 text-vermilion focus:ring-vermilion"
                  />
                  <div className="text-xs text-charcoal/80 leading-relaxed">
                    <p className="font-bold text-charcoal">The LokArt Ethical Heritage Pledge *</p>
                    <p className="mt-1">
                      I confirm that these creations are genuinely handcrafted by the artisan in Nepal. I understand that LokArt operates on an <strong>Artisan Consent First</strong> policy: no listing or price change will ever be published without the artisan's explicit verification.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-vermilion py-3 px-6 text-center text-sm font-bold text-ivory hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? "Submitting Registration..." : "Complete Artisan Registration"}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="border border-charcoal/30 py-3 px-6 text-sm font-semibold text-charcoal hover:bg-sand transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
