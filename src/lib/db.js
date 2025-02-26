import mongoose from 'mongoose';

export default async function connectDB() 
{
    if (mongoose.connection.readyState >= 1) 
    {
        return;
    }
    await mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error(err);
    });
}
