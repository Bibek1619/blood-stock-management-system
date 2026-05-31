import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Minimum days between donations (typically 90 days / 3 months)
const MIN_DAYS_BETWEEN_DONATIONS = 90;

async function updateDonorEligibility() {
  try {
    console.log('🔄 Updating donor eligibility based on last donation date...\n');

    const donors = await prisma.donor.findMany({
      select: {
        id: true,
        lastDonationDate: true,
        isEligible: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${donors.length} donors\n`);

    let updatedCount = 0;
    const today = new Date();

    for (const donor of donors) {
      let shouldBeEligible = true;

      if (donor.lastDonationDate) {
        const lastDonation = new Date(donor.lastDonationDate);
        const daysSinceLastDonation = Math.floor(
          (today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Donor is NOT eligible if they donated within the last 90 days
        shouldBeEligible = daysSinceLastDonation >= MIN_DAYS_BETWEEN_DONATIONS;

        console.log(
          `${donor.user.name}: Last donation ${daysSinceLastDonation} days ago - ${
            shouldBeEligible ? '✅ Eligible' : '❌ Not Eligible'
          }`
        );
      } else {
        console.log(`${donor.user.name}: Never donated - ✅ Eligible`);
      }

      // Update if eligibility status changed
      if (donor.isEligible !== shouldBeEligible) {
        await prisma.donor.update({
          where: { id: donor.id },
          data: { isEligible: shouldBeEligible },
        });
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} donor(s) eligibility status`);

    // Show summary
    const eligible = await prisma.donor.count({ where: { isEligible: true } });
    const notEligible = await prisma.donor.count({ where: { isEligible: false } });

    console.log('\nCurrent Status:');
    console.log(`  ✓ Eligible: ${eligible}`);
    console.log(`  ✗ Not Eligible: ${notEligible}`);
    console.log(`\nNote: Donors must wait ${MIN_DAYS_BETWEEN_DONATIONS} days between donations\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDonorEligibility();
