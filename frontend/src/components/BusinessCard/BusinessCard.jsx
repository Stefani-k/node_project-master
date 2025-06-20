// src/components/BusinessCard/BusinessCard.jsx
import React, { useState, memo, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./BusinessCard.module.css";

const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholder_buisness.png";

const renderStars = (rating, maxStars = 5) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;
  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      stars.push(
        <span
          key={`star-full-${i}`}
          className={`${styles.star} ${styles.starFull}`}
        >
          ★
        </span>
      );
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <span
          key={`star-half-${i}`}
          className={`${styles.star} ${styles.starHalf}`}
        >
          ★
        </span>
      );
    } else {
      stars.push(
        <span
          key={`star-empty-${i}`}
          className={`${styles.star} ${styles.starEmpty}`}
        >
          ☆
        </span>
      );
    }
  }
  return stars;
};

const BusinessCard = memo(function BusinessCard({
  business,
  onUpdate,
  onDelete,
  onOpenModal,
  userRole,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: business.name || "",
    category: business.category || "",
    description: business.description || "",
    location: business.location || "",
    phone: business.phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    business_id,
    name = "שם עסק לא ידוע",
    category = "",
    location = "",
    description = "",
    phone = "",
    photos,
    average_rating,
    review_count,
  } = business;

  let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
  if (photos) {
    try {
      const parsedPhotos =
        typeof photos === "string" ? JSON.parse(photos) : photos;
      if (
        Array.isArray(parsedPhotos) &&
        parsedPhotos.length > 0 &&
        parsedPhotos[0]
      ) {
        imageUrl = parsedPhotos[0];
      }
    } catch (e) {
      // Keep default image
    }
  }

  const handleImageError = (event) => {
    if (event.target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
      event.target.onerror = null;
      event.target.src = DEFAULT_PLACEHOLDER_IMAGE;
    }
  };

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await axiosInstance.put(
          `/businesses/${business_id}`,
          editData
        );
        onUpdate(response.data);
        setIsEditing(false);
      } catch (error) {
        alert("נכשל בעדכון העסק");
      } finally {
        setIsLoading(false);
      }
    },
    [business_id, editData, onUpdate]
  );

  const handleDelete = useCallback(async () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עסק זה?")) {
      setIsLoading(true);
      try {
        await axiosInstance.delete(`/businesses/${business_id}`);
        onDelete(business_id);
      } catch (error) {
        alert("נכשל במחיקת העסק");
      } finally {
        setIsLoading(false);
      }
    }
  }, [business_id, onDelete]);

  const handleImageClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onOpenModal) {
        onOpenModal(business);
      }
    },
    [onOpenModal, business]
  );

  const handleNameClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onOpenModal) {
        onOpenModal(business);
      }
    },
    [onOpenModal, business]
  );

  const canModify = true;
  const showButtons = canModify || !userRole;

  if (isEditing && canModify) {
    return (
      <div className={styles.businessCard}>
        <form onSubmit={handleUpdate} className={styles.editForm}>
          <input
            type="text"
            name="name" // <-- צריך להיות "name"!
            value={editData.name}
            onChange={handleEditChange}
            placeholder="שם העסק"
            className={styles.editInput}
            required
          />
          <input
            type="text"
            name="category"
            value={editData.category}
            onChange={handleEditChange}
            placeholder="קטגוריה"
            className={styles.editInput}
            required
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            placeholder="תיאור"
            className={styles.editTextarea}
            rows="3"
          />
          <input
            type="text"
            name="location"
            value={editData.location}
            onChange={handleEditChange}
            placeholder="מיקום"
            className={styles.editInput}
          />
          <input
            type="tel"
            name="phone"
            value={editData.phone}
            onChange={handleEditChange}
            placeholder="טלפון"
            className={styles.editInput}
          />
          <div className={styles.editActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? "💾 שומר..." : "💾 שמור"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              ❌ ביטול
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.businessCard}>
      <div className={styles.imageContainer} onClick={handleImageClick}>
        <img
          src={imageUrl}
          alt={`תמונה של ${name}`}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.businessName} onClick={handleNameClick}>
          {name}
        </h3>
        {category && <p className={styles.category}>{category}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {location && <p className={styles.location}>📍 {location}</p>}
        {phone && <p className={styles.phone}>📞 {phone}</p>}

        {typeof average_rating === "number" && (
          <div
            className={styles.ratingContainer}
            aria-label={`Rating: ${average_rating.toFixed(1)} out of 5 stars`}
          >
            <span className={styles.ratingValue} aria-hidden="true">
              ⭐ {average_rating.toFixed(1)}
            </span>
            <span className={styles.stars} aria-hidden="true">
              {renderStars(average_rating)}
            </span>
            {typeof review_count === "number" && review_count > 0 && (
              <span
                className={styles.reviewCount}
                aria-label={`${review_count} reviews`}
              >
                ({review_count})
              </span>
            )}
          </div>
        )}
      </div>

      {showButtons && (
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            ✏️ ערוך
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "🗑️ מוחק..." : "🗑️ מחק"}
          </button>
        </div>
      )}
    </div>
  );
});

export default BusinessCard;
