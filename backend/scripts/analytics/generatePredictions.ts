import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function generatePredictions() {
  console.log('📊 Generating blood demand predictions...\n');

  try {
    const bloodGroups = [
      'A_POSITIVE', 'A_NEGATIVE', 
      'B_POSITIVE', 'B_NEGATIVE',
      'AB_POSITIVE', 'AB_NEGATIVE',
      'O_POSITIVE', 'O_NEGATIVE'
    ];

    // Look back 30 days for historical data
    const daysToAnalyze = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    // Predict for next 7 days
    const daysToPredict = 7;

    for (const bloodGroup of bloodGroups) {
      // Get historical blood issues (demand)
      const historicalIssues = await prisma.bloodIssue.findMany({
        where: {
          bloodGroup: bloodGroup as any,
          issueDate: {
            gte: startDate,
          },
        },
        select: {
          unitsIssued: true,
          issueDate: true,
        },
      });

      if (historicalIssues.length === 0) {
        console.log(`⚠ ${bloodGroup}: No historical data, skipping prediction`);
        continue;
      }

      // Calculate average daily demand
      const totalUnitsIssued = historicalIssues.reduce((sum, issue) => sum + issue.unitsIssued, 0);
      const averageDailyDemand = totalUnitsIssued / daysToAnalyze;

      // Calculate standard deviation for confidence
      const variance = historicalIssues.reduce((sum, issue) => {
        const diff = issue.unitsIssued - averageDailyDemand;
        return sum + (diff * diff);
      }, 0) / historicalIssues.length;
      const stdDev = Math.sqrt(variance);

      // Calculate confidence (inverse of coefficient of variation, capped at 1)
      const coefficientOfVariation = averageDailyDemand > 0 ? stdDev / averageDailyDemand : 1;
      const confidence = Math.min(1, Math.max(0, 1 - coefficientOfVariation));

      // Check for seasonal patterns (day of week)
      const dayOfWeekDemand: { [key: number]: number[] } = {};
      historicalIssues.forEach(issue => {
        const dayOfWeek = new Date(issue.issueDate).getDay();
        if (!dayOfWeekDemand[dayOfWeek]) {
          dayOfWeekDemand[dayOfWeek] = [];
        }
        dayOfWeekDemand[dayOfWeek].push(issue.unitsIssued);
      });

      // Generate predictions for next 7 days
      for (let i = 1; i <= daysToPredict; i++) {
        const predictionDate = new Date();
        predictionDate.setDate(predictionDate.getDate() + i);
        predictionDate.setHours(0, 0, 0, 0);

        const dayOfWeek = predictionDate.getDay();
        
        // Use day-of-week average if available, otherwise use overall average
        let predictedDemand = Math.round(averageDailyDemand);
        if (dayOfWeekDemand[dayOfWeek] && dayOfWeekDemand[dayOfWeek].length > 0) {
          const dayAverage = dayOfWeekDemand[dayOfWeek].reduce((a, b) => a + b, 0) / dayOfWeekDemand[dayOfWeek].length;
          predictedDemand = Math.round(dayAverage);
        }

        // Store prediction
        await prisma.analyticsPrediction.upsert({
          where: {
            predictionDate_bloodGroup: {
              predictionDate,
              bloodGroup: bloodGroup as any,
            },
          },
          update: {
            predictedDemand,
            confidence,
            basedOnDays: daysToAnalyze,
          },
          create: {
            predictionDate,
            bloodGroup: bloodGroup as any,
            predictedDemand,
            confidence,
            basedOnDays: daysToAnalyze,
          },
        });
      }

      console.log(`✓ ${bloodGroup}: Avg demand ${averageDailyDemand.toFixed(1)} units/day (confidence: ${(confidence * 100).toFixed(0)}%)`);
    }

    console.log('\n✅ Predictions generated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generatePredictions();
