import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTrainerMembers } from "../../lib/supabase";

const ManageMembers = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "trainer") {
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);
    loadMembers(parsedUser.id);
  }, [navigate]);

  const loadMembers = async (trainerId) => {
    try {
      const result = await getTrainerMembers(trainerId);
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((memberMapping) => {
    const matchesSearch =
      memberMapping.member?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      memberMapping.member?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || memberMapping.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Members
                </h1>
                <p className="text-gray-600">
                  Track and manage your assigned members
                </p>
              </div>
              <button
                onClick={() => navigate("/trainer/dashboard")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Members
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Your Members ({filteredMembers.length})
            </h2>
          </div>

          {filteredMembers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((memberMapping) => (
                <div
                  key={memberMapping.id}
                  className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {memberMapping.member?.full_name?.charAt(0) || "M"}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {memberMapping.member?.full_name || "Unknown Member"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {memberMapping.member?.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Member since:{" "}
                          {new Date(
                            memberMapping.member?.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium">
                            Workouts
                          </p>
                          <p className="text-lg font-bold text-blue-800">
                            {memberMapping.progress?.totalWorkouts || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium">
                            Calories
                          </p>
                          <p className="text-lg font-bold text-green-800">
                            {memberMapping.progress?.totalCalories || 0}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-medium">
                            Minutes
                          </p>
                          <p className="text-lg font-bold text-purple-800">
                            {memberMapping.progress?.totalMinutes || 0}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-orange-600 font-medium">
                            Rating
                          </p>
                          <p className="text-lg font-bold text-orange-800">
                            {memberMapping.progress?.averageRating || 0}/5
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Assigned:{" "}
                          {new Date(
                            memberMapping.assigned_at
                          ).toLocaleDateString()}
                        </p>
                        {memberMapping.progress?.lastWorkoutDate && (
                          <p className="text-sm text-gray-500">
                            Last workout:{" "}
                            {new Date(
                              memberMapping.progress.lastWorkoutDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            memberMapping.status === "active"
                              ? "bg-green-100 text-green-800"
                              : memberMapping.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {memberMapping.status}
                        </span>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-300">
                          View Progress
                        </button>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition duration-300">
                          Add Progress
                        </button>
                        <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition duration-300">
                          Create Plan
                        </button>
                      </div>
                    </div>
                  </div>

                  {memberMapping.notes && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {memberMapping.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No members found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No members have been assigned to you yet."}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {members.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Total Members
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {members.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Active Members
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {members.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                This Month
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {
                  members.filter((m) => {
                    const assignedDate = new Date(m.assigned_at);
                    const now = new Date();
                    return (
                      assignedDate.getMonth() === now.getMonth() &&
                      assignedDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ManageMembers;
