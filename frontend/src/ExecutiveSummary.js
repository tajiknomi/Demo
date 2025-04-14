import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from 'react-google-charts';

const ExecutiveSummary = () => {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/department/executive-summary', {
          withCredentials: true
        });
        setSummary(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load summary');
      }
    };
    fetchSummary();
  }, []);

  if (!summary) return <p>{message || 'Loading summary...'}</p>;

  const pieChartData = [
    ['Department', 'Share Amount'],
    ...summary.departments.map(dep => [dep.name, dep.shareAmount]),
  ];

  const pieChartOptions = {
    title: 'Department Share Distribution',
    pieHole: 0.1, // Will be ignored since is3D is true
    is3D: true,
    pieStartAngle: 0,
    sliceVisibilityThreshold: 0.01, // hides slices under 1%
    legend: {
      position: 'bottom',
      alignment: 'center',
      textStyle: {
        color: '#233238',
        fontSize: 14,
      },
    },
    colors: ['#8AD1C2', '#9F8AD1', '#D18A99', '#BCD18A', '#D1C28A', '#D18AAD', '#8AB5D1'],
  };

  return (
    <div>
      <h2>Executive Summary</h2>

      <p><strong>Total Collected:</strong> {summary.totalCollected}</p>
      <p><strong>Remaining Amount:</strong> {summary.remainingAmount}</p>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Department</th>
            <th>Collected Amount</th>
            <th>Share Percentage</th>
            <th>Share Amount</th>
          </tr>
        </thead>
        <tbody>
          {summary.departments.map((dep, index) => (
            <tr key={index}>
              <td>{dep.name}</td>
              <td>{dep.collectedAmount}</td>
              <td>{dep.sharePercentage}%</td>
              <td>{dep.shareAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '40px' }}>
        <Chart
          chartType="PieChart"
          width="100%"
          height="400px"
          data={pieChartData}
          options={pieChartOptions}
        />
      </div>
    </div>
  );
};

export default ExecutiveSummary;
