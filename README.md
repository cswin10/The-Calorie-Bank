# 🏦 Calorie Bank - Weekly Calorie Budget Tracker

A beautiful, gamified SaaS application for tracking your weekly calorie budget. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

![Calorie Bank](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ Features

### Core Functionality
- 📊 **Weekly Calorie Banking** - Set a weekly budget and track your daily consumption
- 💰 **Bank Balance System** - See how many calories you've saved or overspent
- 🍽️ **Meal-by-Meal Tracking** - Log individual meals throughout the day with real-time progress
- ⚡ **Quick Add Presets** - Save common meals for one-tap logging
- 🔮 **Weekly Forecast** - See projected outcomes based on your current pace
- 📅 **Monthly Calendar View** - Visual history of your tracking with color-coded performance
- 📈 **Visual Weekly Overview** - Beautiful bar chart showing daily progress
- 📝 **Easy Daily Logging** - Quick form to log calories for any day
- ⚙️ **Customizable Settings** - Set your weekly target and preferred start day

### Gamification
- 🎯 **30+ Achievements** - Unlock achievements for streaks, milestones, and consistency
- 🔥 **Streak Tracking** - Build and maintain your logging streak
- 📊 **Progress Stats** - Track total entries, best streak, weeks on target, and more
- 🏆 **Level System** - Earn points and level up as you progress
- 💎 **Multiple Achievement Categories** - Streak, milestone, target, consistency, and special achievements

### User Experience
- 🎨 **Beautiful UI** - Modern, gradient-filled design with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - Email/password auth powered by Supabase
- ⚡ **Real-time Updates** - Instant feedback and updates
- 🎭 **Delightful Animations** - Smooth transitions and engaging interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier is fine)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd The-Calorie-Bank
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Database Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of each migration file **in order**:
   - `supabase/migrations/001_initial_schema.sql` - Creates tables and RLS policies
   - `supabase/migrations/002_seed_achievements.sql` - Seeds achievement data
   - `supabase/migrations/003_auto_create_user_records.sql` - Auto-creates user records on signup
   - `supabase/migrations/004_auto_update_stats_and_achievements.sql` - Auto-updates stats and awards achievements
   - `supabase/migrations/005_add_meals_and_presets.sql` - Adds meal-by-meal tracking and presets
4. Run each query one at a time

This will create all the necessary tables, set up row-level security, seed achievements, and configure automatic stat tracking and meal logging.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
The-Calorie-Bank/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── login/              # Login page
│   ├── settings/           # Settings page
│   ├── signup/             # Signup page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── AchievementsCard.tsx
│   ├── CalorieEntryForm.tsx
│   ├── Navbar.tsx
│   ├── RecentEntriesTable.tsx
│   ├── StatsCard.tsx
│   ├── WeeklyBarChart.tsx
│   └── WeeklySummaryCard.tsx
├── lib/                     # Utility functions
│   ├── calculations.ts     # Weekly summary & bank logic
│   ├── dateUtils.ts        # Date calculations
│   ├── types.ts            # TypeScript types
│   └── supabase/           # Supabase clients
│       ├── client.ts       # Browser client
│       └── server.ts       # Server client
├── supabase/               # Database migrations
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_achievements.sql
├── middleware.ts           # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🗄️ Database Schema

### Tables

- **user_settings** - User preferences (weekly target, week start day)
- **calorie_entries** - Daily calorie logs
- **achievements** - Available achievements
- **user_achievements** - Unlocked achievements per user
- **user_stats** - Gamification stats (streaks, points, level)

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## 🎮 How It Works

### Weekly Banking Logic

1. Set your weekly calorie target (e.g., 14,000 calories)
2. This equals a daily target (14,000 ÷ 7 = 2,000/day)
3. Each day you log your actual calories consumed
4. The app calculates your "bank balance":
   - **Banked calories** = Expected calories - Consumed calories
   - If positive, you're under budget (banked)
   - If negative, you're over budget (overspent)

### Example

Week target: 14,000 calories (2,000/day)
- Monday: Ate 1,800 → Banked 200
- Tuesday: Ate 1,700 → Banked 500 total
- Wednesday: Ate 2,500 → Banked 0 (used 500 from bank)

### Achievement System

Achievements are automatically tracked and awarded based on:
- **Streaks** - Consecutive days logging
- **Milestones** - Total number of logs
- **Targets** - Weeks staying within budget
- **Consistency** - Consecutive weeks on target
- **Banking** - Total calories saved

Each achievement grants points that contribute to your level.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variables
7. Deploy!

## 🎨 Customization

### Change Color Scheme

Edit `tailwind.config.ts` to customize the color palette:

```typescript
colors: {
  primary: { ... },    // Green tones
  secondary: { ... },  // Blue tones
  accent: { ... },     // Yellow/orange tones
}
```

### Add More Achievements

Insert new achievements into the `achievements` table via Supabase:

```sql
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points)
VALUES ('Your Achievement', 'Description', '🎉', 'milestone', 'total_entries', 50, 100);
```

### Modify Weekly Logic

Edit `lib/calculations.ts` to adjust:
- Bank balance calculation
- Progress bar colors
- Streak calculations

## 🐛 Troubleshooting

### "User not found" on signup
Make sure you've run the database migrations and Supabase email confirmation is disabled (or check your email).

### Row Level Security errors
Ensure all RLS policies are created via the migration scripts. Check the Supabase dashboard under Authentication → Policies.

### Middleware redirect loops
Clear your cookies and ensure middleware.ts is configured correctly.

### Achievements not showing
Run the seed achievements migration (`002_seed_achievements.sql`).

## 📝 Future Enhancements

- [ ] Weekly/monthly reports view
- [ ] Export data to CSV
- [ ] Food database integration
- [ ] Barcode scanning
- [ ] Social features (friends, leaderboards)
- [ ] Streak freeze/vacation mode
- [ ] Custom achievement creation
- [ ] Mobile app (React Native)
- [ ] Stripe integration for premium features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- Date utilities from [date-fns](https://date-fns.org/)

---

**Happy Calorie Banking! 🏦💰**
