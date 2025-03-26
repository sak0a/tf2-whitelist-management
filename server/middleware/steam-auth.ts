import { defineEventHandler, readBody, getQuery, setCookie } from 'h3';
import jwt, { SignOptions } from 'jsonwebtoken';
import axios from 'axios';

export default defineEventHandler(async (event) => {
    const url = event.node.req.url;
    const config = useRuntimeConfig();
    const JWT_SECRET = config.jwtSecret;
    const STEAM_API_KEY = config.steamApiKey;

    if (url?.startsWith('/api/steam/validate')) {
        const body = await readBody(event);
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
                const token = jwt.sign(payload, JWT_SECRET, {
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
    }

    if (url?.startsWith('/api/steam/user')) {
        const query = getQuery(event);

        try {
            const response = await axios.get(
                `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${query.steamid}`
            );

            // Get VAC status
            const banResponse = await axios.get(
                `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${query.steamid}`
            );

            const userData = response.data.response.players[0];
            const banData = banResponse.data.players[0];

            return {
                ...response.data,
                bans: {
                    vacBanned: banData.VACBanned,
                    gameBans: banData.NumberOfGameBans,
                    daysSinceLastBan: banData.DaysSinceLastBan
                }
            };
        } catch (error) {
            console.error('Error fetching Steam user data:', error);
            throw createError({
                statusCode: 500,
                message: 'Failed to fetch Steam user data'
            });
        }
    }
});