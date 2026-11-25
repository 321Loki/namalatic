import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelList from './pages/HotelList';
import HotelFormPage from './pages/HotelFormPage';
import HotelDetail from './pages/HotelDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container main">
        <Routes>
          <Route path="/" element={<HotelList />} />
          <Route path="/hotels/new" element={<HotelFormPage />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">NestQuest &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}

export default App;
