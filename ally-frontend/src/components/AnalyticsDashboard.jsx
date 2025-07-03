import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [filterRole, setFilterRole] = useState('all');

  // Stats data
  const statsCards = [
    { label: 'Total Users', value: '99.99', change: '+12%', isPositive: true },
    { label: 'Active Cases', value: '99.99', change: '+12%', isPositive: true },
    { label: 'Cases Success Rate', value: '99.99%', change: '+12%', isPositive: true },
    { label: 'Avg Response Time', value: '2.4H', change: '-6%', isPositive: false },
  ];

  // Chart configurations
  const userActivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Active Users',
        data: [600, 1000, 800, 850],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const caseMetricsData = {
    labels: ['Week 1', 'Week 2', 'Week 3'],
    datasets: [
      {
        label: 'New Cases',
        data: [1200, 1200, 1200],
        backgroundColor: 'rgb(16, 185, 129)',
      },
      {
        label: 'Resolved Cases',
        data: [950, 950, 950],
        backgroundColor: 'rgb(99, 102, 241)',
      }
    ]
  };

  const lawyerPerformanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Cases Handled',
        data: [600, 1000, 650, 800],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const growthForecastData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Predicted Growth',
        data: [200, 600, 1000, 1400],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <div className="flex gap-3">
          <div className="relative">
            <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2">
              Last 30 Days
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2">
              All Roles
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <span className={`ml-2 text-sm font-medium flex items-center ${
                stat.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.isPositive ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Activity Trend</h3>
          <div className="h-[300px]">
            <Line data={userActivityData} options={chartOptions} />
          </div>
        </div>

        {/* Case Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Case Metrics</h3>
          <div className="h-[300px]">
            <Bar data={caseMetricsData} options={chartOptions} />
          </div>
        </div>

        {/* Lawyer Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Lawyer Performance</h3>
          <div className="h-[300px]">
            <Line data={lawyerPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Growth Forecast */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Growth Forecast</h3>
            <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2">
              Users
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[300px]">
            <Line data={growthForecastData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
