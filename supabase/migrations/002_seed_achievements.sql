-- Seed Achievements for Gamification

-- Streak Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('First Steps', 'Log your first calorie entry', '🌟', 'milestone', 'total_entries', 1, 10),
('Getting Started', 'Log calories for 3 days', '⭐', 'streak', 'streak_days', 3, 25),
('Week Warrior', 'Maintain a 7-day logging streak', '🔥', 'streak', 'streak_days', 7, 50),
('Two Week Champion', 'Maintain a 14-day logging streak', '💪', 'streak', 'streak_days', 14, 100),
('Monthly Master', 'Maintain a 30-day logging streak', '👑', 'streak', 'streak_days', 30, 200),
('Unstoppable', 'Maintain a 60-day logging streak', '🚀', 'streak', 'streak_days', 60, 400),
('Legend', 'Maintain a 100-day logging streak', '⚡', 'streak', 'streak_days', 100, 1000);

-- Milestone Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('Dedicated Logger', 'Log calories for 10 days total', '📝', 'milestone', 'total_entries', 10, 30),
('Consistent Tracker', 'Log calories for 30 days total', '📊', 'milestone', 'total_entries', 30, 100),
('Tracking Pro', 'Log calories for 50 days total', '🎯', 'milestone', 'total_entries', 50, 150),
('Century Club', 'Log calories for 100 days total', '💯', 'milestone', 'total_entries', 100, 300),
('Elite Tracker', 'Log calories for 200 days total', '🏆', 'milestone', 'total_entries', 200, 600),
('Master Logger', 'Log calories for 365 days total', '👨‍🎓', 'milestone', 'total_entries', 365, 1500);

-- Target Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('On Track', 'Stay within weekly target for 1 week', '✅', 'target', 'weeks_on_target', 1, 50),
('Target Hitter', 'Stay within weekly target for 4 weeks', '🎪', 'target', 'weeks_on_target', 4, 150),
('Goal Crusher', 'Stay within weekly target for 8 weeks', '💥', 'target', 'weeks_on_target', 8, 300),
('Precision Expert', 'Stay within weekly target for 12 weeks', '🎓', 'target', 'weeks_on_target', 12, 500);

-- Consistency Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('Consistent Week', 'Stay on target for 2 consecutive weeks', '📈', 'consistency', 'consecutive_weeks', 2, 100),
('Monthly Consistency', 'Stay on target for 4 consecutive weeks', '📅', 'consistency', 'consecutive_weeks', 4, 250),
('Quarterly Consistency', 'Stay on target for 12 consecutive weeks', '🗓️', 'consistency', 'consecutive_weeks', 12, 750);

-- Calorie Banking Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('Saver', 'Bank 1,000 total calories', '🏦', 'special', 'calories_saved', 1000, 100),
('Smart Banker', 'Bank 5,000 total calories', '💰', 'special', 'calories_saved', 5000, 250),
('Savings Master', 'Bank 10,000 total calories', '💎', 'special', 'calories_saved', 10000, 500),
('Calorie Tycoon', 'Bank 25,000 total calories', '🤑', 'special', 'calories_saved', 25000, 1000);
