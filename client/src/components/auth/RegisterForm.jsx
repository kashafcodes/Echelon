import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import AddressForm from "./AddressForm.jsx";
import RoleSelector from "./RoleSelector.jsx";

const PRODUCT_CATEGORIES = [
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

export default function RegisterForm({ initialRole = "customer", onSuccess, onSwitchToLogin }) {
  const { register } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Residential Address
  const [address, setAddress] = useState({
    country: "Nepal",
    province: "Madhesh Province",
    district: "Parsa",
    municipality: "",
    ward: "",
    street: "",
    landmark: "",
  });

  // Vendor Specific Fields
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [sameAddress, setSameAddress] = useState(true);
  const [businessAddress, setBusinessAddress] = useState({
    country: "Nepal",
    province: "Madhesh Province",
    district: "Parsa",
    municipality: "",
    ward: "",
    street: "",
    landmark: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Full Name is required";
    if (!email.trim()) {
      errs.email = "Email Address is required";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!phone.trim()) errs.phone = "Phone Number is required";
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    // Address validation
    if (!address.province) errs.province = "Province is required";
    if (!address.district) errs.district = "District is required";
    if (!address.municipality.trim()) errs.municipality = "Municipality is required";
    if (!address.ward.trim()) errs.ward = "Ward is required";
    if (!address.street.trim()) errs.street = "Street / Tole is required";

    // Vendor validation
    if (role === "vendor") {
      if (!businessName.trim()) errs.businessName = "Business name is required";
      if (!description.trim()) errs.description = "Business description is required";
      if (!category) errs.category = "Category is required";

      if (!sameAddress) {
        if (!businessAddress.province) errs.bProvince = "Business province is required";
        if (!businessAddress.district) errs.bDistrict = "Business district is required";
        if (!businessAddress.municipality.trim())
          errs.bMunicipality = "Business municipality is required";
        if (!businessAddress.ward.trim()) errs.bWard = "Business ward is required";
        if (!businessAddress.street.trim()) errs.bStreet = "Business street is required";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    const payload = {
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      confirmPassword,
      address,
      ...(role === "vendor"
        ? {
            businessName: businessName.trim(),
            description: description.trim(),
            category,
            businessAddressSameAsResidential: sameAddress,
            businessAddress: sameAddress ? address : businessAddress,
          }
        : {}),
    };

    try {
      setLoading(true);
      const data = await register(payload);

      if (role === "vendor") {
        setSuccess(
          "Vendor registration successful! Your application status is currently 'Pending Review'. An administrator will verify your shop before listing creations.",
        );
      } else {
        setSuccess("Registration successful! Welcome to LokArt.");
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.user);
        }
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 text-sm text-vermilion">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded border border-teal/30 bg-teal/10 p-3 text-sm text-teal">
          {success}
        </div>
      ) : null}

      {/* Role Selection */}
      <RoleSelector role={role} onChange={setRole} disabled={loading} />

      {/* Common Information */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Sita Devi"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {formErrors.name ? (
            <p className="mt-1 text-xs text-vermilion">{formErrors.name}</p>
          ) : null}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g. sita@example.com"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {formErrors.email ? (
            <p className="mt-1 text-xs text-vermilion">{formErrors.email}</p>
          ) : null}
        </div>

        {/* Phone Number */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="e.g. 9845000000"
            value={phone}
            disabled={loading}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {formErrors.phone ? (
            <p className="mt-1 text-xs text-vermilion">{formErrors.phone}</p>
          ) : null}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
              Password *
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
            placeholder="At least 6 characters"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {formErrors.password ? (
            <p className="mt-1 text-xs text-vermilion">{formErrors.password}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Confirm Password *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            value={confirmPassword}
            disabled={loading}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {formErrors.confirmPassword ? (
            <p className="mt-1 text-xs text-vermilion">
              {formErrors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      {/* Residential Address Details */}
      <AddressForm
        title={role === "vendor" ? "Residential Address" : "Delivery Address"}
        subtitle="Where you live or receive personal orders in Nepal"
        value={address}
        onChange={setAddress}
        disabled={loading}
        errors={{
          province: formErrors.province,
          district: formErrors.district,
          municipality: formErrors.municipality,
          ward: formErrors.ward,
          street: formErrors.street,
        }}
      />

      {/* Additional Vendor Details */}
      {role === "vendor" ? (
        <div className="space-y-4 rounded border border-vermilion/20 bg-vermilion/5 p-4">
          <div>
            <h4 className="font-serif text-lg text-charcoal">
              Artisan & Business Profile
            </h4>
            <p className="text-xs text-charcoal/70">
              Information that will represent your craft shop on LokArt.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                Business / Shop Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sita Mithila Art Studio"
                value={businessName}
                disabled={loading}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
              />
              {formErrors.businessName ? (
                <p className="mt-1 text-xs text-vermilion">
                  {formErrors.businessName}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                Primary Product Category *
              </label>
              <select
                value={category}
                disabled={loading}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {formErrors.category ? (
                <p className="mt-1 text-xs text-vermilion">
                  {formErrors.category}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
              Business / Craft Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe your craft heritage, materials used, experience and what makes your creations unique..."
              value={description}
              disabled={loading}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-vermilion focus:outline-none"
            />
            {formErrors.description ? (
              <p className="mt-1 text-xs text-vermilion">
                {formErrors.description}
              </p>
            ) : null}
          </div>

          {/* Business address toggle */}
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <input
                id="same-address"
                type="checkbox"
                checked={sameAddress}
                disabled={loading}
                onChange={(e) => setSameAddress(e.target.checked)}
                className="h-4 w-4 border-charcoal/30 text-vermilion accent-vermilion focus:ring-vermilion"
              />
              <label
                htmlFor="same-address"
                className="text-xs font-medium text-charcoal"
              >
                Workshop / Business address is the same as residential address
              </label>
            </div>

            {!sameAddress ? (
              <div className="mt-3">
                <AddressForm
                  title="Workshop / Business Address"
                  subtitle="Physical workshop location where crafts are made"
                  value={businessAddress}
                  onChange={setBusinessAddress}
                  disabled={loading}
                  errors={{
                    province: formErrors.bProvince,
                    district: formErrors.bDistrict,
                    municipality: formErrors.bMunicipality,
                    ward: formErrors.bWard,
                    street: formErrors.bStreet,
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded border border-terai/40 bg-sand/80 p-3 text-xs text-charcoal leading-relaxed">
            <strong className="text-terai uppercase tracking-wider block mb-1">
              Verification Notice
            </strong>
            All new artisan and vendor accounts start with a{" "}
            <strong>Pending Verification</strong> status. LokArt administrators
            verify your details to maintain authentic local Terai craftsmanship
            before you can publish products in the public marketplace.
          </div>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-vermilion py-3 text-center text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-ivory"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Creating Account...
          </span>
        ) : role === "vendor" ? (
          "Register as Artisan / Vendor"
        ) : (
          "Create Customer Account"
        )}
      </button>

      {/* Switch to Login */}
      <div className="border-t border-charcoal/10 pt-4 text-center">
        <p className="text-xs text-charcoal/80">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-teal hover:underline"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </form>
  );
}
