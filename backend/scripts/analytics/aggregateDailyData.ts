import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function aggregateDailyData() {
  console.log('📊 Aggregating daily analytics data...\n');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bloodGroups = [
      'A_POSITIVE', 'A_NEGATIVE', 
      'B_POSITIVE', 'B_NEGATIVE',
      'AB_POSITIVE', 'AB_NEGATIVE',
      'O_POSITIVE', 'O_NEGATIVE'
    ];

    for (const bloodGroup of bloodGroups) {
      // Count donations for today
      const donationsCount = await prisma.donation.count({
        where: {
          bloodGroup: bloodGroup as any,
          donationDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Count blood issues for today
      const issuesCount = await prisma.bloodIssue.count({
        where: {
          bloodGroup: bloodGroup as any,
          issueDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Count expired packs
      const expiredCount = await prisma.bloodPack.count({
        where: {
          bloodGroup: bloodGroup as any,
          status: 'EXPIRED',
          expiryDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Count new donors
      const newDonorsCount = await prisma.donor.count({
        where: {
          bloodGroup: bloodGroup as any,
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Count active donors (donated in last 90 days)
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const activeDonorsCount = await prisma.donor.count({
        where: {
          bloodGroup: bloodGroup as any,
          lastDonationDate: {
            gte: ninetyDaysAgo
          }
        }
      });

      // Get current stock level
      const stockSummary = await prisma.bloodStockSummary.findUnique({
        where: { bloodGroup: bloodGroup as any }
      });

      // Store aggregated data using Prisma upsert
      await prisma.analyticsDailySummary.upsert({
        where: {
          date_bloodGroup: {
            date: today,
            bloodGroup: bloodGroup as any,
          },
        },
        update: {
          donationsCount,
          issuesCount,
          expiredCount,
          newDonorsCount,
          activeDonorsCount,
          stockLevel: stockSummary?.available || 0,
          updatedAt: new Date(),
        },
        create: {
          date: today,
          bloodGroup: bloodGroup as any,
          donationsCount,
          issuesCount,
          expiredCount,
          newDonorsCount,
          activeDonorsCount,
          stockLevel: stockSummary?.available || 0,
        },
      });

      console.log(`✓ ${bloodGroup}: ${donationsCount} donations, ${activeDonorsCount} active donors`);
    }

    console.log('\n✅ Daily aggregation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

aggregateDailyData();
