import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
    // Clear the auth cookie
    deleteCookie(event, 'auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    return { success: true };
});