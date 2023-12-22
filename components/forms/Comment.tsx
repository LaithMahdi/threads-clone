"use client"

import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "../ui/input";
import { commentValidation } from "@/lib/validations/thread";
import { Button } from "../ui/button";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";


interface ThreadDetailProps {
  threadId: string;
  currentUserImage: string;
  currentUserId: string;
}

const Comment = ({
  threadId,
  currentUserImage,
  currentUserId,
}: ThreadDetailProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const form = useForm({
      resolver: zodResolver(commentValidation),
      defaultValues: {
        thread: "",
      },
    });
  
    const onSubmit = async (values: z.infer<typeof commentValidation>) => {
    await addCommentToThread(threadId,values.thread,JSON.parse(currentUserId),pathname);
        form.reset();
      //router.push("/");
    };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="comment-form"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
                <Image src={currentUserImage} alt="Profile Image" width={48} height={48} className="rounded-full object-cover" />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input type="text" placeholder="Comment..." {...field} className="no-focus text-light-1 outline-none" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="comment-form_btn">
        Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment