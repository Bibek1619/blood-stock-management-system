import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function checkPendingDonors() {
  try {
    const pendingDonors = await prisma.donor.findMany({
      where: {
        verificationStatus: 'PENDING',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log(`\n📊 Found ${pendingDonors.length} pending donor(s)\n`);
    
    if (pendingDonors.length > 0) {
      pendingDonors.forEach((donor, index) => {
        console.log(`${index + 1}. ${donor.user.name}`);
        console.log(`   Email: ${donor.user.email}`);
        console.log(`   Phone: ${donor.user.phone}`);
        console.log(`   Blood Group: ${donor.bloodGroup}`);
        console.log(`   Status: ${donor.verificationStatus}`);
        console.log('');
      });
    } else {
      console.log('No pending donors found. Register a new donor to test the approval flow.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingDonors();
