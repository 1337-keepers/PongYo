'use client';

import { Button } from '@/components/ui/button';
import { env } from '@/env.mjs';
import { type User } from '@/types/user';
import { fetcher } from '@/utils/fetcher';
import { type GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookie = context.req.headers.cookie;
    (
      await fetcher.get<User>(`/users/@me`, {
        baseURL: `${env.NEXT_PUBLIC_DOCKER_BACKEND_ORIGIN}/api/`,
        headers: {
          Cookie: cookie ?? '',
        },
      })
    ).data;
    return {
      redirect: {
        destination: '/profile/@me',
        permanent: false,
      },
    };
  } catch (err) {
    return {
      props: {},
    };
  }
};

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex h-[420px] w-[350px] flex-col items-center justify-center rounded-[63px] border font-['outfit'] sm:h-[385px] sm:w-[541px]">
        <div className="mb-[40px] flex h-[84px] w-[65px] justify-center">
          <Image src={'/logo.png'} alt="image" width={500} height={500} />
        </div>
        <div className="mb-[20px] text-[30px] font-bold">Welcome to PongYo</div>
        <div className="mb-[20px] ml-[50px] mr-[50px] text-center text-[15px]">
          Step into the world of competitive ping pong and experience the
          excitement of real-time multiplayer matches right from the comfort of
          your own device
        </div>
        <Button
          onClick={() =>
            void router.push(env.NEXT_PUBLIC_BACKEND_ORIGIN + '/api/auth/42')
          }
          className="flex items-center justify-center rounded-full border bg-white text-black hover:text-white"
        >
          Sign in with
          <Image
            className="ml-[5px] mt-[3px]"
            src={'/42.png'}
            alt="image"
            width={21}
            height={16}
          />
        </Button>
      </div>
    </div>
  );
}
