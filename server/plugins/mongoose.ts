import mongoose from 'mongoose';

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
});