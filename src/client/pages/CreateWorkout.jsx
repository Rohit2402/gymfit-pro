import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  createWorkout,
  getTrainerMembersForAssignment,
  assignWorkoutToMembers,
} from "../../lib/supabase";

const CreateWorkout = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });
  const [createdWorkout, setCreatedWorkout] = useState(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const navigate = useNavigate();

  const [workoutData, setWorkoutData] = useState({
    name: "",
    description: "",
    category: "",
    difficultyLevel: "",
    durationMinutes: "",
    targetMuscleGroups: [],
    equipmentNeeded: [],
    isPublic: false,
    exercises: [],
  });

  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
    restSeconds: "",
    instructions: "",
  });

  const categories = [
    "Strength Training",
    "Cardio",
    "HIIT",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Bodyweight",
    "Powerlifting",
    "Calisthenics",
    "Functional Training",
  ];

  const muscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Legs",
    "Glutes",
    "Core",
    "Calves",
    "Forearms",
    "Full Body",
  ];

  const equipment = [
    "Dumbbells",
    "Barbell",
    "Kettlebell",
    "Resistance Bands",
    "Pull-up Bar",
    "Bench",
    "Cable Machine",
    "Treadmill",
    "Rowing Machine",
    "No Equipment",
  ];

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

    // Fetch trainer's members for assignment
    fetchTrainerMembers(parsedUser.id);
  }, [navigate]);

  const fetchTrainerMembers = async (trainerId) => {
    try {
      const result = await getTrainerMembersForAssignment(trainerId);
      if (result.success) {
        setMembers(result.data);
      } else {
        console.error("Failed to fetch members:", result.error);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkoutData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (field, value) => {
    setWorkoutData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addExercise = () => {
    if (
      !currentExercise.name ||
      !currentExercise.sets ||
      !currentExercise.reps
    ) {
      setError("Please fill in exercise name, sets, and reps");
      return;
    }

    setWorkoutData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { ...currentExercise }],
    }));

    setCurrentExercise({
      name: "",
      sets: "",
      reps: "",
      weight: "",
      restSeconds: "",
      instructions: "",
    });
    setError("");
  };

  const removeExercise = (index) => {
    setWorkoutData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const moveExercise = (index, direction) => {
    const newExercises = [...workoutData.exercises];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newExercises.length) {
      [newExercises[index], newExercises[newIndex]] = [
        newExercises[newIndex],
        newExercises[index],
      ];
      setWorkoutData((prev) => ({ ...prev, exercises: newExercises }));
    }
  };

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAssignmentDataChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (
      !workoutData.name ||
      !workoutData.category ||
      !workoutData.difficultyLevel
    ) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (workoutData.exercises.length === 0) {
      setError("Please add at least one exercise");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createWorkout({
        ...workoutData,
        trainerId: user.id,
        durationMinutes: parseInt(workoutData.durationMinutes) || null,
      });

      if (result.success) {
        setCreatedWorkout(result.data);
        setShowAssignment(true);
        setError("");
      } else {
        setError(result.error || "Failed to create workout");
      }
    } catch (error) {
      console.error("Create workout error:", error);
      setError("An error occurred while creating the workout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignWorkout = async () => {
    if (selectedMembers.length === 0) {
      setError("Please select at least one member to assign the workout");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await assignWorkoutToMembers(
        createdWorkout.id,
        selectedMembers,
        user.id,
        assignmentData
      );

      if (result.success) {
        alert(
          `Workout "${createdWorkout.name}" successfully assigned to ${selectedMembers.length} member(s)!`
        );
        navigate("/trainer/dashboard");
      } else {
        setError(result.error || "Failed to assign workout");
      }
    } catch (error) {
      console.error("Assign workout error:", error);
      setError("An error occurred while assigning the workout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAssignment = () => {
    alert(`Workout "${createdWorkout.name}" created successfully!`);
    navigate("/trainer/dashboard");
  };

  if (!user) {
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
                  Create New Workout
                </h1>
                <p className="text-gray-600">
                  Design a custom workout for your members
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={workoutData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Upper Body Strength"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={workoutData.durationMinutes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 45"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={workoutData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  name="difficultyLevel"
                  value={workoutData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required>
                  <option value="">Select Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={workoutData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the workout goals and benefits..."
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={workoutData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Make this workout public (visible to all trainers)
                </label>
              </div>
            </div>
          </div>

          {/* Target Muscle Groups */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Target Muscle Groups
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {muscleGroups.map((muscle) => (
                <label key={muscle} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={workoutData.targetMuscleGroups.includes(muscle)}
                    onChange={() =>
                      handleArrayChange("targetMuscleGroups", muscle)
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{muscle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment Needed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Equipment Needed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {equipment.map((item) => (
                <label key={item} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={workoutData.equipmentNeeded.includes(item)}
                    onChange={() => handleArrayChange("equipmentNeeded", item)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Exercise */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Add Exercises
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentExercise.name}
                  onChange={handleExerciseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Push-ups"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sets *
                </label>
                <input
                  type="number"
                  name="sets"
                  value={currentExercise.sets}
                  onChange={handleExerciseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="3"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reps *
                </label>
                <input
                  type="text"
                  name="reps"
                  value={currentExercise.reps}
                  onChange={handleExerciseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="12 or 10-15 or 30 sec"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={currentExercise.weight}
                  onChange={handleExerciseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Optional"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rest (seconds)
                </label>
                <input
                  type="number"
                  name="restSeconds"
                  value={currentExercise.restSeconds}
                  onChange={handleExerciseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition duration-300">
                  Add Exercise
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={currentExercise.instructions}
                onChange={handleExerciseChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Special instructions for this exercise..."
              />
            </div>
          </div>

          {/* Exercise List */}
          {workoutData.exercises.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Workout Exercises ({workoutData.exercises.length})
              </h2>

              <div className="space-y-4">
                {workoutData.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {exercise.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight && ` @ ${exercise.weight}kg`}
                          {exercise.restSeconds &&
                            ` • Rest: ${exercise.restSeconds}s`}
                        </p>
                        {exercise.instructions && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            {exercise.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "down")}
                          disabled={index === workoutData.exercises.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="p-1 text-red-400 hover:text-red-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Section - Show after workout creation */}
          {showAssignment && createdWorkout && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="h-6 w-6 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-green-900">
                  Workout "{createdWorkout.name}" Created Successfully!
                </h2>
              </div>

              <p className="text-green-800 mb-6">
                Now you can assign this workout to your members. Select the
                members you want to assign this workout to:
              </p>

              {/* Member Selection */}
              <div className="bg-white rounded-lg border border-green-200 p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Members ({members.length} available)
                </h3>

                {members.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {members.map((memberMapping) => (
                      <label
                        key={memberMapping.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(
                            memberMapping.member.id
                          )}
                          onChange={() =>
                            handleMemberSelection(memberMapping.member.id)
                          }
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {memberMapping.member.full_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {memberMapping.member.email}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                memberMapping.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                              {memberMapping.status}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No members assigned
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any members assigned to you yet.
                    </p>
                  </div>
                )}

                {selectedMembers.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>{selectedMembers.length}</strong> member(s)
                      selected for assignment
                    </p>
                  </div>
                )}
              </div>

              {/* Assignment Details */}
              <div className="bg-white rounded-lg border border-green-200 p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assignment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={assignmentData.startDate}
                      onChange={handleAssignmentDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={assignmentData.endDate}
                      onChange={handleAssignmentDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min={assignmentData.startDate}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={assignmentData.notes}
                    onChange={handleAssignmentDataChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Add any special instructions or notes for this workout assignment..."
                  />
                </div>
              </div>

              {/* Assignment Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleSkipAssignment}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300">
                  Skip Assignment
                </button>
                <button
                  type="button"
                  onClick={handleAssignWorkout}
                  disabled={isLoading || selectedMembers.length === 0}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </div>
                  ) : (
                    `Assign to ${selectedMembers.length} Member(s)`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

          {/* Submit Button - Hide when showing assignment */}
          {!showAssignment && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/trainer/dashboard")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  "Create Workout"
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateWorkout;
