import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/api/helpers/ssgHelper";
import { api } from "~/utils/api";

const ProfileFeed = ({ userId }: { userId: string }) => {
  const { data: posts, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId,
  });

  if (isLoading) return <LoadingPage />;
  if (!posts || posts.length === 0) return <div>No posts</div>;

  return (
    <div className="flex flex-col">
      {posts.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-b border-slate-400 bg-slate-600">
          <Link href="/" className="pl-4">
            ←
          </Link>
          <Image
            src={data.profileImageUrl}
            alt="profile-pic"
            width={128}
            height={128}
            className="absolute bottom-0 left-4 -mb-[64px] rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="border-b border-slate-400">
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = generateSSGHelper();

  const slug = ctx.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
