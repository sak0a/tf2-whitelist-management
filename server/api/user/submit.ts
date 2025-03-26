import { defineEventHandler, readBody, getCookie, getRequestIP } from 'h3';
import jwt from 'jsonwebtoken';
import { User } from '~/server/models/User';
import axios from 'axios';

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

        // Check if user already submitted
        const existingUser = await User.findOne({ steamId: decoded.steamId });
        if (existingUser) {
            return {
                success: false,
                message: 'You have already submitted an application',
                status: existingUser.status
            };
        }

        // Get user info from Steam
        const steamResponse = await axios.get(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${decoded.steamId}`
        );

        const banResponse = await axios.get(
            `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${config.steamApiKey}&steamids=${decoded.steamId}`
        );

        const steamUser = steamResponse.data.response.players[0];
        const banInfo = banResponse.data.players[0];

        // Get form data from request
        const body = await readBody(event);
        const ipAddress = getRequestIP(event, { xForwardedFor: true });

        // Create new user record
        const user = new User({
            steamId: decoded.steamId,
            personaName: steamUser.personaname,
            profileUrl: steamUser.profileurl,
            avatar: steamUser.avatar,
            avatarFull: steamUser.avatarfull,
            discordUsername: body.discordUsername,
            ipAddress,
            submissionTime: new Date(),
            status: 'pending',
            vacStatus: banInfo.VACBanned,
            additionalInfo: {
                ...body.additionalInfo,
                gameBans: banInfo.NumberOfGameBans,
                daysSinceLastBan: banInfo.DaysSinceLastBan
            }
        });

        await user.save();

        return {
            success: true,
            message: 'Application submitted successfully',
            status: 'pending'
        };
    } catch (error) {
        console.error('Error submitting application:', error);
        throw createError({
            statusCode: 500,
            message: 'An error occurred while submitting your application'
        });
    }
});