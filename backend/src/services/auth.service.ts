import { prisma } from "../config/database.config.js";
import { UnauthorizedException, NotFoundException } from "../utils/app-error.js";
import type { RegisterSchemaType, LoginType } from "../validators/auth.validator.js";
import { hashValue, compareValue } from "../utils/bcrypt.js";

export const registerService = async (body: RegisterSchemaType) => {
    const { email, password, name, avatar } = body;
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingUser) {
        throw new UnauthorizedException("User already exists");
    }
    
    const hashedPassword = await hashValue(password);
    
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            avatar: avatar ?? null,
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
    
    return newUser;
};

export const loginService = async (body: LoginType) => {
    const { email, password } = body;
    
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new NotFoundException("Invalid email or password");
    }
    
    const isMatch = await compareValue(password, user.password);
    if (!isMatch) {
        throw new UnauthorizedException("Invalid email or password");
    }
    
    const { password: _, ...safeUser } = user;
    return safeUser;
};