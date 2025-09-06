import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMemberAssignedWorkouts } from "../../lib/supabase";

const MemberWorkouts = () => {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "member") {
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);
    loadMemberWorkouts(parsedUser.id);
  }, [navigate]);

  const loadMemberWorkouts = async (memberId) => {
    try {
      setLoading(true);
      const result = await getMemberAssignedWorkouts(memberId);

      if (result.success) {
        setWorkouts(result.data);
      } else {
        setError(result.error || "Failed to load workouts");
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
      setError("An error occurred while loading workouts");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "strength training":
        return "💪";
      case "cardio":
        return "🏃";
      case "hiit":
        return "⚡";
      case "yoga":
        return "🧘";
      case "crossfit":
        return "🏋️";
      default:
        return "🏃‍♂️";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">
              Loading your workouts...
            </div>
          </div>
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
                  My Workouts
                </h1>
                <p className="text-gray-600">
                  Your assigned workout plans from your trainer
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {workouts.length === 0 ? (
          /* No Workouts Assigned */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              No Workouts Assigned
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your trainer hasn't assigned any workouts to you yet. Contact your
              trainer to get started with your fitness journey!
            </p>
            <div className="space-y-3">
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition duration-300">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Update Profile
              </Link>
              <div className="text-sm text-gray-500">
                Make sure your profile is complete so your trainer can create
                personalized workouts for you.
              </div>
            </div>
          </div>
        ) : (
          /* Display Assigned Workouts */
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Assigned Workouts ({workouts.length})
              </h2>
              <p className="text-sm text-gray-600">
                Click on any workout to view details and start exercising
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 overflow-hidden">
                  {/* Workout Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {getCategoryIcon(assignment.workout.category)}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assignment.workout.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {assignment.trainer.full_name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                          assignment.workout.difficulty_level
                        )}`}>
                        {assignment.workout.difficulty_level}
                      </span>
                    </div>

                    {/* Workout Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {assignment.workout.duration_minutes
                          ? `${assignment.workout.duration_minutes} minutes`
                          : "Duration varies"}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {assignment.workout.workout_exercises?.length || 0}{" "}
                        exercises
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        {assignment.workout.category}
                      </div>
                    </div>

                    {/* Target Muscle Groups */}
                    {assignment.workout.target_muscle_groups &&
                      assignment.workout.target_muscle_groups.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Target Muscles:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {assignment.workout.target_muscle_groups
                              .slice(0, 3)
                              .map((muscle, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {muscle}
                                </span>
                              ))}
                            {assignment.workout.target_muscle_groups.length >
                              3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                +
                                {assignment.workout.target_muscle_groups
                                  .length - 3}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Assignment Info */}
                    <div className="border-t pt-4 mb-4">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          Assigned:{" "}
                          {new Date(
                            assignment.assigned_at
                          ).toLocaleDateString()}
                        </p>
                        {assignment.start_date && (
                          <p>
                            Start Date:{" "}
                            {new Date(
                              assignment.start_date
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {assignment.end_date && (
                          <p>
                            End Date:{" "}
                            {new Date(assignment.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Assignment Notes */}
                    {assignment.notes && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Trainer Notes:
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {assignment.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      to={`/member/workout/${assignment.workout.id}`}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-md transition duration-300 inline-block">
                      Start Workout
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-12 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Workout Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {workouts.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workouts.reduce(
                      (total, assignment) =>
                        total +
                        (assignment.workout.workout_exercises?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Exercises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      workouts.reduce(
                        (total, assignment) =>
                          total + (assignment.workout.duration_minutes || 0),
                        0
                      ) / workouts.length
                    ) || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg Duration (min)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {assignment.trainer?.full_name || "Your Trainer"}
                  </div>
                  <div className="text-sm text-gray-600">Assigned By</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MemberWorkouts;
