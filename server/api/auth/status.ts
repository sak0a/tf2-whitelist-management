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
        const decoded = jwt.verify(token, config.jwtSecret) as { steamId: string, type: string };

        if (decoded.type !== 'steam_auth') {
            throw createError({
                statusCode: 401,
                message: 'Invalid token type'
            });
        }

        // Find user in database to get submission status
        const user = await User.findOne({ steamId: decoded.steamId });

        return {
            steamId: decoded.steamId,
            status: user?.status || null,
            isSubmitted: !!user
        };
    } catch (error) {
        console.error('Error checking status:', error);
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        });
    }
});