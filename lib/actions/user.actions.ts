"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { conncetToDB } from "../mongoose"
import Thread from "../models/thread.model";

interface UserParams {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}

export async function updateUser(
    {
        userId,
        username,
        name,
        bio,
        image,
        path,
    }: UserParams
): Promise<void> {
    conncetToDB();


    try {
        await User.findOneAndUpdate({ id: userId }, {
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true
        }, { upsert: true });

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}


export async function fetchUser(userId: string) {
    try {
        conncetToDB();
        return await User
            .findOne({ id: userId })
            // .populate({
            //     path: 'Communities',
            //     model: Community
            // })
    } catch (error:any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        conncetToDB();
        const threads = await User.findOne({ id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })
        return threads;
    } catch (error:any) {
        throw new Error(`Failed to fetch thread: ${error.message}`);
    }
}