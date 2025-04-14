// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import SubmitRecord from './SubmitRecord';
import BulkShare from './BulkShare';
import ExecutiveSummary from './ExecutiveSummary';
import PrivateRoute from './PrivateRoute';
import ViewRecord from './ViewRecord';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated when visiting the home page
    axios.get('http://localhost:5000/api/user/check-auth', { withCredentials: true })
      .then(response => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    // Show loading or waiting state until the check is complete
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome</h2>
        <ul>
          <li><a href="/submit-record">Submit Record</a></li>
          <li><a href="/view-record">View Record</a></li>
          <li><a href="/executive-summary">Executive Summary</a></li>
          <li><a href="/bulk-share">Set Percentage Share</a></li>
        </ul>
      </div>
    );
  } else {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submit-record" element={<PrivateRoute><SubmitRecord /></PrivateRoute>} />
        <Route path="/bulk-share" element={<PrivateRoute><BulkShare /></PrivateRoute>} />
        <Route path="/executive-summary" element={<PrivateRoute><ExecutiveSummary /></PrivateRoute>} />
        <Route path="/view-record" element={<PrivateRoute><ViewRecord /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
