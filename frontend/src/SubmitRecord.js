import React, { useState } from 'react';
import axios from 'axios';

const SubmitRecord = () => {
  const [formData, setFormData] = useState({
    mrnNumber: '',
    patientName: '',
    cnic: '',
    department: '',
    doctor: '',
    prescription: '',
    tests: '',
    type: '',
    amount: '',
    date: ''
  });  
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFiles = (e) => setAttachments([...e.target.files]);

  const handleSubmit = async () => {
    const data = new FormData();
    for (const key in formData) data.append(key, formData[key]);
    attachments.forEach(file => data.append('attachments', file));
    try {
      await axios.post('http://localhost:5000/api/record/submitForm', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Submission successful');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div>
      <h2>Submit Record</h2>
      <input name="mrnNumber" placeholder="MRN Number" onChange={handleChange} />
      <input name="patientName" placeholder="Patient Name" onChange={handleChange} />
      <input
        name="cnic"
        placeholder="CNIC (e.g. 12345-1234567-1)"
        pattern="\d{5}-\d{7}-\d{1}"
        title="Enter CNIC in format 12345-1234567-1"
        onChange={handleChange}
      />
      {/* { <input name="department" placeholder="Department" onChange={handleChange} /> } */}
      <select name="department" value={formData.department} onChange={handleChange} required>
        <option value="">Select Department</option>
        <option value="Radiology">Radiology</option>
        <option value="Cardiology">Cardiology</option>
        <option value="E/R">E/R</option>
        <option value="OPD">OPD</option>
      </select>

      <input name="doctor" placeholder="Doctor" onChange={handleChange} />
      <input name="prescription" placeholder="Prescription (comma-separated)" onChange={handleChange} />
      <input name="tests" placeholder="Tests (comma-separated)" onChange={handleChange} />
      <select name="type" value={formData.type} onChange={handleChange} required>
        <option value="">Select Type</option>
        <option value="General">General</option>
        <option value="SSP">SSP</option>
      </select>

      <input name="amount" placeholder="Amount" type="number" onChange={handleChange} />
      <input
        name="date"
        type="date"
        onChange={handleChange}
      />
      <input type="file" multiple onChange={handleFiles} />
      <button onClick={handleSubmit}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SubmitRecord;
