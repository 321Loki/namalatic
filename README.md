# StayFinder – Hotel Management App

StayFinder is a small hotel listing and management application. It lets a user browse hotels, search by name, filter by price, view a hotel's location, and add, edit or delete hotel records.

I kept the frontend and backend separate so that each part can be run and worked on independently.

## Technologies

- React and Vite – user interface
- React Router – page navigation
- Redux Toolkit – hotel data and loading states
- Axios – requests from the frontend to the API
- Node.js and Express – backend API
- PostgreSQL – hotel records
- Multer – hotel image uploads
- React Leaflet and OpenStreetMap – hotel map

## What the app can do

- Show a paginated list of hotels
- Search hotels by title
- Filter the list using minimum and maximum prices
- Add a hotel with an image, description, price and map coordinates
- Edit hotel details and optionally replace its image
- Delete a hotel after confirmation
- Open a detail page with the hotel's location on a map
- Ask the browser for the user's location and show the straight-line distance to the hotel
- Show validation messages for incorrect form values

## Project folders

```text
hotel-app/
├── backend/
│   ├── middleware/       # Image upload and request validation
│   ├── routes/           # Hotel API endpoints
│   ├── scripts/          # SQL setup helper
│   ├── uploads/          # Images uploaded through the app
│   ├── db.js             # PostgreSQL connection
│   ├── schema.sql        # Database table
│   ├── seed.sql          # Sample hotel records
│   └── server.js         # Express application
│
└── frontend/
    └── src/
        ├── api/          # Axios configuration
        ├── components/   # Reusable interface components
        ├── pages/        # Hotel list, form and detail pages
        ├── store/        # Redux store and hotel actions
        ├── styles/       # Application styles
        └── utils/        # Shared helper functions
```

## Run the project locally

### Requirements

Install Node.js, npm and PostgreSQL before starting. Create a PostgreSQL database named `hotel_db` (or use another name and update the environment file).

### 1. Start the backend

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the database username, password and database name to match your PostgreSQL setup.

Create the table and, if you want sample records, insert the sample data:

```bash
npm run db:init
npm run db:seed
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. You can check it at `http://localhost:5000/api/health`.

### 2. Start the frontend

Open another terminal in the frontend folder:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`. The default API address is:

```env
VITE_API_URL=http://localhost:5000
```

Start Vite:

```bash
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check whether the API is running |
| GET | `/api/hotels` | Get hotels; supports `search`, `minPrice`, `maxPrice`, `offset` and `limit` |
| GET | `/api/hotels/:id` | Get one hotel |
| POST | `/api/hotels` | Add a hotel using `multipart/form-data` |
| PUT | `/api/hotels/:id` | Update a hotel; a new image is optional |
| DELETE | `/api/hotels/:id` | Delete a hotel and its uploaded image |

For create and update requests, the form fields are `title`, `description`, `latitude`, `longitude` and `price`. The image field is named `image`.

## How the main flow works

1. The hotel list page dispatches a Redux action when the page or filters change.
2. The Redux action calls the Express API through the shared Axios instance.
3. Express reads or updates hotel records in PostgreSQL.
4. When an image is uploaded, Multer saves it in `backend/uploads` and the database stores its relative path.
5. The frontend receives the API response and Redux updates the displayed hotel data.

## Notes

- The app uses INR when displaying hotel prices.
- New hotel records require an image. When editing, the existing image can be kept.
- Uploaded images are limited to 5 MB and JPG, PNG or WEBP formats.
- The distance shown on the map is a straight-line estimate, not a driving distance.
- Browser location access works only when the user grants permission. Browsers generally require HTTPS or localhost for geolocation.
- The sample records use external placeholder image URLs. They are only for local testing.
