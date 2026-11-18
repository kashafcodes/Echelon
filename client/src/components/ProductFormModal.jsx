import { useState, useEffect } from "react";
import { vendorProductApi, productApi, aiApi } from "../services/api.js";

const DEFAULT_CATEGORIES = [
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

export default function ProductFormModal({ product, isOpen, onClose, onSuccess }) {
  const isEditing = Boolean(product?._id);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState("1");
  const [origin, setOrigin] = useState("Parsa, Terai, Nepal");
  const [materials, setMaterials] = useState("");
  const [craftingMethod, setCraftingMethod] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [weight, setWeight] = useState("");
  const [customizationAvailable, setCustomizationAvailable] = useState(false);
  const [tags, setTags] = useState("");

  // Images state (array of Data URLs or image URLs)
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");

  // AI Translation State
  const [originalName, setOriginalName] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("en");
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [translatedName, setTranslatedName] = useState("");
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [translationNotice, setTranslationNotice] = useState("");
  const [hasAppliedTranslation, setHasAppliedTranslation] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res?.categories && res.categories.length > 0) {
        setCategories(res.categories.map((c) => c.name));
      }
    });
  }, []);

  // Pre-fill on edit or reset on create
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setOriginalName(product.originalName || "");
      setOriginalDescription(product.originalDescription || "");
      setOriginalLanguage(product.originalLanguage || "en");
      setTranslations(product.translations || {});
      setHasAppliedTranslation(
        Boolean(
          product.originalDescription &&
            product.originalDescription.trim() !== "" &&
            product.originalDescription !== product.description
        )
      );
      setPrice(product.price ? String(product.price) : "");
      setCategory(product.category || DEFAULT_CATEGORIES[0]);
      setQuantity(product.quantity !== undefined ? String(product.quantity) : "1");
      setOrigin(product.origin || "Parsa, Terai, Nepal");
      setMaterials(Array.isArray(product.materials) ? product.materials.join(", ") : "");
      setCraftingMethod(product.craftingMethod || "");
      setDimensions(product.dimensions || "");
      setWeight(product.weight ? String(product.weight) : "");
      setCustomizationAvailable(Boolean(product.customizationAvailable));
      setTags(Array.isArray(product.tags) ? product.tags.join(", ") : "");
      setImages(product.images || (product.image ? [product.image] : []));
    } else {
      setName("");
      setDescription("");
      setOriginalName("");
      setOriginalDescription("");
      setOriginalLanguage("en");
      setTranslations({});
      setHasAppliedTranslation(false);
      setPrice("");
      setCategory(DEFAULT_CATEGORIES[0]);
      setQuantity("1");
      setOrigin("Parsa, Terai, Nepal");
      setMaterials("");
      setCraftingMethod("");
      setDimensions("");
      setWeight("");
      setCustomizationAvailable(false);
      setTags("");
      setImages([]);
    }
    setError("");
    setImageError("");
    setTranslationResult(null);
    setTranslationNotice("");
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle multiple image file selection
  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageError("");
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setImageError("Only valid image files (JPG, PNG, WebP) are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Images must be under 5MB each.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Translation Handlers
  const handleTranslate = async () => {
    if (!description.trim() && !name.trim()) {
      setTranslationNotice("Please enter a product title or description first to translate.");
      return;
    }
    setTranslationNotice("");
    setTranslating(true);
    try {
      const res = await aiApi.translateProduct({
        productName: name.trim(),
        description: description.trim(),
      });
      if (res?.success) {
        setTranslationResult(res);
        setTranslatedName(res.translatedProductName || name);
        setTranslatedDesc(res.translatedDescription || description);
      } else {
        setTranslationNotice(res?.message || "Translation could not be completed.");
      }
    } catch (err) {
      console.warn("AI Translation error:", err);
      setTranslationNotice(
        err.message || "Failed to translate with AI. Please check your network or try again."
      );
    } finally {
      setTranslating(false);
    }
  };

  const handleApplyTranslation = () => {
    // Save current values as original if not already set
    const origN = originalName || name;
    const origD = originalDescription || description;
    setOriginalName(origN);
    setOriginalDescription(origD);
    setOriginalLanguage(translationResult?.detectedLanguage || "ne");

    setName(translatedName);
    setDescription(translatedDesc);
    setTranslations({
      en: {
        name: translatedName,
        description: translatedDesc,
      },
    });
    setHasAppliedTranslation(true);
    setTranslationResult(null);
    setTranslationNotice("✓ English translation applied! Original Nepali/regional text has been safely preserved.");
  };

  const handleRevertToOriginal = () => {
    if (originalName) setName(originalName);
    if (originalDescription) setDescription(originalDescription);
    setHasAppliedTranslation(false);
    setTranslationNotice("Restored original artisan text.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Product description is required.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Price must be a valid number greater than 0.");
      return;
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 0) {
      setError("Available quantity cannot be negative.");
      return;
    }
    if (!images.length) {
      setError("At least one product image is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        category,
        quantity: numQty,
        origin: origin.trim(),
        images,
        materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
        craftingMethod: craftingMethod.trim(),
        dimensions: dimensions.trim(),
        weight: weight ? Number(weight) : null,
        customizationAvailable,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        originalName: originalName.trim(),
        originalDescription: originalDescription.trim(),
        originalLanguage: originalLanguage.trim() || "en",
        translations: translations || {},
      };

      let res;
      if (isEditing) {
        res = await vendorProductApi.updateProduct(product._id, payload);
      } else {
        res = await vendorProductApi.createProduct(payload);
      }

      if (res?.ok) {
        onSuccess(res.product || res.message);
        onClose();
      }
    } catch (err) {
      console.error("Save product error:", err);
      setError(err.message || "Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Stock status preview
  const numQty = parseInt(quantity, 10) || 0;
  const stockPreview = numQty === 0 ? "Out of Stock" : numQty <= 5 ? "Low Stock" : "In Stock";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-ivory rounded shadow-2xl border border-charcoal/20 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/15 bg-sand/40 px-6 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">
              Artisan Catalog Management
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
              {isEditing ? "Edit Craft Creation" : "Add New Craft Creation"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal/60 hover:text-vermilion text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded border border-vermilion/40 bg-vermilion/10 p-3 text-xs text-vermilion">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/80 border-b border-charcoal/10 pb-1">
              1. Basic Product Information
            </h4>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                Product Title <span className="text-vermilion">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Traditional Mithila Kohbar Wedding Canvas"
                className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Category <span className="text-vermilion">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Product Origin / Workshop Location <span className="text-vermilion">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Parsa, Terai, Nepal"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Detailed Description & Heritage Story <span className="text-vermilion">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={translating || (!description.trim() && !name.trim())}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-teal/15 via-terai/15 to-vermilion/15 text-charcoal border border-teal/30 hover:border-teal hover:bg-teal/10 transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Translate Nepali, Romanized Nepali, or Bhojpuri text into natural English"
                >
                  {translating ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-teal" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="text-teal font-medium">Translating with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-terai">✨</span>
                      <span>Translate to English</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how this piece is made, its cultural significance, and care instructions (in Nepali, Romanized Nepali, or English)..."
                className="w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
              />

              {/* Translation Notice / Status */}
              {translationNotice && (
                <div
                  className={`mt-2 p-2.5 rounded text-xs flex items-center justify-between ${
                    translationNotice.startsWith("✓")
                      ? "bg-teal/10 border border-teal/30 text-teal font-medium"
                      : "bg-terai/10 border border-terai/30 text-charcoal/90"
                  }`}
                >
                  <span>{translationNotice}</span>
                  <button
                    type="button"
                    onClick={() => setTranslationNotice("")}
                    className="text-charcoal/50 hover:text-charcoal font-bold ml-2 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Translation Active Pill */}
              {hasAppliedTranslation && !translationResult && (
                <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-lg bg-teal/10 border border-teal/25 text-xs text-teal">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">✓ English translation active.</span>
                    <span className="text-charcoal/70">
                      Original ({originalLanguage}) text is preserved and visible to customers as well.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevertToOriginal}
                    className="text-vermilion hover:underline font-semibold text-[11px] ml-2"
                  >
                    Restore Original
                  </button>
                </div>
              )}

              {/* Translation Review & Edit Box */}
              {translationResult && (
                <div className="mt-3 p-4 rounded-xl border border-teal/40 bg-teal/5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-teal/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1">
                        <span>✨</span> Gemini AI Translation
                      </span>
                      {translationResult.detectedLanguage && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal/15 text-teal border border-teal/20">
                          Detected: {translationResult.detectedLanguage}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTranslationResult(null)}
                      className="text-xs text-charcoal/50 hover:text-vermilion font-medium"
                    >
                      Dismiss
                    </button>
                  </div>

                  {/* Editable Translated Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal/80 uppercase">
                      Translated Product Title (Review / Edit)
                    </label>
                    <input
                      type="text"
                      value={translatedName}
                      onChange={(e) => setTranslatedName(e.target.value)}
                      className="mt-1 w-full rounded border border-teal/30 bg-white px-3 py-1.5 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                    />
                  </div>

                  {/* Editable Translated Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal/80 uppercase">
                      Translated Description (Review / Edit)
                    </label>
                    <textarea
                      rows={3}
                      value={translatedDesc}
                      onChange={(e) => setTranslatedDesc(e.target.value)}
                      className="mt-1 w-full rounded border border-teal/30 bg-white px-3 py-1.5 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                    />
                  </div>

                  {translationResult.notes && (
                    <p className="text-[11px] text-charcoal/70 italic">
                      💡 Cultural Terminology: {translationResult.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleApplyTranslation}
                      className="px-3.5 py-1.5 rounded bg-teal text-white text-xs font-bold hover:bg-teal/90 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      ✓ Use Translation
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranslationResult(null)}
                      className="px-3 py-1.5 rounded border border-charcoal/20 bg-white text-charcoal/80 text-xs font-semibold hover:bg-sand/50 transition-colors cursor-pointer"
                    >
                      Keep Original Only
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Stock Management */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/80 border-b border-charcoal/10 pb-1">
              2. Price & Inventory Management
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Price (NPR) <span className="text-vermilion">*</span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-charcoal/60">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded border border-charcoal/20 bg-ivory pl-9 pr-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Available Stock Quantity <span className="text-vermilion">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      stockPreview === "Out of Stock"
                        ? "bg-vermilion/15 text-vermilion"
                        : stockPreview === "Low Stock"
                          ? "bg-terai/20 text-terai"
                          : "bg-teal/15 text-teal"
                    }`}
                  >
                    {stockPreview}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="5"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Images Upload Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
                3. Product Photographs <span className="text-vermilion">*</span>
              </h4>
              <span className="text-[11px] text-charcoal/60">At least 1 photo required</span>
            </div>

            {imageError && (
              <p className="text-xs text-vermilion">{imageError}</p>
            )}

            {/* Thumbnails preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded border border-charcoal/20 overflow-hidden group">
                    <img src={img} alt={`Product preview ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-vermilion text-ivory text-xs flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-teal/90 text-ivory text-[9px] px-1 py-0.2 font-bold uppercase">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex flex-col items-center justify-center rounded border-2 border-dashed border-charcoal/25 bg-sand/30 p-6 text-center cursor-pointer hover:border-teal hover:bg-sand/60 transition-colors">
              <span className="text-2xl">📸</span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-charcoal">
                Choose Product Photos
              </span>
              <span className="mt-0.5 text-[11px] text-charcoal/50">
                Supports JPG, PNG, WebP (Max 5MB each)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFiles}
                className="hidden"
              />
            </label>
          </div>

          {/* Craft Specifications (Optional) */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/80 border-b border-charcoal/10 pb-1">
              4. Craft Details & Specifications <span className="text-charcoal/50 font-normal">(Optional)</span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Materials Used
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. Lokta paper, Sikki grass, Terracotta clay"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Crafting Method
                </label>
                <input
                  type="text"
                  value={craftingMethod}
                  onChange={(e) => setCraftingMethod(e.target.value)}
                  placeholder="e.g. Hand-spun, Wheel-thrown, Freehand brushwork"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 50cm x 70cm, Diameter 25cm"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                  Weight (in grams)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 450"
                  className="mt-1 w-full rounded border border-charcoal/20 bg-ivory px-3.5 py-2 text-xs text-charcoal"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="customizationAvailable"
                checked={customizationAvailable}
                onChange={(e) => setCustomizationAvailable(e.target.checked)}
                className="h-4 w-4 accent-teal"
              />
              <label htmlFor="customizationAvailable" className="text-xs font-semibold text-charcoal cursor-pointer">
                Customization or custom sizing available upon customer request
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-charcoal/15 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-charcoal/30 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-vermilion hover:bg-charcoal text-ivory px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {saving ? "Saving Product..." : isEditing ? "Update Product" : "Publish to Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
