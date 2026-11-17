import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../services/api.js";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const CATEGORIES = [
  "Mithila Art",
  "Bamboo Crafts",
  "Pottery & Clay Work",
  "Handmade Jewelry",
  "Leaf Crafts",
  "Handmade Decor",
  "Paintings and Sketches",
  "Traditional Crafts",
  "Crochet & Weaving",
  "Custom Creations",
];

export default function VendorProfile() {
  const { user, vendor, updateProfile, logout } = useAuth();

  // Personal Fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [personalAddress, setPersonalAddress] = useState(user?.address || {});

  // Vendor Business Fields
  const [businessName, setBusinessName] = useState(vendor?.businessName || "");
  const [description, setDescription] = useState(vendor?.description || "");
  const [category, setCategory] = useState(vendor?.category || CATEGORIES[0]);
  const [businessAddress, setBusinessAddress] = useState(
    vendor?.businessAddress || user?.address || {},
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Statuses
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const status = vendor?.verificationStatus || "pending";
  const isApproved = status === "approved";
  const isPending = status === "pending";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    if (!businessName.trim()) {
      setProfileErr("Business / Shop Name is required.");
      return;
    }
    if (!description.trim()) {
      setProfileErr("Business Description is required.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: personalAddress,
        businessName: businessName.trim(),
        description: description.trim(),
        category,
        businessAddress,
      });
      setProfileMsg("Artisan studio profile and addresses updated successfully!");
    } catch (err) {
      setProfileErr(err.message || "Failed to update vendor profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (!currentPassword) {
      setPasswordErr("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordErr("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordErr("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordMsg(res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordErr(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between bg-ivory">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-vermilion px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
                Artisan Vendor Profile
              </span>
              {isApproved ? (
                <span className="rounded bg-teal/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                  Verified Partner
                </span>
              ) : isPending ? (
                <span className="rounded bg-terai/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-terai">
                  Verification Pending
                </span>
              ) : (
                <span className="rounded bg-vermilion/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-vermilion">
                  Rejected
                </span>
              )}
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {vendor?.businessName || "Artisan Profile"}
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Manage your craft shop identity, workshop location, and creator credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#vendor"
              className="bg-vermilion px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
            >
              Artisan Studio
            </a>
            <button
              type="button"
              onClick={logout}
              className="border border-charcoal/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        <div className="mt-6">
          {isPending ? (
            <div className="rounded border-2 border-terai bg-sand/80 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-terai">⚠️</span>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-charcoal">
                    Verification Status: Pending Review
                  </h4>
                  <p className="mt-1 text-xs text-charcoal/80 leading-relaxed">
                    Your vendor application is currently under review by LokArt administrators. To maintain
                    authentic Terai craftsmanship, <strong>product publishing is locked until an administrator approves your studio</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : isApproved ? (
            <div className="rounded border border-teal/40 bg-teal/10 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-teal">✓</span>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-teal">
                    Verified LokArt Artisan
                  </h4>
                  <p className="mt-1 text-xs text-charcoal/80 leading-relaxed">
                    Your workshop is verified. You can publish authentic creations and receive direct orders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-vermilion/40 bg-vermilion/10 p-5 text-charcoal shadow-xs">
              <h4 className="font-serif text-lg font-semibold text-vermilion">
                Application Not Approved
              </h4>
              <p className="mt-1 text-xs text-charcoal/80 leading-relaxed">
                Please update your business information or reach out to support@lokart.com.
              </p>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Column: Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={vendor?.businessName || user?.name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-vermilion"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-vermilion text-ivory font-serif text-2xl flex items-center justify-center font-bold">
                    {vendor?.businessName ? vendor.businessName.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-xl text-charcoal">{vendor?.businessName}</h3>
                  <p className="text-xs text-teal font-medium uppercase tracking-wider">
                    {vendor?.category}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-charcoal/10 pt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Lead Artisan
                  </span>
                  <p className="font-medium text-charcoal">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <p className="font-medium text-charcoal">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Contact Email
                  </span>
                  <p className="font-medium text-charcoal">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Workshop Region
                  </span>
                  <p className="font-medium text-charcoal">
                    {vendor?.businessAddress?.district}, {vendor?.businessAddress?.province}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs">
              <h4 className="font-serif text-lg text-charcoal">Artisan Mission</h4>
              <p className="mt-2 text-xs text-charcoal/80 leading-relaxed">
                LokArt empowers makers in Parsa and the Terai to present their traditional craft with dignity,
                control their own pricing, and connect directly with appreciative buyers.
              </p>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="md:col-span-2 space-y-8">
            {/* Vendor Profile Form */}
            <form
              onSubmit={handleUpdateProfile}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-6"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Shop & Craft Profile</h3>
                <p className="text-xs text-charcoal/70">
                  Update your public business identity and workshop location.
                </p>
              </div>

              {profileMsg ? (
                <div className="rounded border border-teal/40 bg-teal/10 p-3 text-sm text-teal">
                  {profileMsg}
                </div>
              ) : null}
              {profileErr ? (
                <div className="rounded border border-vermilion/40 bg-vermilion/10 p-3 text-sm text-vermilion">
                  {profileErr}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Shop / Studio Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Primary Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Craft Description & Heritage Bio *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
                  placeholder="Describe your craft background, traditions, techniques, and materials..."
                  required
                />
              </div>

              <div className="border-t border-charcoal/10 pt-4">
                <h4 className="font-serif text-lg text-charcoal mb-3">Artisan Contact</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Workshop Address Form */}
              <AddressForm
                title="Workshop / Business Address"
                subtitle="The physical location where crafts are produced"
                value={businessAddress}
                onChange={setBusinessAddress}
                disabled={savingProfile}
              />

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? "Saving Studio Details..." : "Save Artisan Profile"}
              </button>
            </form>

            {/* Change Password */}
            <form
              onSubmit={handleChangePassword}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Security & Credentials</h3>
                <p className="text-xs text-charcoal/70">
                  Update your login password for LokArt Artisan Studio.
                </p>
              </div>

              {passwordMsg ? (
                <div className="rounded border border-teal/40 bg-teal/10 p-3 text-sm text-teal">
                  {passwordMsg}
                </div>
              ) : null}
              {passwordErr ? (
                <div className="rounded border border-vermilion/40 bg-vermilion/10 p-3 text-sm text-vermilion">
                  {passwordErr}
                </div>
              ) : null}

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Current Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                      New Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-xs text-teal hover:underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    placeholder="Repeat new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-charcoal px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-vermilion transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
