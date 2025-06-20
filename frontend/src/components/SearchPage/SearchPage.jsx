// src/components/SearchPage/SearchPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import BusinessCard from "../BusinessCard/BusinessCard.jsx";
import BusinessModal from "../BusinessModal/BusinessModal.jsx";
import styles from "./SearchPage.module.css";
import axiosInstance from "../../api/axiosInstance.js";

// Debounce utility function with cleanup
function debounce(func, delay) {
  let timeoutId;
  const debouncedFunction = function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

function SearchPage({ user }) {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modalBusiness, setModalBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    phone: "",
    email: "", // <-- חדש
    schedule: "", // <-- חדש
  });

  const fetchAllBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/businesses");
      const businesses = response.data || [];

      setAllBusinesses(businesses);
      setFilteredBusinesses(businesses);
      setTotalItems(businesses.length);
    } catch (err) {
      let errorMessage = "Could not load businesses. Please try again.";
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
      setAllBusinesses([]);
      setFilteredBusinesses([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterBusinesses = useCallback(() => {
    let filtered = [...allBusinesses];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (business) =>
          (business.name || "").toLowerCase().includes(searchLower) ||
          (business.description || "").toLowerCase().includes(searchLower) ||
          (business.category || "").toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory
      );
    }

    filtered.sort((a, b) => {
      switch (orderBy) {
        case "category":
          return (
            (a.category || "").localeCompare(b.category || "") ||
            (a.name || "").localeCompare(b.name || "")
          );
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "newest":
          return (b.business_id || 0) - (a.business_id || 0);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    setFilteredBusinesses(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [allBusinesses, searchTerm, selectedCategory, orderBy]);

  const debouncedFilter = useCallback(
    debounce(() => {
      filterBusinesses();
    }, 150),
    [filterBusinesses]
  );

  useEffect(() => {
    fetchAllBusinesses();

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/businesses/categories");
        setCategories(response.data || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [fetchAllBusinesses]);

  useEffect(() => {
    if (allBusinesses.length > 0) {
      filterBusinesses();
    }
  }, [selectedCategory, orderBy, filterBusinesses]);

  useEffect(() => {
    if (allBusinesses.length > 0) {
      debouncedFilter();
    }
  }, [searchTerm, debouncedFilter]);

  const handleSearchInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleCategoryChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleOrderByChange = useCallback((event) => {
    setOrderBy(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (debouncedFilter.cancel) {
        debouncedFilter.cancel();
      }
      filterBusinesses();
    },
    [debouncedFilter, filterBusinesses]
  );

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // שליפת המשתמש הנוכחי מ־localStorage
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    const owner_id = currentUser?.user_id;

    try {
      // שלח לשרת את כל השדות, כולל email, schedule ו־owner_id
      const response = await axiosInstance.post("/businesses", {
        ...newBusiness,
        owner_id: owner_id,
      });
      setAllBusinesses((prev) => [response.data, ...prev]);
      setNewBusiness({
        name: "",
        category: "",
        description: "",
        location: "",
        phone: "",
        email: "", // איפוס
        schedule: "", // איפוס
      });
      setShowCreateForm(false);
    } catch (error) {
      setError("Failed to create business");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBusiness = useCallback((updatedBusiness) => {
    setAllBusinesses((prev) =>
      prev.map((business) =>
        business.business_id === updatedBusiness.business_id
          ? updatedBusiness
          : business
      )
    );
  }, []);

  const handleDeleteBusiness = useCallback((businessId) => {
    setAllBusinesses((prev) =>
      prev.filter((business) => business.business_id !== businessId)
    );
  }, []);

  const handleNewBusinessChange = (e) => {
    const { name, value } = e.target;
    setNewBusiness((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = useCallback((business) => {
    setModalBusiness(business);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalBusiness(null);
  }, []);

  const canCreateBusiness = true;

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          קודם
        </button>
        <span>
          עמוד {currentPage} מתוך {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          הבא
        </button>
      </div>
    );
  };

  return (
    <div className={styles.searchPageContainer}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>גלה עסקים</h1>
        <form onSubmit={handleFormSubmit} className={styles.filterForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="חפש שם עסק, שירות..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
              aria-label="Search businesses"
            />
          </div>
          <div className={styles.filterControls}>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles.filterSelect}
              aria-label="Select category"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={orderBy}
              onChange={handleOrderByChange}
              className={styles.filterSelect}
              aria-label="Order by"
            >
              <option value="name">סדר לפי שם</option>
              <option value="category">סדר לפי קטגוריה</option>
              <option value="newest">חדשים ראשון</option>
            </select>
          </div>
        </form>
      </header>

      {(canCreateBusiness || !user?.role) && (
        <div className={styles.createBusinessSection}>
          {!showCreateForm ? (
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              ➕ הוסף עסק חדש
            </button>
          ) : (
            <form onSubmit={handleCreateBusiness} className={styles.createForm}>
              <h3>צור עסק חדש</h3>
              <input
                type="text"
                name="name"
                value={newBusiness.name}
                onChange={handleNewBusinessChange}
                placeholder="שם העסק"
                className={styles.createInput}
                required
              />
              <input
                type="text"
                name="category"
                value={newBusiness.category}
                onChange={handleNewBusinessChange}
                placeholder="קטגוריה"
                className={styles.createInput}
                required
              />
              <textarea
                name="description"
                value={newBusiness.description}
                onChange={handleNewBusinessChange}
                placeholder="תיאור"
                className={styles.createTextarea}
                rows="3"
              />
              <input
                type="text"
                name="location"
                value={newBusiness.location}
                onChange={handleNewBusinessChange}
                placeholder="מיקום"
                className={styles.createInput}
              />
              <input
                type="tel"
                name="phone"
                value={newBusiness.phone}
                onChange={handleNewBusinessChange}
                placeholder="טלפון"
                className={styles.createInput}
              />
              {/* שדה אימייל */}
              <input
                type="email"
                name="email"
                value={newBusiness.email}
                onChange={handleNewBusinessChange}
                placeholder="אימייל (לא חובה)"
                className={styles.createInput}
              />
              {/* שדה לוח זמנים */}
              <input
                type="text"
                name="schedule"
                value={newBusiness.schedule}
                onChange={handleNewBusinessChange}
                placeholder="לוח זמנים (לא חובה)"
                className={styles.createInput}
              />
              <div className={styles.createActions}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? "💾 יוצר..." : "💾 צור עסק"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                  disabled={isLoading}
                >
                  ❌ ביטול
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingIndicator}>טוען עסקים...</div>
      )}
      {!isLoading && error && (
        <div className={styles.errorMessage}>
          <p>אופס! משהו השתבש:</p>
          <p>{error}</p>
          <button
            onClick={() => fetchAllBusinesses()}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
      {!isLoading &&
        !error &&
        filteredBusinesses.length === 0 &&
        allBusinesses.length > 0 && (
          <p className={styles.noResultsMessage}>
            לא נמצאו עסקים התואמים את חיפושך.
          </p>
        )}
      {!isLoading && !error && allBusinesses.length === 0 && (
        <p className={styles.noResultsMessage}>אין עסקים זמינים.</p>
      )}

      {!isLoading && !error && filteredBusinesses.length > 0 && (
        <BusinessList
          businesses={filteredBusinesses.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          onUpdate={handleUpdateBusiness}
          onDelete={handleDeleteBusiness}
          onOpenModal={handleOpenModal}
          userRole={user?.role}
        />
      )}
      {!isLoading &&
        !error &&
        filteredBusinesses.length > 0 &&
        renderPagination()}

      <BusinessModal
        business={modalBusiness}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

const BusinessList = React.memo(
  ({ businesses, onUpdate, onDelete, onOpenModal, userRole }) => {
    return (
      <main className={styles.businessesGrid}>
        {businesses.map((business) => (
          <BusinessCard
            key={business.business_id}
            business={business}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onOpenModal={onOpenModal}
            userRole={userRole}
          />
        ))}
      </main>
    );
  }
);

BusinessList.displayName = "BusinessList";

export default SearchPage;
