import axios from 'axios';

export interface SteamUser {
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatar: string;
    avatarMedium: string;
    avatarFull: string;
    realName: string | null;
    vacBanned: boolean;
    gameBans: number;
    daysSinceLastBan: number;
}

export class SteamAuthService {
    private readonly returnUrl: string;

    constructor() {
        const config = useRuntimeConfig().public;
        this.returnUrl = `${config.apiBase}/auth/callback`;

        if (process.client) {
            this.setupAxiosInterceptors();
        }
    }

    private setupAxiosInterceptors() {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.logout();
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async login(): Promise<void> {
        if (!process.client) return;

        const openIdParams = new URLSearchParams({
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': this.returnUrl,
            'openid.realm': window.location.origin,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        });

        window.location.href = `https://steamcommunity.com/openid/login?${openIdParams}`;
    }

    async validateLogin(params: Record<string, string>): Promise<boolean> {
        try {
            const validationParams = new URLSearchParams({
                ...params,
                'openid.mode': 'check_authentication'
            });

            const response = await axios.post('/api/steam/validate', validationParams);
            return response.data.includes('is_valid:true');
        } catch (error) {
            console.error('Steam validation error:', error);
            return false;
        }
    }

    async getUserInfo(steamId: string): Promise<SteamUser> {
        try {
            const response = await axios.get(`/api/steam/user?steamid=${steamId}`);
            const player = response.data.response.players[0];
            const bans = response.data.bans;

            return {
                steamId: player.steamid,
                personaName: player.personaname,
                profileUrl: player.profileurl,
                avatar: player.avatar,
                avatarMedium: player.avatarmedium,
                avatarFull: player.avatarfull,
                realName: player.realname || null,
                vacBanned: bans.vacBanned,
                gameBans: bans.gameBans,
                daysSinceLastBan: bans.daysSinceLastBan
            };
        } catch (error) {
            console.error('Error fetching Steam user info:', error);
            throw error;
        }
    }

    extractSteamId(params: Record<string, string>): string | null {
        const matched = params['openid.claimed_id']?.match(/(\d+)$/);
        return matched ? matched[1] : null;
    }

    logout(): void {
        if (process.client) {
            const userStore = useUserStore();
            userStore.logout();

            // Send logout request to clear the auth cookie
            axios.post('/api/auth/logout')
                .catch(error => console.error('Logout error:', error));
        }
    }
}

export const steamAuth = new SteamAuthService();