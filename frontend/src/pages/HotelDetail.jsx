import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import SuccessPopup from '../components/SuccessPopup';
import { fetchHotelById, clearCurrent } from '../store/hotelSlice';
import { getImageUrl, formatPrice, truncate, PLACEHOLDER_IMG } from '../utils/helpers';

function HotelDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { current, loading, error } = useSelector((state) => state.hotels);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  // "hotel updated" message from edit page
  useEffect(() => {
    if (location.state?.flash) {
      setPopupMessage(location.state.flash);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const closePopup = useCallback(() => setPopupMessage(''), []);

  const hotel = current && String(current.id) === String(id) ? current : null;

  if (loading && !hotel) return <Loader text="Loading hotel..." />;

  if (!hotel) {
    return (
      <div>
        <Helmet>
          <title>Hotel not found | StayFinder</title>
        </Helmet>
        <div className="alert alert-error">{error || 'Hotel not found'}</div>
        <Link to="/" className="btn btn-outline">
          Back to hotels
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(hotel.image);
  const metaDescription = truncate(hotel.description, 155);

  return (
    <article className="detail">
      <Helmet>
        <title>{`${hotel.title} | StayFinder`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="page-head">
        <Link to="/" className="btn btn-outline btn-sm">
          &larr; Back to hotels
        </Link>
        <Link to={`/hotels/${hotel.id}/edit`} className="btn btn-primary btn-sm">
          Edit hotel
        </Link>
      </div>

      <div className="detail__top card">
        <div className="detail__image">
          <img
            src={imageUrl}
            alt={`${hotel.title} - hotel photo`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />
        </div>

        <div className="detail__info">
          <h1>{hotel.title}</h1>
          <div className="detail__price">
            {formatPrice(hotel.price)} <small>per night</small>
          </div>
          <p className="detail__coords">
            Latitude: {hotel.latitude} <br />
            Longitude: {hotel.longitude}
          </p>
          <h2>About this hotel</h2>
          <p className="detail__desc">{hotel.description}</p>
        </div>
      </div>

      <div className="card detail__map">
        <h2>Location</h2>
        <MapView latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />
      </div>

      {popupMessage && <SuccessPopup message={popupMessage} onClose={closePopup} />}
    </article>
  );
}

export default HotelDetail;
