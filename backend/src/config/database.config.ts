import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected via Prisma");
    }
    catch (error) {
        console.log(`Error while connecting to Database`, error);
    }
};

export default connectDatabase;