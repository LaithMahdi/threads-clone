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