import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoomsPage from './pages/RoomsPage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-primary">
                CraftMyPlate
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Rooms
                </Link>
                <Link
                  to="/book"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Book
                </Link>
                <Link
                  to="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RoomsPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

