const NEPAL_PROVINCES = [
  "Madhesh Province",
  "Bagmati Province",
  "Koshi Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const SUGGESTED_DISTRICTS = {
  "Madhesh Province": ["Parsa", "Bara", "Rautahat", "Sarlahi", "Dhanusha", "Mahottari", "Siraha", "Saptari"],
  "Bagmati Province": ["Kathmandu", "Lalitpur", "Bhaktapur", "Chitwan", "Kavrepalanchok", "Makwanpur"],
  "Lumbini Province": ["Rupandehi", "Kapilvastu", "Palpa", "Nawalparasi", "Dang", "Banke"],
  "Gandaki Province": ["Kaski", "Tanahun", "Gorkha", "Syangja", "Lamjung"],
  "Koshi Province": ["Morang", "Sunsari", "Jhapa", "Ilam", "Udayapur"],
  "Karnali Province": ["Surkhet", "Dailekh", "Jumla", "Salyan"],
  "Sudurpashchim Province": ["Kailali", "Kanchanpur", "Doti", "Dadeldhura"],
};

export default function AddressForm({
  value = {},
  onChange,
  title = "Address Details",
  subtitle = "Complete address for deliveries and communications",
  disabled = false,
  errors = {},
}) {
  const address = {
    country: "Nepal",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    landmark: "",
    ...value,
  };

  const handleFieldChange = (field, fieldValue) => {
    onChange({
      ...address,
      [field]: fieldValue,
    });
  };

  const currentDistricts = SUGGESTED_DISTRICTS[address.province] || [];

  return (
    <div className="space-y-4 rounded border border-charcoal/15 bg-sand/30 p-4">
      {title ? (
        <div>
          <h4 className="font-serif text-lg text-charcoal">{title}</h4>
          {subtitle ? <p className="text-xs text-charcoal/70">{subtitle}</p> : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Country */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Country *
          </label>
          <input
            type="text"
            value={address.country}
            disabled
            className="mt-1 w-full border border-charcoal/20 bg-charcoal/5 px-3 py-2 text-sm text-charcoal cursor-not-allowed"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Province *
          </label>
          <select
            value={address.province}
            disabled={disabled}
            onChange={(e) => {
              const newProvince = e.target.value;
              onChange({
                ...address,
                province: newProvince,
                district: "", // reset district on province change
              });
            }}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          >
            <option value="">Select Province</option>
            {NEPAL_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.province ? (
            <p className="mt-1 text-xs text-vermilion">{errors.province}</p>
          ) : null}
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            District *
          </label>
          {currentDistricts.length > 0 ? (
            <select
              value={address.district}
              disabled={disabled}
              onChange={(e) => handleFieldChange("district", e.target.value)}
              className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
            >
              <option value="">Select District</option>
              {currentDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="Other">Other / Custom</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. Parsa"
              value={address.district}
              disabled={disabled}
              onChange={(e) => handleFieldChange("district", e.target.value)}
              className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
            />
          )}
          {errors.district ? (
            <p className="mt-1 text-xs text-vermilion">{errors.district}</p>
          ) : null}
        </div>

        {/* Municipality / Rural Municipality */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Municipality / Rural Mun. *
          </label>
          <input
            type="text"
            placeholder="e.g. Birgunj Metropolitan City"
            value={address.municipality}
            disabled={disabled}
            onChange={(e) => handleFieldChange("municipality", e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {errors.municipality ? (
            <p className="mt-1 text-xs text-vermilion">{errors.municipality}</p>
          ) : null}
        </div>

        {/* Ward Number */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Ward Number *
          </label>
          <input
            type="text"
            placeholder="e.g. 5 or 12"
            value={address.ward}
            disabled={disabled}
            onChange={(e) => handleFieldChange("ward", e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {errors.ward ? (
            <p className="mt-1 text-xs text-vermilion">{errors.ward}</p>
          ) : null}
        </div>

        {/* Street / Tole */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Street / Tole *
          </label>
          <input
            type="text"
            placeholder="e.g. Adarshnagar Tole"
            value={address.street}
            disabled={disabled}
            onChange={(e) => handleFieldChange("street", e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          {errors.street ? (
            <p className="mt-1 text-xs text-vermilion">{errors.street}</p>
          ) : null}
        </div>
      </div>

      {/* Landmark (Optional) */}
      <div>
        <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
          Landmark (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Near Ghanta Ghar or opposite Temple"
          value={address.landmark}
          disabled={disabled}
          onChange={(e) => handleFieldChange("landmark", e.target.value)}
          className="mt-1 w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
        />
      </div>
    </div>
  );
}
