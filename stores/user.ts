import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        steamId: '',
        personaName: '',
        avatar: '',
        profileUrl: '',
        isAuthenticated: false,
        isAdmin: false,
        submissionStatus: null as null | 'pending' | 'approved' | 'denied' | 'removed'
    }),

    actions: {
        setUser(userData: any) {
            this.steamId = userData.steamId;
            this.personaName = userData.personaName;
            this.avatar = userData.avatar;
            this.profileUrl = userData.profileUrl;
            this.isAuthenticated = true;
        },

        setAuthData(decodedToken: any) {
            this.steamId = decodedToken.steamId;
            this.isAuthenticated = true;
            this.isAdmin = decodedToken.isAdmin === true;
        },

        setSubmissionStatus(status: 'pending' | 'approved' | 'denied' | 'removed' | null) {
            this.submissionStatus = status;
        },

        logout() {
            this.steamId = '';
            this.personaName = '';
            this.avatar = '';
            this.profileUrl = '';
            this.isAuthenticated = false;
            this.isAdmin = false;
            this.submissionStatus = null;
        }
    }
});