// src/components/BusinessModal/BusinessModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';
import styles from './BusinessModal.module.css';

function BusinessModal({ business, isOpen, onClose }) {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && business?.business_id) {
      fetchServices();
    }
  }, [isOpen, business?.business_id]);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to fetch services - if endpoint doesn't exist, we'll show basic info
      const response = await axiosInstance.get(`/businesses/${business.business_id}/services`);
      setServices(response.data || []);
    } catch (err) {
      console.log('Services endpoint not available:', err);
      setServices([]); // No services available
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !business) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on child elements
    if (e.target.classList.contains(styles.modalBackdrop)) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    // Prevent event bubbling to backdrop
    e.stopPropagation();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} dir="rtl" onClick={handleModalContentClick}>
        <div className={styles.modalHeader}>
          <h2>{business.name || business.business_name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Services Section Only */}
          <div className={styles.servicesSection}>
            {isLoading ? (
              <div className={styles.loading}>טוען שירותים...</div>
            ) : error ? (
              <div className={styles.error}>שגיאה בטעינת השירותים</div>
            ) : services.length > 0 ? (
              <div className={styles.servicesList}>
                {services.map(service => (
                  <div key={service.service_id} className={styles.serviceItem}>
                    <div className={styles.serviceName}>{service.name}</div>
                    <div className={styles.servicePrice}>₪{service.price}</div>
                    {service.duration && (
                      <div className={styles.serviceDuration}>{service.duration} דקות</div>
                    )}
                    {service.description && (
                      <div className={styles.serviceDescription}>{service.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noServices}>אין שירותים זמינים כרגע</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessModal;