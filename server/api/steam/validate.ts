import { defineEventHandler, readBody, setCookie } from 'h3';
import jwt, { SignOptions } from 'jsonwebtoken';
import axios from 'axios';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig();

    try {
        const response = await axios.post('https://steamcommunity.com/openid/login', body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data.includes('is_valid:true')) {
            // Extract Steam ID from the validation response
            const steamId = body['openid.claimed_id']?.match(/(\d+)$/)?.[1];

            if (steamId) {
                const isAdmin = steamId === config.adminSteamId;

                const payload = {
                    steamId,
                    type: 'steam_auth',
                    isAdmin
                };

                // Create JWT token with Steam ID and additional claims
                const token = jwt.sign(payload, config.jwtSecret, {
                    expiresIn: config.jwtExpiry || '7d'
                } as SignOptions);

                // Set JWT as an HTTP-only cookie
                setCookie(event, 'auth_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 7d
                });
            }
        }

        return response.data;
    } catch (error) {
        console.error('Steam validation error:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to validate Steam login'
        });
    }
});