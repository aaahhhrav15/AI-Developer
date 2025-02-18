import { addUsersToProject } from '@/services/projectService';
import { authMiddleware } from '@/middleware/authMiddleware';
import User from '@/models/userModel';

export default async function handler(req, res) {
    if (req.method !== 'PUT') return res.status(405).end();

    try {
        const user = await authMiddleware(req, res);
        if (!user) return;

        const { projectId, users } = req.body;
        const loggedInUser = await User.findOne({ email: user.email });

        const updatedProject = await addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });

        return res.status(200).json({ project: updatedProject });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
