import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function CustomerDashboard() {
  const { user, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || {});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile({
        name,
        phone,
        address,
      });
      setMessage("Profile and address updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between bg-ivory">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-teal px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
                Customer Account
              </span>
              <span className="text-xs text-charcoal/60">
                Joined {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              Namaste, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Manage your personal details, delivery address, and view artisan orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#products"
              className="bg-vermilion px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
            >
              Browse Products
            </a>
            <button
              type="button"
              onClick={logout}
              className="border border-charcoal/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded border border-teal/30 bg-teal/10 p-4 text-sm text-teal">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-6 rounded border border-vermilion/30 bg-vermilion/10 p-4 text-sm text-vermilion">
            {error}
          </div>
        ) : null}

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Column: Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <h3 className="font-serif text-xl text-charcoal">Account Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-charcoal/60 block uppercase tracking-wider">
                    Full Name
                  </span>
                  <p className="font-medium text-charcoal">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 block uppercase tracking-wider">
                    Email Address
                  </span>
                  <p className="font-medium text-charcoal">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 block uppercase tracking-wider">
                    Phone Number
                  </span>
                  <p className="font-medium text-charcoal">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 block uppercase tracking-wider">
                    Account Status
                  </span>
                  <span className="inline-block mt-1 rounded bg-teal/20 px-2 py-0.5 text-xs text-teal font-medium">
                    Active Member
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full border border-teal bg-teal/10 py-2 text-xs font-semibold uppercase tracking-wider text-teal hover:bg-teal hover:text-ivory transition-colors"
                >
                  Edit Profile & Address
                </button>
              ) : null}
            </div>

            {/* Order info banner */}
            <div className="rounded border border-terai/40 bg-sand p-6 text-charcoal shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-terai">
                Cash On Delivery
              </p>
              <h4 className="mt-1 font-serif text-lg">Direct Artisan Support</h4>
              <p className="mt-2 text-xs text-charcoal/80 leading-relaxed">
                When you place orders on LokArt, payments go directly to local creators in Parsa and the
                Terai upon delivery.
              </p>
            </div>
          </div>

          {/* Right Column: Address or Edit Form */}
          <div className="md:col-span-2">
            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                  <h3 className="font-serif text-2xl text-charcoal">Edit Profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-charcoal/60 hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    />
                  </div>
                </div>

                <AddressForm
                  title="Delivery Address in Nepal"
                  subtitle="Update the physical location for receiving orders"
                  value={address}
                  onChange={setAddress}
                  disabled={saving}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-teal px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Registered Address View */}
                <div className="rounded border border-charcoal/15 bg-sand/30 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                    <h3 className="font-serif text-xl text-charcoal">Delivery Address</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-teal font-semibold hover:underline uppercase tracking-wider"
                    >
                      Update
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        Street / Tole
                      </span>
                      <p className="font-medium text-charcoal">{user?.address?.street || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        Ward Number
                      </span>
                      <p className="font-medium text-charcoal">Ward {user?.address?.ward || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        Municipality / Rural Mun.
                      </span>
                      <p className="font-medium text-charcoal">
                        {user?.address?.municipality || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        District & Province
                      </span>
                      <p className="font-medium text-charcoal">
                        {user?.address?.district}, {user?.address?.province}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        Landmark
                      </span>
                      <p className="text-charcoal/80">
                        {user?.address?.landmark || "None specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                        Country
                      </span>
                      <p className="font-medium text-charcoal">{user?.address?.country || "Nepal"}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Placeholder */}
                <div className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs">
                  <h3 className="font-serif text-xl text-charcoal">Order History</h3>
                  <div className="mt-6 py-10 text-center border border-dashed border-charcoal/20">
                    <p className="text-sm text-charcoal/70">
                      You have not placed any orders yet.
                    </p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      Explore authentic Mithila paintings, bamboo crafts, and jewelry created by local makers.
                    </p>
                    <a
                      href="#products"
                      className="mt-5 inline-block bg-vermilion px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal"
                    >
                      Browse Marketplace
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
