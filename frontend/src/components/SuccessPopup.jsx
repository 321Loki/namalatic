import { useEffect } from 'react';

function SuccessPopup({ message, onClose, duration = 2500 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="popup"
        role="alertdialog"
        aria-live="assertive"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup__icon">&#10003;</div>
        <h3>Success</h3>
        <p>{message}</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default SuccessPopup;
