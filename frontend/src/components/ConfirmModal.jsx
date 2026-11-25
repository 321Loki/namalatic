function ConfirmModal({ title, message, confirmText = 'Delete', loading, error, onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={loading ? undefined : onCancel}>
      <div className="popup" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {error && <p className="error-text">{error}</p>}
        <div className="popup__buttons">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
