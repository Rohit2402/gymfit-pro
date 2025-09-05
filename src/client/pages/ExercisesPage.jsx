import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ExerciseCard from "../components/ExerciseCard";

// Comprehensive exercise database - In production, this would come from your database
const exerciseData = [
  // Chest Exercises
  {
    id: 1,
    name: "Push-ups",
    category: "Chest",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    description: "Classic bodyweight exercise for upper body strength",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 2,
    name: "Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Intermediate",
    description: "Fundamental barbell exercise for chest development",
    equipment: ["Barbell", "Bench"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 3,
    name: "Incline Dumbbell Press",
    category: "Chest",
    muscleGroups: ["Upper Chest", "Shoulders"],
    difficulty: "Intermediate",
    description: "Targets upper chest with adjustable angle",
    equipment: ["Dumbbells", "Incline Bench"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 4,
    name: "Chest Flyes",
    category: "Chest",
    muscleGroups: ["Chest"],
    difficulty: "Intermediate",
    description: "Isolation exercise for chest muscle definition",
    equipment: ["Dumbbells", "Bench"],
    image: "/api/placeholder/300/200",
  },

  // Back Exercises
  {
    id: 5,
    name: "Pull-ups",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    difficulty: "Intermediate",
    description: "Essential bodyweight exercise for back strength",
    equipment: ["Pull-up Bar"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 6,
    name: "Deadlifts",
    category: "Back",
    muscleGroups: ["Lower Back", "Glutes", "Hamstrings"],
    difficulty: "Advanced",
    description: "King of all exercises for posterior chain",
    equipment: ["Barbell"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 7,
    name: "Bent-over Rows",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Rear Delts"],
    difficulty: "Intermediate",
    description: "Great for building back thickness",
    equipment: ["Barbell"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 8,
    name: "Lat Pulldowns",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids"],
    difficulty: "Beginner",
    description: "Machine exercise for lat development",
    equipment: ["Cable Machine"],
    image: "/api/placeholder/300/200",
  },

  // Legs Exercises
  {
    id: 9,
    name: "Squats",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    difficulty: "Intermediate",
    description: "Fundamental lower body compound movement",
    equipment: ["Barbell"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 10,
    name: "Lunges",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    description: "Unilateral leg exercise for balance and strength",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 11,
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    description: "Machine-based quadriceps exercise",
    equipment: ["Leg Press Machine"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 12,
    name: "Calf Raises",
    category: "Legs",
    muscleGroups: ["Calves"],
    difficulty: "Beginner",
    description: "Isolation exercise for calf development",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },

  // Arms Exercises
  {
    id: 13,
    name: "Bicep Curls",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    description: "Classic isolation exercise for bicep development",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 14,
    name: "Tricep Dips",
    category: "Arms",
    muscleGroups: ["Triceps"],
    difficulty: "Intermediate",
    description: "Bodyweight exercise for tricep strength",
    equipment: ["Parallel Bars"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 15,
    name: "Hammer Curls",
    category: "Arms",
    muscleGroups: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    description: "Neutral grip curl for balanced arm development",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 16,
    name: "Close-Grip Push-ups",
    category: "Arms",
    muscleGroups: ["Triceps", "Chest"],
    difficulty: "Intermediate",
    description: "Push-up variation targeting triceps",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },

  // Shoulders Exercises
  {
    id: 17,
    name: "Overhead Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    difficulty: "Intermediate",
    description: "Fundamental vertical pressing movement",
    equipment: ["Barbell"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 18,
    name: "Lateral Raises",
    category: "Shoulders",
    muscleGroups: ["Side Delts"],
    difficulty: "Beginner",
    description: "Isolation exercise for shoulder width",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 19,
    name: "Front Raises",
    category: "Shoulders",
    muscleGroups: ["Front Delts"],
    difficulty: "Beginner",
    description: "Targets front deltoid muscles",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 20,
    name: "Rear Delt Flyes",
    category: "Shoulders",
    muscleGroups: ["Rear Delts"],
    difficulty: "Beginner",
    description: "Isolation for rear deltoid development",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },

  // Abs/Core Exercises
  {
    id: 21,
    name: "Plank",
    category: "Abs",
    muscleGroups: ["Core", "Shoulders"],
    difficulty: "Beginner",
    description: "Isometric core strengthening exercise",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 22,
    name: "Crunches",
    category: "Abs",
    muscleGroups: ["Upper Abs"],
    difficulty: "Beginner",
    description: "Basic abdominal flexion exercise",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 23,
    name: "Russian Twists",
    category: "Abs",
    muscleGroups: ["Obliques", "Core"],
    difficulty: "Intermediate",
    description: "Rotational core exercise for obliques",
    equipment: ["Medicine Ball"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 24,
    name: "Mountain Climbers",
    category: "Abs",
    muscleGroups: ["Core", "Shoulders", "Legs"],
    difficulty: "Intermediate",
    description: "Dynamic core exercise with cardio benefits",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },

  // Cardio Exercises
  {
    id: 25,
    name: "Burpees",
    category: "Cardio",
    muscleGroups: ["Full Body"],
    difficulty: "Advanced",
    description: "High-intensity full-body exercise",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 26,
    name: "Jumping Jacks",
    category: "Cardio",
    muscleGroups: ["Full Body"],
    difficulty: "Beginner",
    description: "Classic cardio exercise for warm-up",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 27,
    name: "High Knees",
    category: "Cardio",
    muscleGroups: ["Legs", "Core"],
    difficulty: "Beginner",
    description: "Running in place with high knee lift",
    equipment: ["None"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 28,
    name: "Box Jumps",
    category: "Cardio",
    muscleGroups: ["Legs", "Glutes"],
    difficulty: "Intermediate",
    description: "Plyometric exercise for power and agility",
    equipment: ["Plyometric Box"],
    image: "/api/placeholder/300/200",
  },

  // Full Body Exercises
  {
    id: 29,
    name: "Thrusters",
    category: "Full Body",
    muscleGroups: ["Legs", "Shoulders", "Core"],
    difficulty: "Advanced",
    description: "Compound movement combining squat and press",
    equipment: ["Dumbbells"],
    image: "/api/placeholder/300/200",
  },
  {
    id: 30,
    name: "Turkish Get-ups",
    category: "Full Body",
    muscleGroups: ["Core", "Shoulders", "Legs"],
    difficulty: "Advanced",
    description: "Complex movement for total body strength",
    equipment: ["Kettlebell"],
    image: "/api/placeholder/300/200",
  },
];

const ExercisesPage = () => {
  const [exercises, setExercises] = useState(exerciseData);
  const [filteredExercises, setFilteredExercises] = useState(exerciseData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 12;

  // Get unique values for filter options
  const categories = ["All", ...new Set(exerciseData.map((e) => e.category))];
  const difficulties = [
    "All",
    ...new Set(exerciseData.map((e) => e.difficulty)),
  ];

  // Filter exercises based on search and filters
  useEffect(() => {
    let filtered = exercises;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          exercise.muscleGroups.some((muscle) =>
            muscle.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (exercise) => exercise.category === selectedCategory
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(
        (exercise) => exercise.difficulty === selectedDifficulty
      );
    }

    setFilteredExercises(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedDifficulty, exercises]);

  // Pagination logic
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
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
              Exercise Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse exercises by category to build your perfect workout. Find
              detailed instructions and tips for proper form and maximum
              results.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
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

          {/* Category Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 justify-center overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                      selectedCategory === category
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Filters
              </h3>

              <div className="flex flex-wrap gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
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
              Showing {currentExercises.length} of {filteredExercises.length}{" "}
              exercises
            </p>
          </div>

          {/* Exercise Grid */}
          {currentExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
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
                No exercises found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find more exercises.
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
            <div className="flex justify-center items-center space-x-2 mb-8">
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
          <div className="text-center">
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

export default ExercisesPage;
