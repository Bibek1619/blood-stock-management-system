import { prisma } from "./lib/prisma";

async function fixIdColumn() {
  try {
    console.log("Fixing User table id column...");
    
    // Change id column from integer to text
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ALTER COLUMN "id" TYPE TEXT USING "id"::TEXT;
    `;
    console.log("✅ Changed id column type to TEXT");
    
    // Remove default if it exists
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ALTER COLUMN "id" DROP DEFAULT;
    `;
    console.log("✅ Removed default from id column");
    
    // Verify
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'id';
    `;
    
    console.log("\nUpdated id column:");
    console.log(result);
    
    await prisma.$disconnect();
    console.log("\n✅ ID column fix complete!");
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixIdColumn();
