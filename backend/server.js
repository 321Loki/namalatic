require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const hotelRoutes = require('./routes/hotels');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// uploaded images are served from here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/hotels', hotelRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// error handler - multer errors, upload filter errors and unknown errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image size should be less than 5MB' : err.message;
    return res.status(400).json({ message, errors: { image: message } });
  }

  if (err.status === 400) {
    return res.status(400).json({
      message: err.message,
      errors: err.field ? { [err.field]: err.message } : undefined,
    });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
