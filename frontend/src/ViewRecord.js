import React, { useState } from 'react';
import axios from 'axios';

const ViewRecord = () => {
  const [mrnNumber, setMrnNumber] = useState('');
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecord(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/record/view',
        { mrnNumber },
        { withCredentials: true }
      );
      if (response.data.record) {
        setRecord(response.data.record);
      } else {
        setError('Record not found!');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while fetching the record.');
      }
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/record${fileUrl}`, {
        responseType: 'blob',
        withCredentials: true,
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the file. Please make sure you are authenticated.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>View Record</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter MRN Number"
          value={mrnNumber}
          onChange={(e) => setMrnNumber(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {record && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>MRN Number:</strong> {record.mrnNumber}</p>
          <p><strong>Patient Name:</strong> {record.patientName}</p>
          <p><strong>CNIC:</strong> {record.cnic}</p>
          <p><strong>Department:</strong> {record.department}</p>
          <p><strong>Doctor:</strong> {record.doctor}</p>
          <p><strong>Prescription:</strong> {record.prescription}</p>
          <p><strong>Tests:</strong> {record.tests || 'N/A'}</p>
          <p><strong>Type:</strong> {record.type}</p>
          <p><strong>Amount:</strong> {record.amount?.$numberDecimal || record.amount}</p>
          <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>

          {record.attachments && record.attachments.length > 0 && (
            <div>
              <h3>Attachments:</h3>
              <ul>
                {record.attachments.map((att, index) => {
                  const urlParts = att.url.split('/');
                  const lastPart = urlParts[urlParts.length - 1]; // filename.ext
                  const ext = lastPart.includes('.') ? lastPart.split('.').pop() : 'file';
                  const fileName = `${index + 1}.${ext}`;

                  return (
                    <li key={index}>
                      <button onClick={() => handleDownload(att.url, fileName)}>
                        Download Attachment {fileName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewRecord;
