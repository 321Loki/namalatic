import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const emptyValues = {
  title: '',
  description: '',
  latitude: '',
  longitude: '',
  price: '',
};

const validate = (values, hasImage) => {
  const errors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.length > 150) errors.title = 'Title cannot be more than 150 characters';

  if (!description) errors.description = 'Description is required';
  else if (description.length < 10) errors.description = 'Description must be at least 10 characters';

  const lat = Number(values.latitude);
  if (values.latitude === '') errors.latitude = 'Latitude is required';
  else if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.latitude = 'Latitude must be between -90 and 90';

  const lng = Number(values.longitude);
  if (values.longitude === '') errors.longitude = 'Longitude is required';
  else if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.longitude = 'Longitude must be between -180 and 180';

  const price = Number(values.price);
  if (values.price === '') errors.price = 'Price is required';
  else if (Number.isNaN(price) || price <= 0) errors.price = 'Price must be greater than 0';
  else if (price >= 100000000) errors.price = 'Price is too large';

  if (!hasImage) errors.image = 'Hotel image is required';

  return errors;
};

function Field({ label, name, error, children }) {
  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// same component is used for both add and edit
function HotelForm({ initialData, onSubmit, saving, serverError, isEdit }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [values, setValues] = useState(emptyValues);
  const [touched, setTouched] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [fileError, setFileError] = useState('');

  // fill the form when editing
  useEffect(() => {
    if (!initialData) return;
    setValues({
      title: initialData.title || '',
      description: initialData.description || '',
      latitude: String(initialData.latitude ?? ''),
      longitude: String(initialData.longitude ?? ''),
      price: String(initialData.price ?? ''),
    });
    if (initialData.image) setPreview(getImageUrl(initialData.image));
  }, [initialData]);

  // free the blob url when preview changes
  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const errors = validate(values, Boolean(preview));
  if (fileError) errors.image = fileError;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setTouched((prev) => ({ ...prev, image: true }));
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG or WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFileError('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    setFileError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ title: true, description: true, latitude: true, longitude: true, price: true, image: true });

    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('description', values.description.trim());
    formData.append('latitude', values.latitude);
    formData.append('longitude', values.longitude);
    formData.append('price', values.price);
    if (imageFile) formData.append('image', imageFile);

    onSubmit(formData);
  };

  const showError = (name) => (touched[name] ? errors[name] : '');

  return (
    <form className="hotel-form card" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <Field label="Hotel image" name="image" error={showError('image')}>
        <div className="upload">
          <div className="upload__preview">
            {preview ? (
              <img src={preview} alt="Selected hotel preview" />
            ) : (
              <span>No image selected</span>
            )}
          </div>
          <div>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              ref={fileRef}
              onChange={handleImageChange}
              hidden
            />
            <button type="button" className="btn btn-outline" onClick={() => fileRef.current.click()}>
              {preview ? 'Change image' : 'Choose image'}
            </button>
            <p className="hint">JPG, PNG or WEBP. Max 5MB.</p>
          </div>
        </div>
      </Field>

      <Field label="Title" name="title" error={showError('title')}>
        <input
          id="title"
          name="title"
          type="text"
          className="input"
          placeholder="Eg: Marina Bay Residency"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={150}
        />
      </Field>

      <Field label="Description" name="description" error={showError('description')}>
        <textarea
          id="description"
          name="description"
          rows="5"
          className="input"
          placeholder="Write something about the hotel"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Field>

      <div className="form-row">
        <Field label="Latitude" name="latitude" error={showError('latitude')}>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            className="input"
            placeholder="13.0827"
            value={values.latitude}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>

        <Field label="Longitude" name="longitude" error={showError('longitude')}>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            className="input"
            placeholder="80.2707"
            value={values.longitude}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>
      </div>

      <Field label="Price per night (INR)" name="price" error={showError('price')}>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          className="input"
          placeholder="2500"
          value={values.price}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Field>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Hotel' : 'Add Hotel'}
        </button>
      </div>
    </form>
  );
}

export default HotelForm;
