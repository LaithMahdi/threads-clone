import { fetchUserPosts } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation';
import React from 'react'
import ThreadCard from '../cards/ThreadCard';

interface ThreadTabProps{
    currentUserId : string,
    accountId : string,
    accountType : string
}

const ThreadTab = async ({
    currentUserId,
accountId,
accountType
}:ThreadTabProps) => {
    let result = await fetchUserPosts(accountId);
    if (!result)  redirect('/')
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : { name: thread.name, image: thread.image, id: thread.id }
          }
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
}

export default ThreadTab