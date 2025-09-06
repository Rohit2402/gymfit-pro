import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMemberWorkoutDetails, completeWorkout } from "../../lib/supabase";

const MemberWorkoutDetail = () => {
  const { workoutId } = useParams();
  const [user, setUser] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    caloriesBurned: "",
    durationMinutes: "",
    rating: 5,
    notes: "",
  });
  const [isCompleting, setIsCompleting] = useState(false);
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
    loadWorkoutDetails(workoutId, parsedUser.id);
  }, [workoutId, navigate]);

  const loadWorkoutDetails = async (workoutId, memberId) => {
    try {
      setLoading(true);
      const result = await getMemberWorkoutDetails(workoutId, memberId);

      if (result.success) {
        setWorkout(result.data);
      } else {
        setError(result.error || "Failed to load workout details");
      }
    } catch (error) {
      console.error("Error loading workout details:", error);
      setError("An error occurred while loading workout details");
    } finally {
      setLoading(false);
    }
  };

  const toggleExerciseComplete = (exerciseId) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const handleCompleteWorkout = () => {
    setShowCompleteModal(true);
  };

  const handleCompletionDataChange = (e) => {
    const { name, value } = e.target;
    setCompletionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitWorkoutCompletion = async () => {
    setIsCompleting(true);
    try {
      const result = await completeWorkout(workoutId, user.id, {
        trainerId: workout.trainer.id,
        workoutName: workout.name,
        caloriesBurned: parseInt(completionData.caloriesBurned) || null,
        durationMinutes: parseInt(completionData.durationMinutes) || null,
        rating: parseInt(completionData.rating),
        notes: completionData.notes,
      });

      if (result.success) {
        alert("Workout completed successfully! Great job! 🎉");
        navigate("/member/workouts");
      } else {
        setError(result.error || "Failed to complete workout");
      }
    } catch (error) {
      console.error("Error completing workout:", error);
      setError("An error occurred while completing the workout");
    } finally {
      setIsCompleting(false);
      setShowCompleteModal(false);
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

  const getCompletionPercentage = () => {
    if (!workout?.workout_exercises?.length) return 0;
    return Math.round(
      (completedExercises.size / workout.workout_exercises.length) * 100
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">Loading workout...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={() => navigate("/member/workouts")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">
              Back to Workouts
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-600 text-xl mb-4">Workout not found</div>
            <button
              onClick={() => navigate("/member/workouts")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">
              Back to Workouts
            </button>
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
                  {workout.name}
                </h1>
                <p className="text-gray-600">
                  Created by {workout.trainer.full_name}
                </p>
              </div>
              <button
                onClick={() => navigate("/member/workouts")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300">
                Back to Workouts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workout Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    workout.difficulty_level
                  )}`}>
                  {workout.difficulty_level}
                </span>
                <span className="text-sm text-gray-600">
                  {workout.category}
                </span>
              </div>
              {workout.description && (
                <p className="text-gray-700 mb-4">{workout.description}</p>
              )}
            </div>
          </div>

          {/* Workout Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {workout.duration_minutes || "Varies"}
              </div>
              <div className="text-sm text-gray-600">
                {workout.duration_minutes ? "Minutes" : "Duration"}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workout.workout_exercises?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getCompletionPercentage()}%
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {completedExercises.size} of{" "}
                {workout.workout_exercises?.length || 0} exercises
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}></div>
            </div>
          </div>

          {/* Target Muscle Groups */}
          {workout.target_muscle_groups &&
            workout.target_muscle_groups.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Target Muscle Groups:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {workout.target_muscle_groups.map((muscle, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Equipment Needed */}
          {workout.equipment_needed && workout.equipment_needed.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Equipment Needed:
              </h3>
              <div className="flex flex-wrap gap-2">
                {workout.equipment_needed.map((equipment, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Exercises
          </h2>

          {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
            <div className="space-y-4">
              {workout.workout_exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    completedExercises.has(exercise.id)
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-medium text-gray-900 mr-3">
                          {index + 1}. {exercise.exercise_name}
                        </span>
                        <button
                          onClick={() => toggleExerciseComplete(exercise.id)}
                          className={`ml-auto px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            completedExercises.has(exercise.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-orange-200"
                          }`}>
                          {completedExercises.has(exercise.id)
                            ? "✓ Done"
                            : "Mark Done"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Sets:
                          </span>
                          <span className="ml-1 text-sm text-gray-900">
                            {exercise.sets}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Reps:
                          </span>
                          <span className="ml-1 text-sm text-gray-900">
                            {exercise.reps}
                          </span>
                        </div>
                        {exercise.weight_kg && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Weight:
                            </span>
                            <span className="ml-1 text-sm text-gray-900">
                              {exercise.weight_kg}kg
                            </span>
                          </div>
                        )}
                        {exercise.rest_seconds && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Rest:
                            </span>
                            <span className="ml-1 text-sm text-gray-900">
                              {exercise.rest_seconds}s
                            </span>
                          </div>
                        )}
                      </div>

                      {exercise.instructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Instructions:</span>{" "}
                            {exercise.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No exercises found in this workout.
              </p>
            </div>
          )}
        </div>

        {/* Assignment Notes */}
        {workout.assignment?.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Trainer Notes
            </h3>
            <p className="text-blue-800">{workout.assignment.notes}</p>
          </div>
        )}

        {/* Complete Workout Button */}
        <div className="text-center">
          <button
            onClick={handleCompleteWorkout}
            disabled={completedExercises.size === 0}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition duration-300">
            Complete Workout
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Mark exercises as done to enable workout completion
          </p>
        </div>
      </div>

      {/* Complete Workout Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Complete Workout
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories Burned (optional)
                  </label>
                  <input
                    type="number"
                    name="caloriesBurned"
                    value={completionData.caloriesBurned}
                    onChange={handleCompletionDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes, optional)
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={completionData.durationMinutes}
                    onChange={handleCompletionDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5 stars)
                  </label>
                  <select
                    name="rating"
                    value={completionData.rating}
                    onChange={handleCompletionDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="2">⭐⭐ Below Average</option>
                    <option value="1">⭐ Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={completionData.notes}
                    onChange={handleCompletionDataChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="How did the workout feel? Any comments..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300">
                  Cancel
                </button>
                <button
                  onClick={submitWorkoutCompletion}
                  disabled={isCompleting}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 transition duration-300">
                  {isCompleting ? "Completing..." : "Complete Workout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MemberWorkoutDetail;
