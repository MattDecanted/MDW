import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileText, Mail, TrendingUp, MessageSquare, Video, Download, Globe, Brain } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your wine education platform
          </p>
        </div>

        {/* Static Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modules</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads</p>
                <p className="text-2xl font-bold text-gray-900">234</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Course Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create and manage wine education courses, modules, and quizzes
            </p>
            <Link
              to="/admin/courses"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Courses
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                User Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              View and manage user accounts, roles, and subscriptions
            </p>
            <Link
              to="/admin/users"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Users
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Lead Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              View and export leads from the wine pairing guide downloads
            </p>
            <Link
              to="/admin/leads"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              View Leads
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Community Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage community discussions, events, and content
            </p>
            <Link
              to="/admin/community"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Community
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Media Library
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage videos, PDFs, and other downloadable content
            </p>
            <Link
              to="/admin/media"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Media
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Reports & Analytics
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Generate reports and view detailed analytics
            </p>
            <Link
              to="/admin/reports"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center mb-2"
            >
              View Reports
            </Link>
            <Link
              to="/admin/analytics"
              className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Live Analytics
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Content Items Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage multilingual content for blind tastings and short courses
            </p>
            <Link
              to="/admin/content-items"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Content Items
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Translation Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage multi-language translations for courses and content
            </p>
            <Link
              to="/admin/translations"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Translations
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Swirdle Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage daily wine word puzzles and track player engagement
            </p>
            <Link
              to="/admin/swirdle"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Manage Swirdle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;