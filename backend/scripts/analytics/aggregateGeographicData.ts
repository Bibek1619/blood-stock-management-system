import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function aggregateGeographicData() {
  console.log('📊 Aggregating geographic data...\n');

  try {
    const bloodGroups = [
      'A_POSITIVE', 'A_NEGATIVE', 
      'B_POSITIVE', 'B_NEGATIVE',
      'AB_POSITIVE', 'AB_NEGATIVE',
      'O_POSITIVE', 'O_NEGATIVE'
    ];

    // Get all cities with donors
    const cities = await prisma.donor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        city: { not: null },
      },
      select: {
        city: true,
      },
      distinct: ['city'],
    });

    console.log(`Found ${cities.length} cities with donors\n`);

    for (const { city } of cities) {
      if (!city) continue;

      for (const bloodGroup of bloodGroups) {
        // Count total donors in this city with this blood group
        const donorCount = await prisma.donor.count({
          where: {
            city,
            bloodGroup: bloodGroup as any,
            verificationStatus: 'VERIFIED',
          },
        });

        // Count active donors (donated within last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const activeDonorCount = await prisma.donor.count({
          where: {
            city,
            bloodGroup: bloodGroup as any,
            verificationStatus: 'VERIFIED',
            lastDonationDate: {
              gte: ninetyDaysAgo,
            },
          },
        });

        // Count total donations from this city
        const donorsInCity = await prisma.donor.findMany({
          where: {
            city,
            bloodGroup: bloodGroup as any,
            verificationStatus: 'VERIFIED',
          },
          select: { id: true },
        });

        const donorIds = donorsInCity.map(d => d.id);

        const totalDonations = await prisma.donation.count({
          where: {
            bloodGroup: bloodGroup as any,
            donorId: {
              in: donorIds,
            },
          },
        });

        // Store or update geographic data
        await prisma.analyticsGeographic.upsert({
          where: {
            city_bloodGroup: {
              city,
              bloodGroup: bloodGroup as any,
            },
          },
          update: {
            donorCount,
            activeDonorCount,
            totalDonations,
            lastUpdated: new Date(),
          },
          create: {
            city,
            bloodGroup: bloodGroup as any,
            donorCount,
            activeDonorCount,
            totalDonations,
          },
        });

        if (donorCount > 0) {
          console.log(`✓ ${city} - ${bloodGroup}: ${donorCount} donors (${activeDonorCount} active)`);
        }
      }
    }

    console.log('\n✅ Geographic data aggregation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

aggregateGeographicData();
