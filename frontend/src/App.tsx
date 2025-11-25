import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import SidebarLayout from './components/layout/SidebarLayout';

function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </SidebarLayout>
    </Router>
  );
}

export default App;

