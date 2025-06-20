// src/components/HomePage/HomePage.jsx

import React from 'react';
import styles from './HomePage.module.css';

/**
 * HomePage component - Simple mobile-first landing page
 */
function HomePage({ user, setPage }) {
  return (
    <div className={styles.homePageContainer}>
      {/* Main Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          ברוכים הבאים למערכת ניהול תורים
        </h1>
        
        <p className={styles.subtitle}>
          שלום {user?.firstName || 'משתמש'}! 
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => setPage('search')}
          >
            🔍 חיפוש עסקים
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => setPage('profile')}
          >
            👤 הפרופיל שלי
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;