import { defineEventHandler, getCookie, getQuery } from 'h3';
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

        const query = getQuery(event);
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter from query params
        const filter: Record<string, any> = {};

        if (query.search) {
            const searchRegex = new RegExp(String(query.search), 'i');
            filter.$or = [
                { personaName: searchRegex },
                { steamId: searchRegex },
                { discordUsername: searchRegex }
            ];
        }

        if (query.status) {
            filter.status = query.status;
        }

        // Get users with pagination
        const users = await User.find(filter)
            .sort({ submissionTime: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(filter);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw createError({
            statusCode: 500,
            message: 'An error occurred while fetching users'
        });
    }
});