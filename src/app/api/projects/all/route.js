import { getAllProjectsByUserId } from '@/services/projectService';
import { authMiddleware } from '@/middleware/authMiddleware';
import User from '@/models/userModel';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        const user = await authMiddleware(req, res);
        if (!user) return;

        const loggedInUser = await User.findOne({ email: user.email });

        const projects = await getAllProjectsByUserId({ userId: loggedInUser._id });

        return res.status(200).json({ projects });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
