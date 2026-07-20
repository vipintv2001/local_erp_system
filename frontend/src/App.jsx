import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import TotalFees from './pages/TotalFees';
import AddPayment from './pages/AddPayment';
import PaymentHistory from './pages/PaymentHistory';
import Courses from './pages/Courses';
import Layout from './components/Layout';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('auth') === 'true'
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="courses" element={<Courses />} />
          <Route path="fees" element={<TotalFees />} />
          <Route path="payments/add" element={<AddPayment />} />
          <Route path="payments/history" element={<PaymentHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
