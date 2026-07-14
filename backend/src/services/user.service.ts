import { prisma } from "../config/database.config.js";
import { NotFoundException } from "../utils/app-error.js";

export const findByIdUserService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
            
        }
    })

    if(!user) {
        throw new NotFoundException("User not found");
    }
    return user;
}

export const getUsersService = async (userId: string) => {
    const users = await prisma.user.findMany({
        where: {
            id: {
                not: userId
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return users;
}