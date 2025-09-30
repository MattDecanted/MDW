import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, BookOpen, TrendingUp, DollarSign, FileText, Filter, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface ReportData {
  userMetrics: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeSubscribers: number;
    churnRate: number;
    conversionRate: number;
  };
  courseMetrics: {
    totalCourses: number;
    totalModules: number;
    avgCompletionRate: number;
    mostPopularCourse: string;
    leastPopularCourse: string;
  };
  revenueMetrics: {
    monthlyRevenue: number;
    yearlyRevenue: number;
    avgRevenuePerUser: number;
    subscriptionGrowth: number;
  };
  engagementMetrics: {
    avgSessionDuration: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    contentViews: number;
  };
  timeSeriesData: {
    userGrowth: { date: string; users: number; subscribers: number }[];
    revenue: { date: string; amount: number }[];
    engagement: { date: string; sessions: number; duration: number }[];
  };
}

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    generateReportData();
  }, [dateRange]);

  const generateReportData = () => {
    setLoading(true);
    
    // Simulate API call with realistic data
    setTimeout(() => {
      const mockData: ReportData = {
        userMetrics: {
          totalUsers: 1247,
          newUsersThisMonth: 89,
          activeSubscribers: 456,
          churnRate: 3.2,
          conversionRate: 12.8,
        },
        courseMetrics: {
          totalCourses: 12,
          totalModules: 67,
          avgCompletionRate: 74.5,
          mostPopularCourse: 'Wine Fundamentals',
          leastPopularCourse: 'Advanced Sommelier Techniques',
        },
        revenueMetrics: {
          monthlyRevenue: 22750,
          yearlyRevenue: 245000,
          avgRevenuePerUser: 49.99,
          subscriptionGrowth: 15.3,
        },
        engagementMetrics: {
          avgSessionDuration: 28.5,
          dailyActiveUsers: 234,
          weeklyActiveUsers: 567,
          contentViews: 3456,
        },
        timeSeriesData: {
          userGrowth: [
            { date: '2024-10', users: 1050, subscribers: 320 },
            { date: '2024-11', users: 1134, subscribers: 378 },
            { date: '2024-12', users: 1198, subscribers: 421 },
            { date: '2025-01', users: 1247, subscribers: 456 },
          ],
          revenue: [
            { date: '2024-10', amount: 18500 },
            { date: '2024-11', amount: 20100 },
            { date: '2024-12', amount: 21800 },
            { date: '2025-01', amount: 22750 },
          ],
          engagement: [
            { date: '2024-10', sessions: 2340, duration: 25.2 },
            { date: '2024-11', sessions: 2567, duration: 26.8 },
            { date: '2024-12', sessions: 2789, duration: 27.9 },
            { date: '2025-01', sessions: 2934, duration: 28.5 },
          ],
        },
      };
      
      setReportData(mockData);
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (!reportData) return;

    if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Users', reportData.userMetrics.totalUsers],
        ['Active Subscribers', reportData.userMetrics.activeSubscribers],
        ['Monthly Revenue', `$${reportData.revenueMetrics.monthlyRevenue.toLocaleString()}`],
        ['Avg Completion Rate', `${reportData.courseMetrics.avgCompletionRate}%`],
        ['Churn Rate', `${reportData.userMetrics.churnRate}%`],
        ['Conversion Rate', `${reportData.userMetrics.conversionRate}%`],
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matt-decanted-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('PDF export would be implemented with a PDF library like jsPDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive business intelligence and performance metrics
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => generateReportData()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="users">User Analytics</option>
                <option value="courses">Course Performance</option>
                <option value="revenue">Revenue Analysis</option>
                <option value="engagement">Engagement Metrics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportReport('csv')}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.userMetrics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{reportData?.userMetrics.newUsersThisMonth} this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${reportData?.revenueMetrics.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{reportData?.revenueMetrics.subscriptionGrowth}% growth</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.userMetrics.activeSubscribers}</p>
                <p className="text-sm text-blue-600">{reportData?.userMetrics.conversionRate}% conversion rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Completion</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.courseMetrics.avgCompletionRate}%</p>
                <p className="text-sm text-purple-600">Average across all courses</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reportData?.timeSeriesData.userGrowth.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.date}</span>
                  <div className="flex items-center space-x-4 flex-1 mx-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Total: {data.users}</span>
                        <span>Subscribers: {data.subscribers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full relative"
                          style={{ width: `${(data.users / 1500) * 100}%` }}
                        >
                          <div
                            className="bg-amber-600 h-2 rounded-full absolute top-0 left-0"
                            style={{ width: `${(data.subscribers / data.users) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reportData?.timeSeriesData.revenue.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.date}</span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: `${(data.amount / 25000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${data.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
            <div className="space-y-3">
              {[
                { title: 'Wine Fundamentals - Module 1', views: 1234, completion: 89 },
                { title: 'French Wine Regions', views: 987, completion: 76 },
                { title: 'Food & Wine Pairing Guide', views: 856, completion: 82 },
                { title: 'Tasting Techniques', views: 743, completion: 71 },
                { title: 'Wine Storage & Service', views: 692, completion: 68 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">{item.views} views</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{item.completion}% completion</span>
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Acquisition Sources */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Acquisition Sources</h3>
            <div className="space-y-3">
              {[
                { source: 'Wine Pairing Guide (Lead Magnet)', users: 456, percentage: 36.5 },
                { source: 'Organic Search', users: 312, percentage: 25.0 },
                { source: 'Social Media', users: 234, percentage: 18.8 },
                { source: 'Direct Traffic', users: 156, percentage: 12.5 },
                { source: 'Referrals', users: 89, percentage: 7.2 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{item.source}</h4>
                    <span className="text-xs text-gray-500">{item.users} users ({item.percentage}%)</span>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Analysis */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Free Users</h4>
              <p className="text-2xl font-bold text-gray-900">791</p>
              <p className="text-sm text-gray-500">63.4% of total users</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Basic Subscribers</h4>
              <p className="text-2xl font-bold text-blue-900">289</p>
              <p className="text-sm text-blue-600">23.2% of total users</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Premium Subscribers</h4>
              <p className="text-2xl font-bold text-purple-900">167</p>
              <p className="text-sm text-purple-600">13.4% of total users</p>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">🎯 Key Achievements</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Course completion rate increased by 12% this month</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Premium subscription conversions up 18%</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Average session duration increased to 28.5 minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Lead magnet conversion rate at 24.3%</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">⚠️ Areas for Improvement</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Churn rate slightly increased to 3.2%</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">"Advanced Sommelier" course has low engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Mobile completion rates 15% lower than desktop</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">Email open rates could be improved (18.5%)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;