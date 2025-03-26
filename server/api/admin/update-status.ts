import { defineEventHandler, readBody, getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { User } from '~/server/models/User';

export default defineEventHandler(async (event) => {
    try {
        const token = getCookie(event, 'auth_token');

        if (!token) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized'
            });
        }

        const config = useRuntimeConfig();
        const decoded = jwt.verify(token, config.jwtSecret) as { steamId: string, type: string, isAdmin: boolean };

        // Check if user is admin
        if (!decoded.isAdmin) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden'
            });
        }

        const body = await readBody(event);
        const { userId, status, reason } = body;

        if (!userId || !status) {
            throw createError({
                statusCode: 400,
                message: 'Missing required fields'
            });
        }

        // Update user status
        const updateData: Record<string, any> = { status };

        if (status === 'approved') {
            updateData.approvalTime = new Date();
            updateData.denialReason = undefined;
        } else if (status === 'denied') {
            updateData.denialTime = new Date();
            updateData.denialReason = reason || 'No reason provided';
        } else if (status === 'removed') {
            updateData.denialTime = new Date();
            updateData.denialReason = reason || 'No reason provided';
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            throw createError({
                statusCode: 404,
                message: 'User not found'
            });
        }

        return {
            success: true,
            user: updatedUser
        };
    } catch (error) {
        console.error('Error updating user status:', error);
        throw createError({
            statusCode: 500,
            message: 'An error occurred while updating user status'
        });
    }
});