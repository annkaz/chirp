import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile-image"
        className="h-12 w-12 rounded-full"
        width="48"
        height="48"
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostViewProps = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostViewProps) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="post-profile-image"
        className="h-12 w-12 rounded-full"
        width="48"
        height="48"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`· ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading)
    return <div className="flex h-screen justify-center">Loading...</div>;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn ? (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            ) : (
              <CreatePostWizard />
            )}
          </div>
          <div className="flex flex-col">
            {[...data, ...data]?.map((fullPost) => (
              <PostView key={fullPost.post.id} {...fullPost} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
