import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, formatPrice, truncate, PLACEHOLDER_IMG } from '../utils/helpers';

function HotelCard({ hotel, onDelete }) {
  const navigate = useNavigate();

  const stop = (e) => e.stopPropagation();

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER_IMG;
  };

  return (
    <article
      className="hotel-card"
      onClick={() => navigate(`/hotels/${hotel.id}`)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          navigate(`/hotels/${hotel.id}`);
        }
      }}
      tabIndex={0}
      aria-label={`View ${hotel.title}`}
    >
      <div className="hotel-card__img">
        <img
          src={getImageUrl(hotel.image)}
          alt={`${hotel.title} - hotel photo`}
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      <div className="hotel-card__body">
        <h3 className="hotel-card__title">
          <Link to={`/hotels/${hotel.id}`} onClick={stop}>
            {hotel.title}
          </Link>
        </h3>
        <p className="hotel-card__desc">{truncate(hotel.description, 140)}</p>
        <span className="hotel-card__coords">
          Lat {Number(hotel.latitude).toFixed(4)}, Lng {Number(hotel.longitude).toFixed(4)}
        </span>
      </div>

      <div className="hotel-card__side">
        <div className="hotel-card__price">
          {formatPrice(hotel.price)}
          <small>per night</small>
        </div>
        <div className="hotel-card__actions">
          <Link
            to={`/hotels/${hotel.id}/edit`}
            className="btn btn-outline btn-sm"
            onClick={stop}
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              stop(e);
              onDelete(hotel);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
