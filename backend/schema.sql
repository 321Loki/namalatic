CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels (title);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
