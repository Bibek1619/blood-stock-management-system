# Analytics Dashboard - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Run Analytics Scripts (First Time Setup)

```bash
cd d:\blood\backend

# Run all analytics to populate initial data
npx tsx scripts/analytics/runAllAnalytics.ts
```

This will:
- Aggregate today's donation/issue data
- Analyze all donor activity
- Calculate geographic distributions
- Generate 7-day demand predictions

### Step 2: Start the Servers

```bash
# Terminal 1 - Backend
cd d:\blood\backend
npm run dev

# Terminal 2 - Frontend
cd d:\blood\frontend
npm run dev
```

### Step 3: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000/dashboard/analytics
```

---

## 📊 Dashboard Overview

### Main Tabs

1. **Retention** - Donor activity and retention metrics
2. **Geographic** - Donor distribution by city
3. **Usage** - Blood usage trends over time
4. **Seasonal** - Monthly donation patterns
5. **Predictions** - 7-day demand forecasts
6. **Campaigns** - Campaign effectiveness tracking

---

## 🔄 Daily Maintenance

### Option 1: Manual Execution

Run this command daily to update analytics:

```bash
cd d:\blood\backend
npx tsx scripts/analytics/runAllAnalytics.ts
```

### Option 2: Automated (Windows Task Scheduler)

1. Create a batch file `run-analytics.bat`:
```batch
@echo off
cd /d d:\blood\backend
call npx tsx scripts/analytics/runAllAnalytics.ts
```

2. Open Task Scheduler
3. Create Basic Task
4. Name: "Blood Bank Analytics"
5. Trigger: Daily at 1:00 AM
6. Action: Start a program
7. Program: `d:\blood\backend\run-analytics.bat`

### Option 3: Automated (Node Cron)

Add to `backend/src/index.ts`:

```typescript
import cron from 'node-cron';
import { exec } from 'child_process';

// Run analytics daily at 1 AM
cron.schedule('0 1 * * *', () => {
  console.log('🔄 Running daily analytics...');
  exec('npx tsx scripts/analytics/runAllAnalytics.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Analytics error: ${error}`);
      return;
    }
    console.log(`✅ Analytics completed: ${stdout}`);
  });
});
```

Then install node-cron:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

---

## 🧪 Testing the Analytics

### Test with Sample Data

If you don't have enough data yet, the analytics will still work but show minimal results. To test properly:

1. **Add some donations** via `/dashboard/blood-donate/blood-collection`
2. **Add some blood issues** via `/dashboard/blood-issue`
3. **Wait 24 hours** or manually set some `lastDonationDate` values in the past
4. **Run analytics scripts** again

### Verify Data

Check if analytics data exists:

```bash
# Open Prisma Studio
cd d:\blood\backend
npx prisma studio
```

Look for data in these tables:
- `AnalyticsDailySummary`
- `AnalyticsDonorActivity`
- `AnalyticsGeographic`
- `AnalyticsPrediction`

---

## 📈 Understanding the Metrics

### Donor Activity Status

- **ACTIVE**: Donated within last 90 days (eligible to donate again soon)
- **INACTIVE**: Last donation 90-365 days ago (may need reminder)
- **LAPSED**: Haven't donated in over a year (re-engagement needed)

### Retention Rate

```
Retention Rate = (Active Donors / Total Donors) × 100
```

A good retention rate is typically 30-40% for blood banks.

### Prediction Confidence

- **High (>80%)**: Consistent historical patterns, reliable forecast
- **Medium (50-80%)**: Some variation, use with caution
- **Low (<50%)**: Irregular patterns, predictions less reliable

---

## 🔧 Troubleshooting

### No Data Showing

**Problem**: Dashboard shows empty charts

**Solutions**:
1. Run analytics scripts: `npx tsx scripts/analytics/runAllAnalytics.ts`
2. Check if you have donations in the database
3. Verify backend is running on port 3001
4. Check browser console for API errors

### Predictions Not Generated

**Problem**: Predictions tab is empty

**Cause**: Need at least some blood issue history

**Solution**: 
- Add some blood issues via the dashboard
- Or wait until you have real usage data
- Predictions require historical blood issue data

### Geographic Data Missing

**Problem**: Geographic tab shows no cities

**Cause**: Donors don't have city information

**Solution**:
- Ensure donors have `city` field filled
- Update existing donors with city data
- New donors will automatically include city

---

## 🎯 Best Practices

### 1. Run Analytics Daily
Set up automated daily execution to keep data fresh

### 2. Review Weekly
Check the dashboard weekly to:
- Monitor retention trends
- Review prediction accuracy
- Identify geographic gaps

### 3. Act on Insights
- **Low retention?** → Launch re-engagement campaign
- **Predicted shortage?** → Schedule donation drive
- **Geographic gaps?** → Target those areas for events

### 4. Track Campaigns
When running donation campaigns:
1. Create campaign entry via API
2. Link to event if applicable
3. Update with actual results
4. Review effectiveness metrics

---

## 📞 Support

If you encounter issues:

1. Check the logs in terminal
2. Review `ANALYTICS_IMPLEMENTATION_PLAN.md` for detailed info
3. Verify database connection
4. Ensure all dependencies are installed

---

## 🎉 You're All Set!

Your analytics dashboard is now ready to provide insights into:
- ✅ Donor retention and engagement
- ✅ Geographic distribution
- ✅ Blood usage patterns
- ✅ Seasonal trends
- ✅ Demand predictions
- ✅ Campaign effectiveness

**Next Steps**:
1. Set up daily automation
2. Add more historical data
3. Review predictions weekly
4. Use insights to improve operations

---

**Happy Analyzing! 📊**
