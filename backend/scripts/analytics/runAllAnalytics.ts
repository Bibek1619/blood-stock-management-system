import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runAllAnalytics() {
  console.log('🚀 Running all analytics scripts...\n');
  console.log('='.repeat(60));

  const scripts = [
    { name: 'Daily Data Aggregation', path: 'scripts/analytics/aggregateDailyData.ts' },
    { name: 'Donor Activity Analysis', path: 'scripts/analytics/analyzeDonorActivity.ts' },
    { name: 'Geographic Data Aggregation', path: 'scripts/analytics/aggregateGeographicData.ts' },
    { name: 'Demand Predictions', path: 'scripts/analytics/generatePredictions.ts' },
  ];

  for (const script of scripts) {
    console.log(`\n📊 Running: ${script.name}`);
    console.log('-'.repeat(60));
    
    try {
      const { stdout, stderr } = await execAsync(`npx tsx ${script.path}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error: any) {
      console.error(`❌ Error running ${script.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All analytics scripts completed!\n');
}

runAllAnalytics();
