import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WorkoutCard from "../components/WorkoutCard";

// Sample workout data - In production, this would come from your database
const workoutData = [
  {
    id: 1,
    name: "Push Day Power",
    description: "Build upper body strength with compound pushing movements",
    duration: 45,
    difficulty: "Intermediate",
    category: "Strength",
    muscleGroup: "Chest",
    image: "/api/placeholder/300/200",
    equipment: ["Barbell", "Dumbbells", "Bench"],
    exercises: ["Bench Press", "Overhead Press", "Push-ups", "Dips"],
  },
  {
    id: 2,
    name: "HIIT Cardio Blast",
    description: "High-intensity interval training for maximum calorie burn",
    duration: 30,
    difficulty: "Advanced",
    category: "Cardio",
    muscleGroup: "Full Body",
    image: "/api/placeholder/300/200",
    equipment: ["None"],
    exercises: ["Burpees", "Mountain Climbers", "Jump Squats", "High Knees"],
  },
  {
    id: 3,
    name: "Leg Day Destroyer",
    description: "Complete lower body workout targeting all leg muscles",
    duration: 60,
    difficulty: "Intermediate",
    category: "Strength",
    muscleGroup: "Legs",
    image: "/api/placeholder/300/200",
    equipment: ["Barbell", "Dumbbells", "Leg Press"],
    exercises: ["Squats", "Deadlifts", "Lunges", "Calf Raises"],
  },
  {
    id: 4,
    name: "Morning Yoga Flow",
    description: "Gentle yoga sequence to start your day with energy",
    duration: 25,
    difficulty: "Beginner",
    category: "Yoga",
    muscleGroup: "Full Body",
    image: "/api/placeholder/300/200",
    equipment: ["Yoga Mat"],
    exercises: [
      "Sun Salutation",
      "Warrior Pose",
      "Downward Dog",
      "Child's Pose",
    ],
  },
  {
    id: 5,
    name: "Core Crusher",
    description: "Intense core workout to build a strong midsection",
    duration: 20,
    difficulty: "Intermediate",
    category: "Strength",
    muscleGroup: "Core",
    image: "/api/placeholder/300/200",
    equipment: ["None"],
    exercises: ["Plank", "Russian Twists", "Bicycle Crunches", "Dead Bug"],
  },
  {
    id: 6,
    name: "CrossFit WOD",
    description: "Workout of the day combining strength and cardio",
    duration: 40,
    difficulty: "Advanced",
    category: "CrossFit",
    muscleGroup: "Full Body",
    image: "/api/placeholder/300/200",
    equipment: ["Barbell", "Kettlebell", "Pull-up Bar"],
    exercises: ["Thrusters", "Pull-ups", "Box Jumps", "Kettlebell Swings"],
  },
  {
    id: 7,
    name: "Back & Biceps",
    description: "Pull-focused workout for a strong back and bigger biceps",
    duration: 50,
    difficulty: "Intermediate",
    category: "Strength",
    muscleGroup: "Back",
    image: "/api/placeholder/300/200",
    equipment: ["Barbell", "Dumbbells", "Pull-up Bar"],
    exercises: ["Pull-ups", "Rows", "Lat Pulldowns", "Bicep Curls"],
  },
  {
    id: 8,
    name: "Beginner Full Body",
    description: "Perfect starter workout hitting all major muscle groups",
    duration: 35,
    difficulty: "Beginner",
    category: "Strength",
    muscleGroup: "Full Body",
    image: "/api/placeholder/300/200",
    equipment: ["Dumbbells"],
    exercises: ["Goblet Squats", "Push-ups", "Dumbbell Rows", "Planks"],
  },
];

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState(workoutData);
  const [filteredWorkouts, setFilteredWorkouts] = useState(workoutData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const workoutsPerPage = 6;

  // Get unique values for filter options
  const categories = ["All", ...new Set(workoutData.map((w) => w.category))];
  const muscleGroups = [
    "All",
    ...new Set(workoutData.map((w) => w.muscleGroup)),
  ];
  const difficulties = [
    "All",
    ...new Set(workoutData.map((w) => w.difficulty)),
  ];

  // Filter workouts based on search and filters
  useEffect(() => {
    let filtered = workouts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (workout) =>
          workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          workout.exercises.some((exercise) =>
            exercise.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (workout) => workout.category === selectedCategory
      );
    }

    // Muscle group filter
    if (selectedMuscleGroup !== "All") {
      filtered = filtered.filter(
        (workout) => workout.muscleGroup === selectedMuscleGroup
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(
        (workout) => workout.difficulty === selectedDifficulty
      );
    }

    setFilteredWorkouts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    searchTerm,
    selectedCategory,
    selectedMuscleGroup,
    selectedDifficulty,
    workouts,
  ]);

  // Pagination logic
  const indexOfLastWorkout = currentPage * workoutsPerPage;
  const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
  const currentWorkouts = filteredWorkouts.slice(
    indexOfFirstWorkout,
    indexOfLastWorkout
  );
  const totalPages = Math.ceil(filteredWorkouts.length / workoutsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedMuscleGroup("All");
    setSelectedDifficulty("All");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Workouts
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the right workout for your fitness goals. From strength
              training to cardio, we have something for every fitness level.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Muscle Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Muscle Group
                  </label>
                  <select
                    value={selectedMuscleGroup}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition duration-300">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-orange-600 hover:text-orange-800">
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="ml-2 text-blue-600 hover:text-blue-800">
                    ×
                  </button>
                </span>
              )}
              {selectedMuscleGroup !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Muscle: {selectedMuscleGroup}
                  <button
                    onClick={() => setSelectedMuscleGroup("All")}
                    className="ml-2 text-green-600 hover:text-green-800">
                    ×
                  </button>
                </span>
              )}
              {selectedDifficulty !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Difficulty: {selectedDifficulty}
                  <button
                    onClick={() => setSelectedDifficulty("All")}
                    className="ml-2 text-purple-600 hover:text-purple-800">
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {currentWorkouts.length} of {filteredWorkouts.length}{" "}
              workouts
            </p>
          </div>

          {/* Workout Grid */}
          {currentWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5-1.709M15 3.5a7.966 7.966 0 00-6 0M12 3.5a7.966 7.966 0 016 0v0a7.966 7.966 0 00-6 0v0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No workouts found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find more workouts.
              </p>
              <button
                onClick={clearFilters}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-300">
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-orange-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}>
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-12 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium">
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkoutsPage;
