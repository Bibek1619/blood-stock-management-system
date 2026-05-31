import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function updateExistingDonors() {
  try {
    console.log('🔄 Updating existing donors...\n');

    // Get all donors without verification status or with null status
    const allDonors = await prisma.donor.findMany({
      select: {
        id: true,
        verificationStatus: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${allDonors.length} total donors\n`);

    // Update donors that are not PENDING to VERIFIED
    // (Keep PENDING donors as they are waiting for approval)
    const result = await prisma.donor.updateMany({
      where: {
        verificationStatus: {
          not: 'PENDING',
        },
      },
      data: {
        verificationStatus: 'VERIFIED',
      },
    });

    console.log(`✅ Updated ${result.count} donors to VERIFIED status`);
    console.log(`📋 Donors with PENDING status remain unchanged\n`);

    // Show current status breakdown
    const verified = await prisma.donor.count({ where: { verificationStatus: 'VERIFIED' } });
    const pending = await prisma.donor.count({ where: { verificationStatus: 'PENDING' } });
    const rejected = await prisma.donor.count({ where: { verificationStatus: 'REJECTED' } });

    console.log('Current Status Breakdown:');
    console.log(`  ✓ VERIFIED: ${verified}`);
    console.log(`  ⏳ PENDING: ${pending}`);
    console.log(`  ✗ REJECTED: ${rejected}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingDonors();
