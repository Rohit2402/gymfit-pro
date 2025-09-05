# 🏋️ GymFit Pro - Complete Gym Management System

A comprehensive gym management system built with **React.js**, **Vite**, **Tailwind CSS**, and **Supabase**.

## 🌟 Features

### 👨‍🏫 For Trainers
- **Member Management**: Assign and manage up to 15 members per trainer
- **Workout Creation**: Design custom workouts with detailed exercises
- **Diet Planning**: Create comprehensive nutrition plans with meals and foods
- **Progress Tracking**: Monitor member progress and performance
- **Assignment System**: Assign workouts and diet plans to members

### 👤 For Members
- **Profile Management**: Complete profile with fitness goals and metrics
- **Workout Access**: View assigned workouts with detailed instructions
- **Diet Plans**: Access personalized nutrition plans
- **Progress Tracking**: Track workout completion and progress

### 🔐 Authentication & Security
- **User Registration**: Secure signup with role-based access (Member/Trainer/Admin)
- **Login System**: Email/password authentication
- **Password Reset**: Secure password recovery system
- **Auto-Assignment**: New members automatically assigned to trainers

## 🛠️ Tech Stack

- **Frontend**: React.js 18+ with Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gymfit-pro.git
cd gymfit-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

Run these SQL scripts in your **Supabase SQL Editor**:

#### Users Table
```sql
CREATE TABLE IF NOT EXISTS public.users (
    id bigserial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    role text NOT NULL CHECK (role IN ('member', 'trainer', 'admin')),
    age integer,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    weight numeric,
    height numeric,
    fitness_goals text,
    specialization text,
    profile_picture_url text
);

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

#### Member-Trainer Mapping
```sql
CREATE TABLE IF NOT EXISTS public.member_trainer_mapping (
    id bigserial PRIMARY KEY,
    member_id bigint NOT NULL,
    trainer_id bigint NOT NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_member FOREIGN KEY (member_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.member_trainer_mapping DISABLE ROW LEVEL SECURITY;
```

#### Workouts System
```sql
-- Workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
    id bigserial PRIMARY KEY,
    trainer_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes integer,
    target_muscle_groups text[],
    equipment_needed text[],
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_workout_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Workout exercises
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id bigserial PRIMARY KEY,
    workout_id bigint NOT NULL,
    exercise_name text NOT NULL,
    sets integer NOT NULL,
    reps text,
    weight_kg numeric,
    rest_seconds integer,
    instructions text,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_workout_exercise FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE
);

-- Workout assignments
CREATE TABLE IF NOT EXISTS public.workout_assignments (
    id bigserial PRIMARY KEY,
    workout_id bigint NOT NULL,
    member_id bigint NOT NULL,
    trainer_id bigint NOT NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    start_date date,
    end_date date,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_assignment_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_member FOREIGN KEY (member_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments DISABLE ROW LEVEL SECURITY;
```

#### Diet Plans System
```sql
-- Diet plans
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id bigserial PRIMARY KEY,
    trainer_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    plan_type text NOT NULL CHECK (plan_type IN ('weight_loss', 'weight_gain', 'muscle_building', 'maintenance', 'cutting', 'bulking', 'general_health')),
    duration_days integer,
    target_calories_per_day integer,
    target_protein_grams integer,
    target_carbs_grams integer,
    target_fat_grams integer,
    dietary_restrictions text[],
    meal_count_per_day integer DEFAULT 3,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_diet_plan_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Diet plan meals
CREATE TABLE IF NOT EXISTS public.diet_plan_meals (
    id bigserial PRIMARY KEY,
    diet_plan_id bigint NOT NULL,
    meal_name text NOT NULL,
    meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
    meal_time text,
    instructions text,
    total_calories integer,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_diet_meal FOREIGN KEY (diet_plan_id) REFERENCES public.diet_plans(id) ON DELETE CASCADE
);

-- Diet plan foods
CREATE TABLE IF NOT EXISTS public.diet_plan_foods (
    id bigserial PRIMARY KEY,
    meal_id bigint NOT NULL,
    food_name text NOT NULL,
    quantity numeric NOT NULL,
    unit text NOT NULL,
    calories_per_serving numeric,
    protein_grams numeric,
    carbs_grams numeric,
    fat_grams numeric,
    notes text,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_diet_food FOREIGN KEY (meal_id) REFERENCES public.diet_plan_meals(id) ON DELETE CASCADE
);

-- Diet plan assignments
CREATE TABLE IF NOT EXISTS public.diet_plan_assignments (
    id bigserial PRIMARY KEY,
    diet_plan_id bigint NOT NULL,
    member_id bigint NOT NULL,
    trainer_id bigint NOT NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    start_date date,
    end_date date,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    notes text,
    custom_calories integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_diet_assignment_plan FOREIGN KEY (diet_plan_id) REFERENCES public.diet_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_diet_assignment_member FOREIGN KEY (member_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_diet_assignment_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.diet_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_foods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_assignments DISABLE ROW LEVEL SECURITY;
```

#### Progress Tracking & Password Reset
```sql
-- Member progress
CREATE TABLE IF NOT EXISTS public.member_progress (
    id bigserial PRIMARY KEY,
    member_id bigint NOT NULL,
    trainer_id bigint NOT NULL,
    workout_name text,
    calories_burned integer,
    duration_minutes integer,
    workout_rating integer CHECK (workout_rating >= 1 AND workout_rating <= 5),
    notes text,
    workout_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_progress_member FOREIGN KEY (member_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_trainer FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
    email text NOT NULL,
    token text NOT NULL UNIQUE,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.member_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens DISABLE ROW LEVEL SECURITY;
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### For Trainers
1. Register as a Trainer
2. Access Trainer Dashboard at `/trainer/dashboard`
3. Create workouts and diet plans
4. Manage assigned members (max 15)
5. Track member progress

### For Members
1. Register as a Member (auto-assigned to trainer)
2. Complete profile at `/profile`
3. View assigned workouts and diet plans
4. Track your fitness progress

## 🚀 Deployment

### Deploy to Vercel
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Deploy to Netlify
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the fitness community**

## 🔗 Database Schema

```
users → member_trainer_mapping
     → workouts → workout_exercises
              → workout_assignments
     → diet_plans → diet_plan_meals → diet_plan_foods
                 → diet_plan_assignments
     → member_progress
     → password_reset_tokens
```