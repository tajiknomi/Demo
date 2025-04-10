import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BulkShare = () => {
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch existing departments with sharePercentage
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/department', { withCredentials: true });
        const filled = res.data.map(dep => ({
          name: dep.name || '',
          sharePercentage: dep.sharePercentage ?? 0
        }));
        setDepartments(filled);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (i, field, value) => {
    const updated = [...departments];
    if (field === 'sharePercentage') {
      let val = parseInt(value, 10);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 100) val = 100;
      updated[i][field] = val;
    } else {
      updated[i][field] = value;
    }
    setDepartments(updated);
  };

  const addDepartment = () =>
    setDepartments([...departments, { name: '', sharePercentage: 0 }]);

  const deleteDepartment = (index) => {
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
  };

  const handleSubmit = async () => {
    // Filter out empty department names before sending
    const filtered = departments.filter(d => d.name.trim() !== '');

    const total = filtered.reduce((sum, d) => sum + (parseInt(d.sharePercentage) || 0), 0);
    if (total > 100) {
      setMessage('Total percentage must not exceed 100%');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/department/bulk-share', filtered, {
        withCredentials: true
      });
      setMessage('Shares updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <h2>Set Department Share</h2>
      {departments.map((dept, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            placeholder="Department Name"
            value={dept.name}
            onChange={(e) => handleChange(i, 'name', e.target.value)}
          />
          <input
            type="number"
            placeholder="Share (%)"
            value={dept.sharePercentage}
            onChange={(e) => handleChange(i, 'sharePercentage', e.target.value)}
            min={0}
            max={100}
          />
          <button onClick={() => deleteDepartment(i)}>❌</button>
        </div>
      ))}
      <button onClick={addDepartment}>Add Department</button>
      <button onClick={handleSubmit}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BulkShare;
