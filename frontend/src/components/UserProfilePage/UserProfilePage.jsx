// src/components/UserProfilePage/UserProfilePage.jsx

// --- Imports ---
import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiXCircle, FiLogOut } from 'react-icons/fi';
import formStyles from '../Forms/Form.module.css';
import pageStyles from './UserProfilePage.module.css';
import axiosInstance from '../../api/axiosInstance'; // Import axios

function UserProfilePage({ user, onLogout }) {
  // --- State Hooks (no changes) ---
  const [isEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // --- Effect to fetch fresh user data ---
  useEffect(() => {
    // --- DEBUGGING STEP: Let's log the user object ---
    // This will show us in the browser console exactly what properties the user object has.
    // We are looking for 'user_id'.
    console.log("User object received by profile page:", user);

    if (user?.user_id) {
      setIsLoading(true);
      axiosInstance.get(`/users/${user.user_id}`)
        .then(response => {
          const freshUserData = response.data;
          setFormData({
            firstName: freshUserData.first_name || '',
            lastName: freshUserData.last_name || '',
            phone: freshUserData.phone || '',
          });
        })
        .catch(err => {
          // This is where your error is being caught
          console.error("Failed to fetch user profile:", err);
          setError("Could not load profile information.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // If we get here, it means user.user_id is missing.
      setError("Cannot load profile: User ID is missing.");
      setIsLoading(false);
    }
  }, [user]); // We change the dependency to `user` to re-run if the whole object changes.

  // --- Event Handlers  ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Add save logic here
  };

  // --- Conditional Renders ---
  // If the page is loading, show a loading message
  if (isLoading) {
    return <div className={pageStyles.loading}>Loading user profile...</div>;
  }
  // If there was an error, show an error message
  if (error) {
    return <div className={pageStyles.error}>{error}</div>;
  }
  // If there's no user object at all (e.g., user logged out), show nothing.
  if (!user) {
    return null;
  }

  // --- JSX for Rendering (No changes needed here) ---
  return (
    <div className={pageStyles.profilePage} >
      <div className={pageStyles.profileCard} dir="rtl">
        {/* --- Compact Profile Header --- */}
        <div className={pageStyles.profileHeader}>
          <div className={pageStyles.avatar}>
            <span>{user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'S'}</span>
          </div>
          <h2>{user.firstName} {user.lastName}</h2>
          <p className={pageStyles.email}>{user.email}</p>
        </div>

        {/* --- Compact Main Content --- */}
        <div className={pageStyles.mainContent}>
          {/* --- Profile Details Form --- */}
          <div className={pageStyles.leftSection}>
            <form onSubmit={handleSaveChanges} className={pageStyles.detailsForm}>
              <h3>פרטים אישיים</h3>

              <div className={pageStyles.formGrid}>
                <div className={pageStyles.fieldGroup}>
                  <label>שם פרטי</label>
                  <input
                    type="text"
                    name="firstName"
                    className={formStyles.inputField}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="הכנס שם פרטי"
                  />
                </div>

                <div className={pageStyles.fieldGroup}>
                  <label>שם משפחה</label>
                  <input
                    type="text"
                    name="lastName"
                    className={formStyles.inputField}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="הכנס שם משפחה"
                  />
                </div>

                <div className={`${pageStyles.fieldGroup} ${pageStyles.phoneField}`}>
                  <label>מספר טלפון</label>
                  <input
                    type="tel"
                    name="phone"
                    className={formStyles.inputField}
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="הכנס מספר טלפון"
                  />
                </div>


              </div>
            </form>
          </div>

          {/* --- Account Actions --- */}
          <div className={pageStyles.rightSection}>
            <div className={pageStyles.actionsSection}>
              <h3>פעולות חשבון</h3>
              <button onClick={onLogout} className={`${pageStyles.actionLink} ${pageStyles.logoutButton}`}>
                <FiLogOut />
                <span>התנתק</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;