const fs = require('fs');

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === '';

const removeUploadedFile = (file) => {
  if (file && file.path) {
    fs.unlink(file.path, () => {});
  }
};

// requireImage = true for POST, false for PUT (old image is kept if no new one)
const validateHotel = ({ requireImage }) => (req, res, next) => {
  const { title, description, latitude, longitude, price } = req.body;
  const errors = {};

  if (isBlank(title)) {
    errors.title = 'Title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (title.trim().length > 150) {
    errors.title = 'Title cannot be more than 150 characters';
  }

  if (isBlank(description)) {
    errors.description = 'Description is required';
  } else if (description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (isBlank(latitude)) {
    errors.latitude = 'Latitude is required';
  } else if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
    errors.latitude = 'Latitude must be a number between -90 and 90';
  }

  if (isBlank(longitude)) {
    errors.longitude = 'Longitude is required';
  } else if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
    errors.longitude = 'Longitude must be a number between -180 and 180';
  }

  if (isBlank(price)) {
    errors.price = 'Price is required';
  } else if (isNaN(Number(price)) || Number(price) <= 0) {
    errors.price = 'Price must be a number greater than 0';
  } else if (Number(price) >= 100000000) {
    errors.price = 'Price is too large';
  }

  if (requireImage && !req.file) {
    errors.image = 'Image is required';
  }

  if (Object.keys(errors).length > 0) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validateHotel, removeUploadedFile };
