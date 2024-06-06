import Link from 'next/link';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div>
          Powered by{' '}
          <a
            href="https://openai.com/blog/chatgpt"
            target="_blank"
            className="font-bold hover:underline transition underline-offset-2"
          >
            ChatGPT{' '}
          </a>
          and{' '}
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            className="font-bold hover:underline transition underline-offset-2"
          >
            Vercel AI SDK
          </a>
          and{' '}
          <a
            aria-label="Github Repository"
            href="https://github.com/vercel/nextjs-subscription-payments"
          >
            <GitHub />
          </a>
        </div>
        <div className="flex flex-col items-center justify-between py-12 space-y-4 md:flex-row bg-zinc-900">
          <div>
            <span>
              &copy; {new Date().getFullYear()} ACME, Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-white">Crafted by</span>
            <a href="https://vercel.com" aria-label="Vercel.com Link">
              <img
                src="/vercel.svg"
                alt="Vercel.com Logo"
                className="inline-block h-6 ml-4 text-white"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
