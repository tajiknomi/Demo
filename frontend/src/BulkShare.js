import React, { useState } from 'react';
import axios from 'axios';

const BulkShare = () => {
  const [departments, setDepartments] = useState([{ name: '', sharePercentage: 0 }]);
  const [message, setMessage] = useState('');

  const handleChange = (i, field, value) => {
    const updated = [...departments];
    updated[i][field] = field === 'sharePercentage' ? parseFloat(value) : value;
    setDepartments(updated);
  };

  const addDepartment = () => setDepartments([...departments, { name: '', sharePercentage: 0 }]);

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/department/bulk-share', departments, { withCredentials: true });
      setMessage('Shares updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <h2>Set Department Share</h2>
      {departments.map((dept, i) => (
        <div key={i}>
          <input placeholder="Department Name" value={dept.name} onChange={(e) => handleChange(i, 'name', e.target.value)} />
          <input placeholder="Share (%)" type="number" value={dept.sharePercentage} onChange={(e) => handleChange(i, 'sharePercentage', e.target.value)} />
        </div>
      ))}
      <button onClick={addDepartment}>Add Department</button>
      <button onClick={handleSubmit}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BulkShare;
