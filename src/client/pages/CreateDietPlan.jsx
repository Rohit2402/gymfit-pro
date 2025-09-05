import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  createDietPlan,
  getTrainerMembersForAssignment,
  assignDietPlanToMembers,
} from "../../lib/supabase";

const CreateDietPlan = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
    customCalories: "",
  });
  const [createdDietPlan, setCreatedDietPlan] = useState(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const navigate = useNavigate();

  const [dietPlanData, setDietPlanData] = useState({
    name: "",
    description: "",
    planType: "",
    durationDays: "",
    targetCalories: "",
    targetProtein: "",
    targetCarbs: "",
    targetFat: "",
    dietaryRestrictions: [],
    mealCount: 3,
    isPublic: false,
    meals: [],
  });

  const [currentMeal, setCurrentMeal] = useState({
    name: "",
    type: "",
    time: "",
    instructions: "",
    totalCalories: "",
    foods: [],
  });

  const [currentFood, setCurrentFood] = useState({
    name: "",
    quantity: "",
    unit: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  });

  const planTypes = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "weight_gain", label: "Weight Gain" },
    { value: "muscle_building", label: "Muscle Building" },
    { value: "maintenance", label: "Maintenance" },
    { value: "cutting", label: "Cutting" },
    { value: "bulking", label: "Bulking" },
    { value: "general_health", label: "General Health" },
  ];

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
    { value: "pre_workout", label: "Pre-Workout" },
    { value: "post_workout", label: "Post-Workout" },
  ];

  const dietaryRestrictions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Low-Carb",
    "High-Protein",
    "Low-Fat",
    "Paleo",
    "Mediterranean",
  ];

  const units = [
    "grams",
    "cups",
    "pieces",
    "slices",
    "tablespoons",
    "teaspoons",
    "ounces",
    "pounds",
    "liters",
    "milliliters",
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
    setDietPlanData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (field, value) => {
    setDietPlanData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleMealChange = (e) => {
    const { name, value } = e.target;
    setCurrentMeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFoodChange = (e) => {
    const { name, value } = e.target;
    setCurrentFood((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFood = () => {
    if (!currentFood.name || !currentFood.quantity || !currentFood.unit) {
      setError("Please fill in food name, quantity, and unit");
      return;
    }

    setCurrentMeal((prev) => ({
      ...prev,
      foods: [...prev.foods, { ...currentFood }],
    }));

    setCurrentFood({
      name: "",
      quantity: "",
      unit: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      notes: "",
    });
    setError("");
  };

  const removeFood = (index) => {
    setCurrentMeal((prev) => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }));
  };

  const addMeal = () => {
    if (!currentMeal.name || !currentMeal.type) {
      setError("Please fill in meal name and type");
      return;
    }

    setDietPlanData((prev) => ({
      ...prev,
      meals: [...prev.meals, { ...currentMeal }],
    }));

    setCurrentMeal({
      name: "",
      type: "",
      time: "",
      instructions: "",
      totalCalories: "",
      foods: [],
    });
    setError("");
  };

  const removeMeal = (index) => {
    setDietPlanData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
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
    if (!dietPlanData.name || !dietPlanData.planType) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (dietPlanData.meals.length === 0) {
      setError("Please add at least one meal");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createDietPlan({
        ...dietPlanData,
        trainerId: user.id,
        durationDays: parseInt(dietPlanData.durationDays) || null,
        targetCalories: parseInt(dietPlanData.targetCalories) || null,
        targetProtein: parseInt(dietPlanData.targetProtein) || null,
        targetCarbs: parseInt(dietPlanData.targetCarbs) || null,
        targetFat: parseInt(dietPlanData.targetFat) || null,
      });

      if (result.success) {
        setCreatedDietPlan(result.data);
        setShowAssignment(true);
        setError("");
      } else {
        setError(result.error || "Failed to create diet plan");
      }
    } catch (error) {
      console.error("Create diet plan error:", error);
      setError("An error occurred while creating the diet plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDietPlan = async () => {
    if (selectedMembers.length === 0) {
      setError("Please select at least one member to assign the diet plan");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await assignDietPlanToMembers(
        createdDietPlan.id,
        selectedMembers,
        user.id,
        {
          ...assignmentData,
          customCalories: assignmentData.customCalories
            ? parseInt(assignmentData.customCalories)
            : null,
        }
      );

      if (result.success) {
        alert(
          `Diet Plan "${createdDietPlan.name}" successfully assigned to ${selectedMembers.length} member(s)!`
        );
        navigate("/trainer/dashboard");
      } else {
        setError(result.error || "Failed to assign diet plan");
      }
    } catch (error) {
      console.error("Assign diet plan error:", error);
      setError("An error occurred while assigning the diet plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAssignment = () => {
    alert(`Diet Plan "${createdDietPlan.name}" created successfully!`);
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
                  Create New Diet Plan
                </h1>
                <p className="text-gray-600">
                  Design a comprehensive nutrition plan for your members
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
                  Diet Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={dietPlanData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Weight Loss Plan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type *
                </label>
                <select
                  name="planType"
                  value={dietPlanData.planType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required>
                  <option value="">Select Plan Type</option>
                  {planTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="durationDays"
                  value={dietPlanData.durationDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals per Day
                </label>
                <select
                  name="mealCount"
                  value={dietPlanData.mealCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="3">3 Meals</option>
                  <option value="4">4 Meals</option>
                  <option value="5">5 Meals</option>
                  <option value="6">6 Meals</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={dietPlanData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the diet plan goals and approach..."
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={dietPlanData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Make this diet plan public (visible to all trainers)
                </label>
              </div>
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Nutrition Targets (Daily)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  name="targetCalories"
                  value={dietPlanData.targetCalories}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="targetProtein"
                  value={dietPlanData.targetProtein}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  name="targetCarbs"
                  value={dietPlanData.targetCarbs}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  name="targetFat"
                  value={dietPlanData.targetFat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dietary Restrictions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {dietaryRestrictions.map((restriction) => (
                <label key={restriction} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dietPlanData.dietaryRestrictions.includes(
                      restriction
                    )}
                    onChange={() =>
                      handleArrayChange("dietaryRestrictions", restriction)
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {restriction}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Meal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Add Meals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentMeal.name}
                  onChange={handleMealChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Healthy Breakfast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type *
                </label>
                <select
                  name="type"
                  value={currentMeal.type}
                  onChange={handleMealChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Select Type</option>
                  {mealTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={currentMeal.time}
                  onChange={handleMealChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Instructions
              </label>
              <textarea
                name="instructions"
                value={currentMeal.instructions}
                onChange={handleMealChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Cooking instructions or meal preparation notes..."
              />
            </div>

            {/* Add Food to Meal */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Foods to Meal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentFood.name}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Chicken Breast"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentFood.quantity}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="150"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={currentFood.unit}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={currentFood.calories}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    name="protein"
                    value={currentFood.protein}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="25"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    name="carbs"
                    value={currentFood.carbs}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    name="fat"
                    value={currentFood.fat}
                    onChange={handleFoodChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="3"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    &nbsp;
                  </label>
                  <button
                    type="button"
                    onClick={addFood}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-300">
                    Add Food
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={currentFood.notes}
                  onChange={handleFoodChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Optional notes about preparation or alternatives..."
                />
              </div>

              {/* Current Meal Foods */}
              {currentMeal.foods.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Foods in this meal ({currentMeal.foods.length})
                  </h4>
                  <div className="space-y-2">
                    {currentMeal.foods.map((food, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{food.name}</span>
                          <span className="text-gray-600 ml-2">
                            {food.quantity} {food.unit}
                          </span>
                          {food.calories && (
                            <span className="text-orange-600 ml-2">
                              ({food.calories} cal)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFood(index)}
                          className="text-red-600 hover:text-red-800">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addMeal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition duration-300">
                Add Meal to Plan
              </button>
            </div>
          </div>

          {/* Diet Plan Meals */}
          {dietPlanData.meals.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Diet Plan Meals ({dietPlanData.meals.length})
              </h2>

              <div className="space-y-4">
                {dietPlanData.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {meal.name} ({meal.type})
                        </h3>
                        {meal.time && (
                          <p className="text-sm text-gray-600">
                            Time: {meal.time}
                          </p>
                        )}
                        {meal.instructions && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            {meal.instructions}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="text-red-600 hover:text-red-800">
                        Remove Meal
                      </button>
                    </div>

                    {meal.foods.length > 0 && (
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Foods:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {meal.foods.map((food, foodIndex) => (
                            <div
                              key={foodIndex}
                              className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              • {food.name} - {food.quantity} {food.unit}
                              {food.calories && ` (${food.calories} cal)`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Section - Show after diet plan creation */}
          {showAssignment && createdDietPlan && (
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
                  Diet Plan "{createdDietPlan.name}" Created Successfully!
                </h2>
              </div>

              <p className="text-green-800 mb-6">
                Now you can assign this diet plan to your members. Select the
                members you want to assign this diet plan to:
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Calories (Optional)
                    </label>
                    <input
                      type="number"
                      name="customCalories"
                      value={assignmentData.customCalories}
                      onChange={handleAssignmentDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Override plan calories"
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
                    placeholder="Add any special instructions or notes for this diet plan assignment..."
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
                  onClick={handleAssignDietPlan}
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
                  "Create Diet Plan"
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

export default CreateDietPlan;
