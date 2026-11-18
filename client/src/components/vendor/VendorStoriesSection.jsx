import { useState, useEffect, useCallback } from "react";
import { storyApi } from "../../services/api.js";
import StoryFormModal from "../StoryFormModal.jsx";
import StoryViewerModal from "../StoryViewerModal.jsx";
import ConfirmationModal from "../ConfirmationModal.jsx";

export default function VendorStoriesSection({ products = [] }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [previewStory, setPreviewStory] = useState(null);
  const [deletingStoryId, setDeletingStoryId] = useState(null);

  const loadStories = useCallback(() => {
    setLoading(true);
    storyApi
      .getMyStories()
      .then((res) => {
        if (res?.ok) {
          setStories(res.stories || []);
        } else {
          setError(res?.message || "Failed to load craft stories.");
        }
      })
      .catch((err) => {
        console.error("loadStories error:", err);
        setError("Network error while loading stories.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleSaveStory = async (payload, storyId) => {
    let res;
    if (storyId) {
      res = await storyApi.updateStory(storyId, payload);
    } else {
      res = await storyApi.createOrUpdateStory(payload);
    }
    if (res?.ok) {
      setMessage(res.message || "Story saved successfully!");
      setTimeout(() => setMessage(""), 5000);
      loadStories();
    } else {
      throw new Error(res?.message || "Failed to save story.");
    }
  };

  const handleTogglePublish = async (storyId) => {
    try {
      const res = await storyApi.togglePublish(storyId);
      if (res?.ok) {
        setStories((prev) =>
          prev.map((s) => (s._id === storyId ? { ...s, isPublished: res.isPublished } : s)),
        );
        setMessage(res.message || "Story status updated.");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (err) {
      console.error("togglePublish error:", err);
      setError("Failed to change story publication status.");
    }
  };

  const handleDeleteStory = async () => {
    if (!deletingStoryId) return;
    try {
      const res = await storyApi.deleteStory(deletingStoryId);
      if (res?.ok) {
        setStories((prev) => prev.filter((s) => s._id !== deletingStoryId));
        setMessage("Craft story deleted successfully.");
        setTimeout(() => setMessage(""), 4000);
      } else {
        setError(res?.message || "Failed to delete story.");
      }
    } catch (err) {
      console.error("deleteStory error:", err);
      setError("Failed to delete story.");
    } finally {
      setDeletingStoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded border border-charcoal/15 bg-sand/30 p-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-charcoal">
            Artisan Craft Storytelling
          </h3>
          <p className="text-xs text-charcoal/80 mt-0.5">
            Share behind-the-scenes making videos and cultural photos to connect directly with craft lovers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStory(null);
            setFormModalOpen(true);
          }}
          className="bg-vermilion hover:bg-charcoal text-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>✨</span>
          <span>Create New Story</span>
        </button>
      </div>

      {message && (
        <div className="rounded border border-teal/30 bg-teal/10 p-3 text-xs font-semibold text-teal flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 text-xs font-semibold text-vermilion flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Stories Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vermilion border-r-transparent" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
            Loading Stories...
          </p>
        </div>
      ) : stories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-charcoal/25 bg-sand/20 p-10 text-center">
          <span className="text-4xl">📖</span>
          <h4 className="mt-3 font-serif text-base font-bold text-charcoal">
            No Craft Stories Created Yet
          </h4>
          <p className="mt-1 text-xs text-charcoal/70 max-w-md mx-auto leading-relaxed">
            Every handcrafted item carries generations of indigenous knowledge and soul. Create a
            story for your products with workshop photos or short videos to inspire buyers!
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingStory(null);
              setFormModalOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded bg-vermilion px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors cursor-pointer"
          >
            <span>+</span>
            <span>Add Your First Craft Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((s) => {
            const firstImg = s.media?.[0]?.thumbnail || s.media?.[0]?.url || s.product?.image;
            const hasVideo = s.media?.some((m) => m.type === "video");

            return (
              <div
                key={s._id}
                className="flex flex-col justify-between rounded-lg border border-charcoal/15 bg-ivory shadow-xs overflow-hidden hover:border-charcoal/30 transition-all hover:shadow-sm"
              >
                <div>
                  {/* Media Cover */}
                  <div className="relative aspect-[16/10] bg-charcoal overflow-hidden group">
                    {firstImg ? (
                      <img
                        src={firstImg}
                        alt={s.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-ivory/50 text-xs">
                        No image
                      </div>
                    )}

                    {/* Status badge */}
                    <span
                      className={`absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        s.isPublished
                          ? "bg-teal text-ivory shadow-xs"
                          : "bg-charcoal/80 text-sand backdrop-blur-xs"
                      }`}
                    >
                      {s.isPublished ? "Published" : "Draft"}
                    </span>

                    {/* Media counts */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-charcoal/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-ivory font-semibold">
                      {hasVideo && <span>🎬 Video</span>}
                      <span>📷 {s.media?.length || 0} media</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    {/* Linked Product Info */}
                    {s.product && (
                      <div className="flex items-center gap-2 pb-1 text-[11px] text-teal font-semibold">
                        <span>🏷️ Craft:</span>
                        <span className="line-clamp-1">{s.product.name}</span>
                      </div>
                    )}

                    <h4 className="font-serif text-base font-bold text-charcoal line-clamp-2 leading-snug">
                      {s.title}
                    </h4>

                    {s.description && (
                      <p className="text-xs text-charcoal/70 line-clamp-3 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between border-t border-charcoal/10 bg-sand/30 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewStory(s)}
                      className="font-semibold text-teal hover:text-charcoal transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <span className="text-charcoal/30">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStory(s);
                        setFormModalOpen(true);
                      }}
                      className="font-semibold text-charcoal hover:text-vermilion transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(s._id)}
                      className={`text-[11px] font-semibold underline cursor-pointer ${
                        s.isPublished
                          ? "text-charcoal/60 hover:text-charcoal"
                          : "text-vermilion hover:text-charcoal"
                      }`}
                    >
                      {s.isPublished ? "Make Draft" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStoryId(s._id)}
                      className="text-vermilion hover:text-charcoal transition-colors text-sm cursor-pointer p-1"
                      title="Delete Story"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Story Form Modal */}
      <StoryFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingStory(null);
        }}
        onSave={handleSaveStory}
        story={editingStory}
        products={products}
      />

      {/* Story Preview Modal */}
      <StoryViewerModal
        isOpen={Boolean(previewStory)}
        story={previewStory}
        onClose={() => setPreviewStory(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingStoryId)}
        title="Delete Craft Story"
        message="Are you sure you want to permanently delete this craft story? This cannot be undone."
        confirmText="Delete Story"
        confirmVariant="danger"
        onConfirm={handleDeleteStory}
        onCancel={() => setDeletingStoryId(null)}
      />
    </div>
  );
}
