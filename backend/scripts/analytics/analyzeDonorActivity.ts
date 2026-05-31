import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function analyzeDonorActivity() {
  console.log('📊 Analyzing donor activity patterns...\n');

  try {
    const today = new Date();
    
    // Get all donors
    const donors = await prisma.donor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
      },
      select: {
        id: true,
        lastDonationDate: true,
        totalDonations: true,
        createdAt: true,
      },
    });

    console.log(`Found ${donors.length} verified donors\n`);

    let activeCount = 0;
    let inactiveCount = 0;
    let lapsedCount = 0;

    for (const donor of donors) {
      let activityStatus = 'INACTIVE';
      let daysSinceLastDonation: number | null = null;
      let averageDaysBetweenDonations: number | null = null;

      if (donor.lastDonationDate) {
        // Calculate days since last donation
        const diffMs = today.getTime() - new Date(donor.lastDonationDate).getTime();
        daysSinceLastDonation = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Classify donor activity
        if (daysSinceLastDonation <= 90) {
          activityStatus = 'ACTIVE'; // Donated within last 90 days
          activeCount++;
        } else if (daysSinceLastDonation <= 365) {
          activityStatus = 'INACTIVE'; // Donated within last year but not recently
          inactiveCount++;
        } else {
          activityStatus = 'LAPSED'; // Haven't donated in over a year
          lapsedCount++;
        }

        // Calculate average days between donations if multiple donations
        if (donor.totalDonations > 1) {
          const donorAge = today.getTime() - new Date(donor.createdAt).getTime();
          const donorAgeDays = Math.floor(donorAge / (1000 * 60 * 60 * 24));
          averageDaysBetweenDonations = Math.floor(donorAgeDays / donor.totalDonations);
        }
      } else {
        // Never donated
        activityStatus = 'INACTIVE';
        inactiveCount++;
      }

      // Store or update donor activity analysis
      await prisma.analyticsDonorActivity.upsert({
        where: { donorId: donor.id },
        update: {
          activityStatus,
          lastDonationDate: donor.lastDonationDate,
          daysSinceLastDonation,
          totalDonations: donor.totalDonations,
          averageDaysBetweenDonations,
          updatedAt: new Date(),
        },
        create: {
          donorId: donor.id,
          activityStatus,
          lastDonationDate: donor.lastDonationDate,
          daysSinceLastDonation,
          totalDonations: donor.totalDonations,
          averageDaysBetweenDonations,
        },
      });
    }

    console.log('\n📈 Activity Summary:');
    console.log(`✓ Active donors (donated within 90 days): ${activeCount}`);
    console.log(`✓ Inactive donors (90-365 days): ${inactiveCount}`);
    console.log(`✓ Lapsed donors (over 365 days): ${lapsedCount}`);
    console.log('\n✅ Donor activity analysis completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDonorActivity();
