function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spinner" />
      <p>{text}</p>
    </div>
  );
}

export default Loader;
