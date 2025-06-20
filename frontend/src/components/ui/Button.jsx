import styles from "./Button.module.css";


/**
 * כפתור כללי עם וריאציות צבע ואייקון אופציונלי
 *
 * @param {string}  variant  "primary" | "settings" | "logout" (ברירת־מחדל: "primary")
 * @param {object}  icon     קומפוננטת אייקון מ-`react-icons` (אופציונלי)
 * @param {string}  children תוכן הכפתור
 * @param {object}  rest     כל שאר ה-props המקוריים של <button>
 */
export default function Button({
  variant = "primary",
  icon: Icon,
  children,
  ...rest
}) {
  return (
    <button {...rest} className={`${styles.btn} ${styles[`btn--${variant}`]}`}>
      {Icon && <Icon size={18} className={styles.icon} />}
      {children}
    </button>
  );
}

