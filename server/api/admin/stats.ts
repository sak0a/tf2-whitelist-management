import { defineEventHandler, getCookie } from 'h3';
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

        // Get stats
        const total = await User.countDocuments();
        const pending = await User.countDocuments({ status: 'pending' });
        const approved = await User.countDocuments({ status: 'approved' });
        const denied = await User.countDocuments({ status: 'denied' });
        const removed = await User.countDocuments({ status: 'removed' });

        return {
            total,
            pending,
            approved,
            denied,
            removed
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw createError({
            statusCode: 500,
            message: 'An error occurred while fetching stats'
        });
    }
});