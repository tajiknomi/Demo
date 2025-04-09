// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import SubmitRecord from './SubmitRecord';
import BulkShare from './BulkShare';
import ExecutiveSummary from './ExecutiveSummary';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/submit-record"
          element={<PrivateRoute><SubmitRecord /></PrivateRoute>}
        />
        <Route
          path="/bulk-share"
          element={<PrivateRoute><BulkShare /></PrivateRoute>}
        />
        <Route
          path="/executive-summary"
          element={<PrivateRoute><ExecutiveSummary /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
