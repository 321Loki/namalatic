import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HotelForm from '../components/HotelForm';
import Loader from '../components/Loader';
import {
  createHotel,
  updateHotel,
  fetchHotelById,
  clearCurrent,
} from '../store/hotelSlice';

function HotelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, saving, error } = useSelector((state) => state.hotels);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchHotelById(id));
    } else {
      dispatch(clearCurrent());
    }
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (formData) => {
    setServerError('');
    try {
      if (isEdit) {
        await dispatch(updateHotel({ id, formData })).unwrap();
        navigate(`/hotels/${id}`, { state: { flash: 'Hotel updated successfully' } });
      } else {
        await dispatch(createHotel(formData)).unwrap();
        navigate('/', { state: { flash: 'Hotel added successfully' } });
      }
    } catch (err) {
      setServerError(err.message || 'Could not save the hotel');
    }
  };

  const title = isEdit ? 'Edit Hotel' : 'Add New Hotel';
  const hotelReady = current && String(current.id) === String(id);

  return (
    <section className="form-page">
      <Helmet>
        <title>{`${title} | StayFinder`}</title>
        <meta name="description" content="Add or update hotel details on StayFinder." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="page-head">
        <h1>{title}</h1>
        <Link to="/" className="btn btn-outline btn-sm">
          Back to list
        </Link>
      </div>

      {isEdit && loading && !hotelReady && <Loader text="Loading hotel..." />}

      {isEdit && !loading && !hotelReady && error && (
        <div className="alert alert-error">{error}</div>
      )}

      {(!isEdit || hotelReady) && (
        <HotelForm
          initialData={isEdit ? current : null}
          onSubmit={handleSubmit}
          saving={saving}
          serverError={serverError}
          isEdit={isEdit}
        />
      )}
    </section>
  );
}

export default HotelFormPage;
