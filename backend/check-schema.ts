import { prisma } from "./lib/prisma";

async function checkSchema() {
  try {
    // Try to query the User table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.log("User table columns:");
    console.log(result);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSchema();
