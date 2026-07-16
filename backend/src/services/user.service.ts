import { prisma } from "../config/database.config.js";
import { NotFoundException } from "../utils/app-error.js";
import cloudinary from "../config/cloudinary.config.js";

export const findByIdUserService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            tokenVersion: true,
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

export const updateAvatarService = async (userId: string, avatarBase64: string | null) => {
    let secure_url = null;
    
    if (avatarBase64) {
        const uploadRes = await cloudinary.uploader.upload(avatarBase64, {
            folder: "huddle-chat/avatars"
        });
        secure_url = uploadRes.secure_url;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: secure_url },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return updatedUser;
}