import { prisma } from "./lib/prisma";

async function addMissingColumns() {
  try {
    console.log("Adding missing columns to User table...");
    
    // Add password column
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT '';
    `;
    console.log("✅ Added password column");
    
    // Add phone column
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';
    `;
    console.log("✅ Added phone column");
    
    // Add role column with enum type
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('DONOR', 'ADMIN', 'STAFF');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'DONOR'::"Role";
    `;
    console.log("✅ Added role column");
    
    // Add updatedAt column
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `;
    console.log("✅ Added updatedAt column");
    
    // Verify
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.log("\nUpdated User table columns:");
    console.log(result);
    
    await prisma.$disconnect();
    console.log("\n✅ Schema update complete!");
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addMissingColumns();
