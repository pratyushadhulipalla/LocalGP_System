import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AreaChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Appointments Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensures the Y-axis starts at 0
        title: {
          display: true,
          text: 'Number of Appointments', // Y-axis label
        },
        ticks: {
          stepSize: 1, // Adjust the step size if you have integer values
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date', // X-axis label
        },
      },
    },
  };

  const areaChartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: true, // This makes it an area chart
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // Adjust the color and opacity as needed
      borderColor: 'rgb(75, 192, 192)',
      pointBackgroundColor: 'rgb(75, 192, 192)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(75, 192, 192)',
    })),
  };

  return <Line data={areaChartData} options={options} />;
};

export default AreaChart;
