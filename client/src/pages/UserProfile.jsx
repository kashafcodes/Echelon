import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../services/api.js";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function UserProfile() {
  const { user, updateProfile, logout, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || {});

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || {});
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    if (!name.trim()) {
      setProfileErr("Full name is required.");
      return;
    }
    if (!phone.trim()) {
      setProfileErr("Phone number is required.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address,
      });
      setProfileMsg("Your personal profile and address were saved successfully!");
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar handlers
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      try {
        setAvatarUploading(true);
        setAvatarError('');
        await authApi.uploadAvatar({ avatar: dataUrl });
        setAvatarPreview(dataUrl);
        await refreshUser();
      } catch (err) {
        setAvatarError(err.message || 'Failed to upload avatar.');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      setAvatarUploading(true);
      await authApi.removeAvatar();
      setAvatarPreview(null);
      await refreshUser();
    } catch (err) {
      setAvatarError(err.message || 'Failed to remove avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };



  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (!currentPassword) {
      setPasswordErr("Please enter your current password.");
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
      setPasswordMsg(res.message || "Password changed successfully!");
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

      <main className="mx-auto w-full max-w-5xl px-5 py-12 md:px-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-teal px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
                Customer Profile
              </span>
              <span className="text-xs text-charcoal/60">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              User Profile & Settings
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Manage your personal information, delivery addresses, and login credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#products"
              className="bg-vermilion px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
            >
              Browse Products
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
          {/* Left Column: Account Overview Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-teal flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-ivory font-serif text-2xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer bg-teal text-ivory text-xs font-semibold py-1 px-2 rounded">
                    {avatarUploading ? "Uploading..." : "Upload Avatar"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} disabled={avatarUploading} />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="bg-red-500 text-white text-xs font-semibold py-1 px-2 rounded"
                      disabled={avatarUploading}
                    >
                      Remove
                    </button>
                  )}
                  {avatarError && <p className="text-xs text-vermilion">{avatarError}</p>}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-charcoal">{user?.name}</h3>
                  <p className="text-xs text-teal font-medium uppercase tracking-wider">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-charcoal/10 pt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Registered Email
                  </span>
                  <p className="font-medium text-charcoal">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <p className="font-medium text-charcoal">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Primary Region
                  </span>
                  <p className="font-medium text-charcoal">
                    {user?.address?.district}, {user?.address?.province}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded border border-terai/40 bg-sand p-6 text-charcoal shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-terai">
                LokArt Direct Artisan Delivery
              </p>
              <p className="mt-2 text-xs text-charcoal/80 leading-relaxed">
                Your delivery address is shared only with verified artisan makers when you place an order,
                ensuring authentic direct delivery with cash on delivery.
              </p>
            </div>
          </div>

          {/* Right Column: Profile Form & Password Change */}
          <div className="md:col-span-2 space-y-8">
            {/* Personal Details & Address Form */}
            <form
              onSubmit={handleUpdateProfile}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Personal Information</h3>
                <p className="text-xs text-charcoal/70">
                  Update your contact details and default delivery destination in Nepal.
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
                    Full Name *
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
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-1 w-full border border-charcoal/20 bg-charcoal/5 px-3.5 py-2 text-sm text-charcoal/70 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-charcoal/50">
                    Email address cannot be modified as it uniquely identifies your account.
                  </p>
                </div>
              </div>

              {/* Delivery Address Details */}
              <AddressForm
                title="Delivery Address Details"
                subtitle="Your home or delivery address in Nepal"
                value={address}
                onChange={setAddress}
                disabled={savingProfile}
              />

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-teal px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? "Saving Profile..." : "Save Profile Details"}
              </button>
            </form>

            {/* Change Password Form */}
            <form
              onSubmit={handleChangePassword}
              className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
            >
              <div className="border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-2xl text-charcoal">Security & Password</h3>
                <p className="text-xs text-charcoal/70">
                  Update your password to keep your LokArt account secure.
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
