import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting BloodIssueItems...');
    const issueItems = await prisma.bloodIssueItem.deleteMany({});
    console.log(`  ✓ Deleted ${issueItems.count} records`);
    
    console.log('Deleting BloodIssues...');
    const issues = await prisma.bloodIssue.deleteMany({});
    console.log(`  ✓ Deleted ${issues.count} records`);
    
    console.log('Deleting BloodPacks...');
    const packs = await prisma.bloodPack.deleteMany({});
    console.log(`  ✓ Deleted ${packs.count} records`);
    
    console.log('Deleting BloodStockSummary...');
    const stock = await prisma.bloodStockSummary.deleteMany({});
    console.log(`  ✓ Deleted ${stock.count} records`);
    
    console.log('Deleting Donations...');
    const donations = await prisma.donation.deleteMany({});
    console.log(`  ✓ Deleted ${donations.count} records`);
    
    console.log('Deleting Certificates...');
    const certificates = await prisma.certificate.deleteMany({});
    console.log(`  ✓ Deleted ${certificates.count} records`);
    
    console.log('Deleting EventParticipants...');
    const participants = await prisma.eventParticipant.deleteMany({});
    console.log(`  ✓ Deleted ${participants.count} records`);
    
    console.log('Deleting EventVolunteers...');
    const volunteers = await prisma.eventVolunteer.deleteMany({});
    console.log(`  ✓ Deleted ${volunteers.count} records`);
    
    console.log('Deleting Events...');
    const events = await prisma.event.deleteMany({});
    console.log(`  ✓ Deleted ${events.count} records`);
    
    console.log('Deleting Donors...');
    const donors = await prisma.donor.deleteMany({});
    console.log(`  ✓ Deleted ${donors.count} records`);
    
    console.log('Deleting Users...');
    const users = await prisma.user.deleteMany({});
    console.log(`  ✓ Deleted ${users.count} records`);
    
    console.log('\n✅ Database cleared successfully!');
    console.log('All data has been removed from the database.\n');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
