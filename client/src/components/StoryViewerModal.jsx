import { useState, useEffect } from "react";

export default function StoryViewerModal({ story, isOpen, onClose }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [story]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        nextMedia();
      } else if (e.key === "ArrowLeft") {
        prevMedia();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeMediaIndex, story]);

  if (!isOpen || !story) return null;

  const mediaList = story.media || [];
  const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

  const isVideo =
    currentMedia?.type === "video" ||
    (typeof currentMedia?.url === "string" &&
      (currentMedia.url.startsWith("data:video/") ||
        /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(currentMedia.url) ||
        currentMedia.url.includes("/video/upload/")));

  const nextMedia = () => {
    if (mediaList.length > 1) {
      setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
    }
  };

  const prevMedia = () => {
    if (mediaList.length > 1) {
      setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    }
  };

  const artisanName = story.artisan?.name || story.artisan?.businessName || "Local Artisan";
  const artisanAvatar = story.artisan?.avatar || "";
  const vendorId = story.artisan?.vendorId || story.vendorId;

  const handleArtisanClick = () => {
    if (vendorId) {
      onClose();
      window.location.hash = `#artisan?id=${vendorId}`;
    }
  };

  const handleProductClick = () => {
    if (story.productId) {
      onClose();
      window.location.hash = `#product?id=${story.productId}`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-h-[92vh] w-full max-w-2xl bg-ivory rounded-xl overflow-hidden shadow-2xl border border-charcoal/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-charcoal/10 bg-ivory/95 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleArtisanClick}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {artisanAvatar ? (
              <img
                src={artisanAvatar}
                alt={artisanName}
                className="h-10 w-10 rounded-full object-cover border-2 border-teal group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-ivory font-serif font-bold text-sm">
                {artisanName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-wider text-charcoal/60 font-medium">
                  Craft Story
                </span>
                <span className="text-[10px] bg-teal/15 text-teal px-1.5 py-0.2 rounded font-semibold">
                  Artisan Studio
                </span>
              </div>
              <p className="font-serif text-sm font-bold text-charcoal group-hover:text-vermilion transition-colors">
                {artisanName}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sand hover:bg-vermilion hover:text-ivory text-charcoal transition-colors cursor-pointer"
            aria-label="Close story"
          >
            ✕
          </button>
        </div>

        {/* Media Segment Progress Bars (if multiple media) */}
        {mediaList.length > 1 && (
          <div className="flex gap-1.5 px-4 pt-2 bg-charcoal/95">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMediaIndex(idx)}
                className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                  idx === activeMediaIndex ? "bg-vermilion" : "bg-ivory/30 hover:bg-ivory/50"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Media Main Stage */}
        <div className="relative flex items-center justify-center bg-charcoal aspect-[4/3] sm:aspect-[16/10] max-h-[50vh] overflow-hidden select-none">
          {currentMedia ? (
            isVideo ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <img
                key={currentMedia.url}
                src={currentMedia.url}
                alt={story.title}
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <div className="text-ivory/60 text-sm">No media available.</div>
          )}

          {/* Navigation Arrows */}
          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-ivory backdrop-blur-xs hover:bg-vermilion transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-ivory backdrop-blur-xs hover:bg-vermilion transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                ›
              </button>
            </>
          )}

          {/* Slide counter */}
          {mediaList.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded bg-charcoal/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-ivory">
              {activeMediaIndex + 1} / {mediaList.length}
            </span>
          )}
        </div>

        {/* Narrative & Details Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-ivory">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal">
              {story.title}
            </h3>
            {story.description && (
              <p className="mt-1.5 text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                {story.description}
              </p>
            )}
          </div>

          {/* Attached Product Card Footer */}
          {story.productName && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-charcoal/15 bg-sand/40 p-3 hover:bg-sand/70 transition-colors">
              <div className="flex items-center gap-3">
                {story.productImage && (
                  <img
                    src={story.productImage}
                    alt={story.productName}
                    className="h-12 w-12 rounded object-cover border border-charcoal/15"
                  />
                )}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                    Featured Handcraft
                  </p>
                  <h4 className="font-serif text-sm font-bold text-charcoal line-clamp-1">
                    {story.productName}
                  </h4>
                  {story.productPrice && (
                    <p className="text-xs font-semibold text-vermilion">
                      NPR {story.productPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProductClick}
                className="bg-vermilion hover:bg-charcoal text-ivory px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                View Craft
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
