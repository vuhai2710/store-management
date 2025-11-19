import React, { useState } from "react";
import { Image, Modal } from "antd";

/**
 * ImageLightbox Component
 * Displays images in a lightbox gallery
 * 
 * @param {Object} props
 * @param {Array} props.images - Array of image URLs or objects { url, alt, title }
 * @param {number} props.currentIndex - Initial image index
 * @param {boolean} props.visible - Whether lightbox is visible
 * @param {Function} props.onClose - Callback when lightbox is closed
 * @param {string} props.previewType - Preview type: 'modal' | 'preview' (default: 'modal')
 */
const ImageLightbox = ({
  images = [],
  currentIndex = 0,
  visible = false,
  onClose,
  previewType = "modal",
}) => {
  const [current, setCurrent] = useState(currentIndex);

  if (previewType === "preview") {
    // Use Ant Design Image.PreviewGroup for built-in preview
    return (
      <Image.PreviewGroup>
        {images.map((img, index) => {
          const imageUrl = typeof img === "string" ? img : img.url;
          const alt = typeof img === "string" ? `Image ${index + 1}` : img.alt || `Image ${index + 1}`;
          return (
            <Image
              key={index}
              src={imageUrl}
              alt={alt}
              style={{ display: "none" }}
              preview={{
                src: imageUrl,
              }}
            />
          );
        })}
      </Image.PreviewGroup>
    );
  }

  // Custom modal lightbox
  const currentImage = images[current];
  const imageUrl = typeof currentImage === "string" ? currentImage : currentImage?.url;
  const imageAlt = typeof currentImage === "string" ? `Image ${current + 1}` : currentImage?.alt || `Image ${current + 1}`;
  const imageTitle = typeof currentImage === "string" ? null : currentImage?.title;

  const handlePrevious = () => {
    setCurrent((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ padding: 0, textAlign: "center" }}
      onKeyDown={handleKeyDown}
      centered
    >
      <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
        <img
          src={imageUrl}
          alt={imageAlt}
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
        {imageTitle && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {imageTitle}
          </div>
        )}
        {images.length > 1 && (
          <>
            <div
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                background: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "10px 15px",
                borderRadius: "4px",
                userSelect: "none",
              }}
              onClick={handlePrevious}
            >
              ‹
            </div>
            <div
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                background: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "10px 15px",
                borderRadius: "4px",
                userSelect: "none",
              }}
              onClick={handleNext}
            >
              ›
            </div>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageLightbox;

