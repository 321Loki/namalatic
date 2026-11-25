function FilterPanel({
  searchText,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  onApplyPrice,
  onReset,
  priceError,
}) {
  return (
    <aside className="filters">
      <div className="filters__block">
        <h2 className="filters__heading">Search</h2>
        <input
          type="search"
          className="input"
          placeholder="Search by hotel name"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search hotels by title"
        />
      </div>

      <form className="filters__block" onSubmit={onApplyPrice} noValidate>
        <h2 className="filters__heading">Price range</h2>
        <div className="filters__row">
          <div>
            <label htmlFor="minPrice">Min</label>
            <input
              id="minPrice"
              type="number"
              min="0"
              className="input"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinChange(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="maxPrice">Max</label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              className="input"
              placeholder="10000"
              value={maxPrice}
              onChange={(e) => onMaxChange(e.target.value)}
            />
          </div>
        </div>
        {priceError && <p className="error-text">{priceError}</p>}
        <button type="submit" className="btn btn-primary btn-block">
          Apply
        </button>
      </form>

      <button type="button" className="btn btn-outline btn-block" onClick={onReset}>
        Clear all filters
      </button>
    </aside>
  );
}

export default FilterPanel;
