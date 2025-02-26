import Project from '../models/projectModel.js';
import mongoose from 'mongoose';
import dbConnect from '../lib/db.js';

export const createProject = async ({ name, userId }) => {
    if (!name || !userId) 
    {
        throw new Error('Name and userId are required');
    }

    try 
    {
        return await Project.create({ name, users: [userId] });
    } 
    catch (error) 
    {
        if (error.code === 11000) 
        {
            throw new Error('Project name already exists');
        }
        throw error;
    }
};

export const getAllProjectsByUserId = async ({ userId }) => {
    if (!userId) throw new Error('UserId is required');
    return await Project.find({ users: userId });
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
    if (!mongoose.Types.ObjectId.isValid(projectId) || !users.length) {
        throw new Error("Invalid projectId or users array");
    }

    const project = await Project.findOne({ _id: projectId, users: userId });

    if (!project) {
        throw new Error("User does not belong to this project");
    }

    return await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );
};

export const getProjectById = async ({ projectId }) => {
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    console.log(Project.findById(projectId).populate('users'));
    return await Project.findById(projectId).populate('users');
};