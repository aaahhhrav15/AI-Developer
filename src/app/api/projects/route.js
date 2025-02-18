import { createProject } from '@/services/projectService';
import { authUser } from '@/middleware/authMiddleware';
import User from '@/models/userModel';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const user = await authUser(req, res);
        if (!user) return;

        const { name } = req.body;
        const loggedInUser = await User.findOne({ email: user.email });

        const newProject = await createProject({ name, userId: loggedInUser._id });

        return res.status(201).json(newProject);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
