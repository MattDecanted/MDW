import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Download, Calendar, Target } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  courseEngagement: { course: string; completionRate: number; avgTime: number }[];
  popularContent: { title: string; views: number; type: string }[];
  subscriptionMetrics: { active: number; churned: number; newThisMonth: number };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    // Mock data for now - replace with actual API calls
    setTimeout(() => {
      setAnalytics({
        userGrowth: [
          { month: 'Oct', users: 45 },
          { month: 'Nov', users: 67 },
          { month: 'Dec', users: 89 },
          { month: 'Jan', users: 127 }
        ],
        courseEngagement: [
          { course: 'Wine Basics 101', completionRate: 78, avgTime: 45 },
          { course: 'French Wine Regions', completionRate: 65, avgTime: 62 },
          { course: 'Food & Wine Pairing', completionRate: 82, avgTime: 38 }
        ],
        popularContent: [
          { title: 'Introduction to Wine Tasting', views: 234, type: 'video' },
          { title: 'Wine Pairing Guide', views: 189, type: 'pdf' },
          { title: 'Burgundy Deep Dive', views: 156, type: 'video' }
        ],
        subscriptionMetrics: {
          active: 89,
          churned: 12,
          newThisMonth: 23
        }
      });
      setLoading(false);
    }, 1000);
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
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track engagement, user growth, and content performance
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.subscriptionMetrics.active}</p>
                <p className="text-sm text-green-600">+{analytics?.subscriptionMetrics.newThisMonth} this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Completion</p>
                <p className="text-3xl font-bold text-gray-900">75%</p>
                <p className="text-sm text-blue-600">Average across all courses</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-purple-600">Content views this month</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-3xl font-bold text-gray-900">456</p>
                <p className="text-sm text-amber-600">PDF downloads this month</p>
              </div>
              <Download className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-3">
              {analytics?.userGrowth.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(data.users / 150) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{data.users}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Engagement */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Engagement</h3>
            <div className="space-y-4">
              {analytics?.courseEngagement.map((course, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{course.course}</span>
                    <span className="text-sm text-gray-600">{course.completionRate}% completion</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Avg. time: {course.avgTime} minutes</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Content</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Content</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.popularContent.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{item.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{item.views}</td>
                    <td className="py-3 px-4">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (item.views / 250) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;