
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateBillboards() {
     try {
          await prisma.billboard.updateMany({
               where: {}, // Update all billboards
               data: {
                    isFeatured: false, // Or true, or null, depending on your default
               },
          });
          console.log("Billboards updated successfully.");
     } catch (error) {
          console.error("Error updating billboards:", error);
     } finally {
          await prisma.$disconnect();
     }
}

updateBillboards();