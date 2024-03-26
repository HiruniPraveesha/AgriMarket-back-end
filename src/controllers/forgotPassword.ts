import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Endpoint to handle forgot password request
export async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
        // Find the user with the given email
        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a unique token for password reset
        const token = crypto.randomBytes(20).toString('hex');

        // Save the token and its associated user in the database
        await prisma.passwordResetTokens.create({
            data: {
                email: user.email,
                token,
                expiresAt: new Date(Date.now() + 3600000) // Token expires in 1 hour
            }
        });

        // Return the token to the user
        return res.status(200).json({ message: 'Password reset token generated successfully', token });
    } catch (error) {
        console.error("Error generating password reset token:", error);
        res.status(500).json({ error: "An error occurred while generating password reset token" });
    }
}

// Endpoint to handle password reset
export async function resetPassword(req: Request, res: Response) {
    const { email, token, newPassword } = req.body;

    try {
        // Find the password reset token in the database
        const resetToken = await prisma.passwordResetTokens.findFirst({
            where: {
                email,
                token,
                expiresAt: {
                    gt: new Date() // Check if token is not expired
                }
            }
        });

        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.users.update({
            where: { email },
            data: {
                password: hashedPassword
            }
        });

        // Delete the password reset token from the database
        await prisma.passwordResetTokens.deleteMany({
            where: { email }
        });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "An error occurred while resetting password" });
    }
}
