import { getProjectById } from '@/services/projectService';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        const user = await authMiddleware(req, res);
        if (!user) return;

        const { projectId } = req.query;
        const project = await getProjectById({ projectId });

        return res.status(200).json({ project });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
