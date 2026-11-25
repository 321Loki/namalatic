const fs = require('fs');
const path = require('path');
const express = require('express');
const pool = require('../db');
const upload = require('../middleware/upload');
const { validateHotel, removeUploadedFile } = require('../middleware/validateHotel');

const router = express.Router();

// price is NUMERIC in postgres so pg gives string, cast to float for the frontend
const COLUMNS = 'id, title, description, image, latitude, longitude, price::float AS price, created_at';

const deleteImageFile = (imagePath) => {
  // seed data uses external urls, only delete files we stored ourselves
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const fullPath = path.join(__dirname, '..', imagePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Could not delete image file:', err.message);
    }
  });
};

const toPositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) || n < 0 ? fallback : n;
};

// GET /api/hotels?search=&minPrice=&maxPrice=&offset=0&limit=10
router.get('/', async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice } = req.query;
    const offset = toPositiveInt(req.query.offset, 0);
    let limit = toPositiveInt(req.query.limit, 10);
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const conditions = [];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }
    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      values.push(Number(minPrice));
      conditions.push(`price >= $${values.length}`);
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      values.push(Number(maxPrice));
      conditions.push(`price <= $${values.length}`);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM hotels ${whereSql}`,
      values
    );

    const dataResult = await pool.query(
      `SELECT ${COLUMNS} FROM hotels ${whereSql}
       ORDER BY id DESC
       OFFSET $${values.length + 1} LIMIT $${values.length + 2}`,
      [...values, offset, limit]
    );

    res.json({
      total: countResult.rows[0].total,
      offset,
      limit,
      data: dataResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hotels/:id  (needed for detail + edit page)
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid hotel id' });
    }

    const result = await pool.query(`SELECT ${COLUMNS} FROM hotels WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels
router.post(
  '/',
  upload.single('image'),
  validateHotel({ requireImage: true }),
  async (req, res, next) => {
    try {
      const { title, description, latitude, longitude, price } = req.body;
      const imagePath = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `INSERT INTO hotels (title, description, image, latitude, longitude, price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${COLUMNS}`,
        [title.trim(), description.trim(), imagePath, Number(latitude), Number(longitude), Number(price)]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      removeUploadedFile(req.file);
      next(err);
    }
  }
);

// PUT /api/hotels/:id
router.put(
  '/:id',
  upload.single('image'),
  validateHotel({ requireImage: false }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        removeUploadedFile(req.file);
        return res.status(400).json({ message: 'Invalid hotel id' });
      }

      const existing = await pool.query('SELECT image FROM hotels WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        removeUploadedFile(req.file);
        return res.status(404).json({ message: 'Hotel not found' });
      }

      const oldImage = existing.rows[0].image;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : oldImage;
      const { title, description, latitude, longitude, price } = req.body;

      const result = await pool.query(
        `UPDATE hotels
         SET title = $1, description = $2, image = $3, latitude = $4, longitude = $5, price = $6
         WHERE id = $7
         RETURNING ${COLUMNS}`,
        [title.trim(), description.trim(), imagePath, Number(latitude), Number(longitude), Number(price), id]
      );

      // new image uploaded, so old file is not needed anymore
      if (req.file) {
        deleteImageFile(oldImage);
      }

      res.json(result.rows[0]);
    } catch (err) {
      removeUploadedFile(req.file);
      next(err);
    }
  }
);

// DELETE /api/hotels/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid hotel id' });
    }

    const result = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING image', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    deleteImageFile(result.rows[0].image);
    res.json({ message: 'Hotel deleted successfully', id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
