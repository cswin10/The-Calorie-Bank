-- Function to update user stats and check achievements when calorie entries change
CREATE OR REPLACE FUNCTION public.update_user_stats_and_achievements()
RETURNS trigger AS $$
DECLARE
  v_user_id UUID;
  v_total_entries INTEGER;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_new_achievement_ids UUID[];
  v_achievement_id UUID;
  v_achievement_points INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Get user_id from the operation
  IF (TG_OP = 'DELETE') THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  -- Calculate total entries
  SELECT COUNT(*) INTO v_total_entries
  FROM calorie_entries
  WHERE user_id = v_user_id;

  -- Calculate current streak
  WITH sorted_entries AS (
    SELECT entry_date
    FROM calorie_entries
    WHERE user_id = v_user_id
    ORDER BY entry_date DESC
  ),
  streak_calc AS (
    SELECT entry_date,
           LAG(entry_date) OVER (ORDER BY entry_date DESC) as prev_date
    FROM sorted_entries
  )
  SELECT COALESCE(COUNT(*), 0) INTO v_current_streak
  FROM streak_calc
  WHERE entry_date >= CURRENT_DATE - INTERVAL '1 day'
    AND (prev_date IS NULL OR entry_date - prev_date <= 1);

  -- If no recent entries, streak is 0
  IF NOT EXISTS (
    SELECT 1 FROM calorie_entries
    WHERE user_id = v_user_id
      AND entry_date >= CURRENT_DATE - INTERVAL '1 day'
  ) THEN
    v_current_streak := 0;
  END IF;

  -- Calculate longest streak (simplified version)
  SELECT GREATEST(COALESCE(MAX(longest_streak), 0), v_current_streak) INTO v_longest_streak
  FROM user_stats
  WHERE user_id = v_user_id;

  -- Update user stats
  UPDATE user_stats
  SET
    total_entries = v_total_entries,
    current_streak = v_current_streak,
    longest_streak = v_longest_streak
  WHERE user_id = v_user_id;

  -- Check and award new achievements
  -- Achievement: First entry
  IF v_total_entries = 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT v_user_id, id
    FROM achievements
    WHERE name = 'First Entry'
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- Achievement: Streak milestones
  IF v_current_streak >= 3 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT v_user_id, id
    FROM achievements
    WHERE requirement_type = 'streak_days' AND requirement_value <= v_current_streak
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- Achievement: Entry milestones
  INSERT INTO user_achievements (user_id, achievement_id)
  SELECT v_user_id, id
  FROM achievements
  WHERE requirement_type = 'total_entries' AND requirement_value <= v_total_entries
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- Calculate total points from achievements
  SELECT COALESCE(SUM(a.points), 0) INTO v_total_points
  FROM user_achievements ua
  JOIN achievements a ON a.id = ua.achievement_id
  WHERE ua.user_id = v_user_id;

  -- Update total points and calculate level
  UPDATE user_stats
  SET
    total_points = v_total_points,
    level = GREATEST(1, (v_total_points / 100) + 1)
  WHERE user_id = v_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for INSERT
DROP TRIGGER IF EXISTS update_stats_on_entry_insert ON calorie_entries;
CREATE TRIGGER update_stats_on_entry_insert
  AFTER INSERT ON calorie_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_and_achievements();

-- Trigger for UPDATE
DROP TRIGGER IF EXISTS update_stats_on_entry_update ON calorie_entries;
CREATE TRIGGER update_stats_on_entry_update
  AFTER UPDATE ON calorie_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_and_achievements();

-- Trigger for DELETE
DROP TRIGGER IF EXISTS update_stats_on_entry_delete ON calorie_entries;
CREATE TRIGGER update_stats_on_entry_delete
  AFTER DELETE ON calorie_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_and_achievements();

-- Grant INSERT permission on user_achievements for the function
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can insert achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);
