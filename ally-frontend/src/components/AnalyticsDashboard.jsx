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

  // Sample data for charts
  const userActivityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Active Users',
        data: [1200, 1350, 1450, 1600],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const caseMetricsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Cases',
        data: [45, 52, 38, 60],
        backgroundColor: 'rgba(16, 185, 129, 0.8)'
      },
      {
        label: 'Resolved Cases',
        data: [38, 45, 35, 50],
        backgroundColor: 'rgba(99, 102, 241, 0.8)'
      }
    ]
  };

  const lawyerPerformanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Cases Handled',
        data: [15, 18, 22, 20],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mt-8">Analytics Dashboard</h1>
        
        {/* Filter Panel */}
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="lawyer">Lawyers</option>
            <option value="client">Clients</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,234', change: '+12%' },
          { label: 'Active Cases', value: '156', change: '+5%' },
          { label: 'Case Success Rate', value: '92%', change: '+2%' },
          { label: 'Avg Response Time', value: '2.4h', change: '-15%' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <span className={`ml-2 text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
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
          <Line data={userActivityData} options={options} />
        </div>

        {/* Case Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Case Metrics</h3>
          <Bar data={caseMetricsData} options={options} />
        </div>

        {/* Lawyer Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Lawyer Performance</h3>
          <Line data={lawyerPerformanceData} options={options} />
        </div>

        {/* Forecast Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Growth Forecast</h3>
            <select className="px-3 py-1.5 border rounded-md text-sm">
              <option value="users">Users</option>
              <option value="cases">Cases</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <Line 
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Predicted Growth',
                data: [1200, 1400, 1600, 1800, 2000, 2200],
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }}
            options={options}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
