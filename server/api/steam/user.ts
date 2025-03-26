import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const config = useRuntimeConfig();
    const STEAM_API_KEY = config.steamApiKey;

    if (!query.steamid) {
        throw createError({
            statusCode: 400,
            message: 'Steam ID is required'
        });
    }

    try {
        // Get basic user data
        const userResponse = await axios.get(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${query.steamid}`
        );

        // Get ban status
        const banResponse = await axios.get(
            `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${query.steamid}`
        );

        const userData = userResponse.data;
        const banData = banResponse.data.players[0];

        return {
            ...userData,
            bans: {
                vacBanned: banData.VACBanned,
                gameBans: banData.NumberOfGameBans,
                daysSinceLastBan: banData.DaysSinceLastBan,
                economyBan: banData.EconomyBan
            }
        };
    } catch (error) {
        console.error('Error fetching Steam user data:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch Steam user data'
        });
    }
});