import { useState, useEffect } from "react";

export default function StoryFormModal({
  isOpen,
  onClose,
  onSave,
  story = null,
  products = [],
}) {
  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaItems, setMediaItems] = useState([]); // [{ type: 'image'|'video', url, base64, order }]
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (story) {
      setProductId(story.product?._id || story.productId || "");
      setTitle(story.title || "");
      setDescription(story.description || "");
      setIsPublished(story.isPublished !== undefined ? story.isPublished : true);
      setMediaItems(
        (story.media || []).map((m, idx) => ({
          type: m.type,
          url: m.url,
          thumbnail: m.thumbnail,
          order: m.order !== undefined ? m.order : idx,
        })),
      );
    } else {
      setProductId(products[0]?._id || "");
      setTitle("");
      setDescription("");
      setIsPublished(true);
      setMediaItems([]);
    }
    setError("");
  }, [story, products, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Image ${file.name} exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaItems((prev) => [
          ...prev,
          {
            type: "image",
            url: reader.result,
            base64: reader.result,
            order: prev.length,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("Video exceeds 50MB limit. Please choose a shorter clip.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaItems((prev) => [
        ...prev,
        {
          type: "video",
          url: reader.result,
          base64: reader.result,
          order: prev.length,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeMediaItem = (idx) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!productId) {
      setError("Please select a craft from your catalog.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for the story.");
      return;
    }

    if (mediaItems.length === 0) {
      setError("Please add at least one craft photo or video to your story.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productId,
        title: title.trim(),
        description: description.trim(),
        media: mediaItems.map((m, idx) => ({
          type: m.type,
          url: m.url,
          base64: m.base64,
          order: idx,
        })),
        isPublished,
      };

      await onSave(payload, story?._id);
      onClose();
    } catch (err) {
      console.error("Story save error:", err);
      setError(err.message || "Failed to save craft story.");
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === productId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl bg-ivory rounded-xl border border-charcoal/20 shadow-2xl p-6 sm:p-8 overflow-hidden text-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              {story ? "Edit Craft Story" : "Create New Craft Story"}
            </h3>
            <p className="mt-1 text-xs text-charcoal/70">
              Share the artistic process, cultural heritage, and making of your handmade creation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sand hover:bg-vermilion hover:text-ivory text-charcoal transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded border border-vermilion/40 bg-vermilion/10 p-3 text-xs font-semibold text-vermilion">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Select Craft from Catalog <span className="text-vermilion">*</span>
            </label>
            {story ? (
              <div className="flex items-center gap-3 p-3 rounded border border-charcoal/20 bg-sand/30">
                {selectedProduct?.images?.[0] && (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {selectedProduct?.name || "Craft Product"}
                  </p>
                  <p className="text-xs text-charcoal/60">
                    Product cannot be changed once story is created.
                  </p>
                </div>
              </div>
            ) : (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full rounded border border-charcoal/25 bg-ivory px-3 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
              >
                {products.length === 0 ? (
                  <option value="">No products available. Please create a craft first.</option>
                ) : (
                  products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (NPR {p.price?.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Story Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Story Title <span className="text-vermilion">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Traditional Mithila Kohbar: The Auspicious Painting Process"
              className="w-full rounded border border-charcoal/25 bg-ivory px-3 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:border-teal focus:outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-charcoal/50">
              {title.length}/150
            </div>
          </div>

          {/* Story Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
              Story Description & Narrative
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how this craft is made, what raw materials were used (e.g. natural pigments, bamboo, clay), the artisans involved, and any sacred or traditional symbolism behind it..."
              className="w-full rounded border border-charcoal/25 bg-ivory px-3 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:border-teal focus:outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-charcoal/50">
              {description.length}/1000
            </div>
          </div>

          {/* Media Uploads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
                Craft Media (Photos & Video) <span className="text-vermilion">*</span>
              </label>
              <span className="text-[11px] text-charcoal/60">
                {mediaItems.length} item{mediaItems.length === 1 ? "" : "s"} attached
              </span>
            </div>

            {/* Media Items Preview Grid */}
            {mediaItems.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded overflow-hidden border border-charcoal/20 bg-charcoal/5"
                  >
                    {item.type === "video" ? (
                      <div className="relative h-full w-full bg-charcoal flex items-center justify-center">
                        <video
                          src={item.url}
                          className="h-full w-full object-cover opacity-80"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-ivory text-xl">
                          ▶
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt="Story preview"
                        className="h-full w-full object-cover"
                      />
                    )}

                    <span className="absolute top-1 left-1 rounded bg-charcoal/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-ivory">
                      {item.type}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeMediaItem(idx)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-vermilion text-ivory text-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Remove media"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-center gap-2 rounded border-2 border-dashed border-charcoal/25 bg-sand/30 p-4 text-center cursor-pointer hover:border-teal hover:bg-sand/60 transition-colors">
                <span className="text-lg">📷</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Add Photos (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <label className="flex items-center justify-center gap-2 rounded border-2 border-dashed border-charcoal/25 bg-sand/30 p-4 text-center cursor-pointer hover:border-vermilion hover:bg-sand/60 transition-colors">
                <span className="text-lg">🎬</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Add Video Clip (Max 50MB)
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between rounded border border-charcoal/15 bg-sand/30 p-3.5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Public Visibility
              </p>
              <p className="text-[11px] text-charcoal/70">
                {isPublished
                  ? "Story will be visible on product details page to all customers."
                  : "Saved as draft. Only visible inside your artisan dashboard."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-charcoal/25 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded border border-charcoal/25 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-vermilion hover:bg-charcoal px-6 py-2 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-ivory border-r-transparent" />
                  <span>Saving Story...</span>
                </>
              ) : (
                <span>{story ? "Update Story" : "Publish Story"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
