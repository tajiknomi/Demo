import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExecutiveSummary = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/department/executive-summary', { withCredentials: true })
      .then(res => setDepartments(res.data.departments))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Executive Summary</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Collected Amount</th>
            <th>Share Percentage</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, i) => (
            <tr key={i}>
              <td>{dept.name}</td>
              <td>{dept.collectedAmount}</td>
              <td>{dept.sharePercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExecutiveSummary;
