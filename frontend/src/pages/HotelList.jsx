import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HotelCard from '../components/HotelCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import SuccessPopup from '../components/SuccessPopup';
import Loader from '../components/Loader';
import {
  fetchHotels,
  deleteHotel,
  setFilters,
  setPage,
  resetFilters,
  PAGE_SIZE,
} from '../store/hotelSlice';

function HotelList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { list, total, loading, error, filters } = useSelector((state) => state.hotels);

  const [searchText, setSearchText] = useState(filters.search);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // load hotels whenever filters / page change
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch, filters]);

  // debounce the title search so we don't hit the api on every key press
  useEffect(() => {
    if (searchText.trim() === filters.search) return;
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchText.trim() }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, filters.search, dispatch]);

  // message coming from add page (hotel added)
  useEffect(() => {
    if (location.state?.flash) {
      setPopupMessage(location.state.flash);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleApplyPrice = (e) => {
    e.preventDefault();

    if ((minPrice !== '' && Number(minPrice) < 0) || (maxPrice !== '' && Number(maxPrice) < 0)) {
      setPriceError('Price cannot be negative');
      return;
    }
    if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
      setPriceError('Min price cannot be greater than max price');
      return;
    }

    setPriceError('');
    dispatch(setFilters({ minPrice, maxPrice }));
  };

  const handleReset = () => {
    setSearchText('');
    setMinPrice('');
    setMaxPrice('');
    setPriceError('');
    dispatch(resetFilters());
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDelete = (hotel) => {
    setDeleteError('');
    setDeleteTarget(hotel);
  };

  const closeDelete = () => {
    if (!deleting) setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await dispatch(deleteHotel(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      setPopupMessage('Hotel deleted successfully');

      // if that was the last item on this page go one page back, else just reload
      if (list.length === 1 && filters.page > 1) {
        dispatch(setPage(filters.page - 1));
      } else {
        dispatch(fetchHotels());
      }
    } catch (err) {
      setDeleteError(err.message || 'Could not delete the hotel');
    } finally {
      setDeleting(false);
    }
  };

  const closePopup = useCallback(() => setPopupMessage(''), []);

  return (
    <section>
      <Helmet>
        <title>Hotels | NestQuest</title>
        <meta
          name="description"
          content="Browse hotels, search by name and filter by price range on NestQuest."
        />
        <meta property="og:title" content="Hotels | NestQuest" />
      </Helmet>

      <div className="page-head">
        <h1>Hotels</h1>
        <Link to="/hotels/new" className="btn btn-primary">
          + Add Hotel
        </Link>
      </div>

      <div className="layout">
        <FilterPanel
          searchText={searchText}
          onSearchChange={setSearchText}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
          onApplyPrice={handleApplyPrice}
          onReset={handleReset}
          priceError={priceError}
        />

        <div className="results">
          <div className="results__bar">
            <strong>{total}</strong> {total === 1 ? 'hotel' : 'hotels'} found
          </div>

          {loading && <Loader text="Loading hotels..." />}

          {!loading && error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && list.length === 0 && (
            <div className="empty">
              <h3>No hotels found</h3>
              <p>Try changing your search or price filter.</p>
            </div>
          )}

          {!loading && !error && list.length > 0 && (
            <div className="hotel-list">
              {list.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onDelete={openDelete} />
              ))}
            </div>
          )}

          <Pagination page={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete hotel?"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}

      {popupMessage && <SuccessPopup message={popupMessage} onClose={closePopup} />}
    </section>
  );
}

export default HotelList;
