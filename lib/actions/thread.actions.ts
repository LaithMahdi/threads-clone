"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { conncetToDB } from "../mongoose";

interface ThreadParams{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}
export async function createThread({text,author,communityId,path}:ThreadParams){
   try {
    conncetToDB();
    const createdThread = await Thread.create({
        text,
        author,
        community:null,
    })

    await User.findByIdAndUpdate(author,{
        $push:{ threads: createdThread._id}
    })
    revalidatePath(path);
   } catch (error :any) {
        throw new Error(`Error creating thread : ${error.message}`);
   }
}


export async function fetchThreads(pageNumber: 1, pageSize: 20) {

    conncetToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const postsQuery = Thread.find({
        parentId: { $in: [null, undefined] }
    }).sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: '_id name parentId image'
            }
        })

    const totalPostsCount = await Thread.countDocuments({
        parentId: { $in: [null, undefined] }
    })
    const posts = await postsQuery.exec();
    const isNext = totalPostsCount > skipAmount + posts.length;
    return { posts, isNext };

}


export async function fetchThreadById(threadId: string) {
    conncetToDB();
    try {
        const thread = await Thread.findById(threadId)
            .populate({ path: 'author', model: User, select: '_id id name image' })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image',
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id id name parentId image',
                        }
                    }
                ]
            }).exec();
        return thread;
    } catch (error: any) {
        throw new Error(`Erro fetch thread: ${error.message}`);
    }
}


export async function addCommentToThread(
    threadId: string, commentText: string,
    userId: string,
    path: string
) {
    conncetToDB();

    try {
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found")
        }

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        const savedCommentThread = await commentThread.save();
        originalThread.children.push(savedCommentThread._id);
        await originalThread.save();
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Erro adding comment to thread: ${error.message}`);
    }
}