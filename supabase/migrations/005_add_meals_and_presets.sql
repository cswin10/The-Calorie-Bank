-- Meals Table (for meal-by-meal logging throughout the day)
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    time_of_day TEXT CHECK (time_of_day IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meal Presets Table (for quick-add functionality)
CREATE TABLE meal_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    time_of_day TEXT CHECK (time_of_day IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    use_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meals_user_date ON meals(user_id, entry_date DESC);
CREATE INDEX idx_meals_user_logged_at ON meals(user_id, logged_at DESC);
CREATE INDEX idx_meal_presets_user ON meal_presets(user_id);
CREATE INDEX idx_meal_presets_user_favorites ON meal_presets(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Triggers for updated_at
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_presets_updated_at BEFORE UPDATE ON meal_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_presets ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can view their own meals" ON meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals" ON meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" ON meals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" ON meals
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for meal_presets
CREATE POLICY "Users can view their own presets" ON meal_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presets" ON meal_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets" ON meal_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON meal_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Function to sync meals to calorie_entries
-- When meals are added/updated/deleted, automatically update the daily total in calorie_entries
CREATE OR REPLACE FUNCTION sync_daily_calories()
RETURNS trigger AS $$
DECLARE
  v_user_id UUID;
  v_entry_date DATE;
  v_total_calories INTEGER;
BEGIN
  -- Get user_id and entry_date from the operation
  IF (TG_OP = 'DELETE') THEN
    v_user_id := OLD.user_id;
    v_entry_date := OLD.entry_date;
  ELSE
    v_user_id := NEW.user_id;
    v_entry_date := NEW.entry_date;
  END IF;

  -- Calculate total calories for this day
  SELECT COALESCE(SUM(calories), 0) INTO v_total_calories
  FROM meals
  WHERE user_id = v_user_id AND entry_date = v_entry_date;

  -- Update or insert into calorie_entries
  INSERT INTO calorie_entries (user_id, entry_date, calories)
  VALUES (v_user_id, v_entry_date, v_total_calories)
  ON CONFLICT (user_id, entry_date)
  DO UPDATE SET calories = v_total_calories;

  -- If total is 0, optionally delete the entry (keeps it clean)
  IF v_total_calories = 0 THEN
    DELETE FROM calorie_entries WHERE user_id = v_user_id AND entry_date = v_entry_date;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to sync meals to daily totals
DROP TRIGGER IF EXISTS sync_calories_on_meal_insert ON meals;
CREATE TRIGGER sync_calories_on_meal_insert
  AFTER INSERT ON meals
  FOR EACH ROW EXECUTE FUNCTION sync_daily_calories();

DROP TRIGGER IF EXISTS sync_calories_on_meal_update ON meals;
CREATE TRIGGER sync_calories_on_meal_update
  AFTER UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION sync_daily_calories();

DROP TRIGGER IF EXISTS sync_calories_on_meal_delete ON meals;
CREATE TRIGGER sync_calories_on_meal_delete
  AFTER DELETE ON meals
  FOR EACH ROW EXECUTE FUNCTION sync_daily_calories();
