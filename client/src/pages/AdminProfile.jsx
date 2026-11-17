import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi, apiFetch } from "../services/api.js";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function AdminProfile() {
  const { user, updateProfile, logout } = useAuth();

  // Profile Fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || {});

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  // Health state
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    apiFetch("/api/health")
      .then((data) => setApiHealth(data))
      .catch(() => setApiHealth({ ok: false }));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    try {
      setSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address,
      });
      setProfileMsg("Administrator profile updated successfully!");
    } catch (err) {
      setProfileErr(err.message || "Failed to update admin profile.");
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
      setPasswordMsg(res.message || "Admin credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordErr(err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
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
              <span className="rounded bg-charcoal px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ivory">
                Platform Administrator
              </span>
              <span className="text-xs text-charcoal/60">
                System Superuser
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              Administrator Profile & Credentials
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Manage platform administrative credentials and system security settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#admin"
              className="bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-vermilion transition-colors"
            >
              Admin Control Room
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

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Column: Admin Info & Health */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-charcoal"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-charcoal text-ivory font-serif text-2xl flex items-center justify-center font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-xl text-charcoal">{user?.name}</h3>
                  <span className="inline-block mt-1 rounded bg-charcoal/15 px-2 py-0.5 text-[11px] font-bold text-charcoal uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-charcoal/10 pt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Admin Email
                  </span>
                  <p className="font-medium text-charcoal">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Emergency Phone
                  </span>
                  <p className="font-medium text-charcoal">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Regional Base
                  </span>
                  <p className="font-medium text-charcoal">
                    {user?.address?.district}, {user?.address?.province}
                  </p>
                </div>
              </div>
            </div>

            {/* System Status Card */}
            <div className="rounded border border-teal/30 bg-teal/5 p-6 shadow-xs">
              <h4 className="font-serif text-lg text-teal">System Status</h4>
              <div className="mt-3 space-y-2 text-xs text-charcoal">
                <div className="flex items-center justify-between">
                  <span>API Service:</span>
                  <span className="font-semibold text-teal">
                    {apiHealth?.ok ? "Online (Healthy)" : "Checking..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database State:</span>
                  <span className="font-semibold text-teal">
                    {apiHealth?.database === "connected" ? "Connected" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment:</span>
                  <span className="font-mono text-charcoal/70">Local / Development</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Form & Password Form */}
          <div className="md:col-span-2 space-y-8">
            {/* Admin Profile Form */}
            <form
              onSubmit={handleUpdateProfile}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Admin Identity & Headquarters</h3>
                <p className="text-xs text-charcoal/70">
                  Update your administrator display name and official headquarters address.
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
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Central Office Address Details */}
              <AddressForm
                title="LokArt Regional / Central Office"
                subtitle="Physical headquarters for artisan verifications"
                value={address}
                onChange={setAddress}
                disabled={savingProfile}
              />

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-charcoal px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-teal transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? "Saving..." : "Save Admin Profile"}
              </button>
            </form>

            {/* Change Admin Password */}
            <form
              onSubmit={handleChangePassword}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Update Admin Password</h3>
                <p className="text-xs text-charcoal/70">
                  Protect administrative access with a strong master password.
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
                  className="bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingPassword ? "Updating Password..." : "Update Admin Password"}
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
