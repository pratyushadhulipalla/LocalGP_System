import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bar Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensure the Y-axis starts at 0
        ticks: {
          stepSize: 1, // Ensure ticks only increment by whole numbers
          callback: function(value) {
            return Number.isInteger(value) ? value : null; // Only show whole numbers
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
