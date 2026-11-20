"use client";

import Header from "../../components/header.jsx";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white text-black">
      <main className="flex flex-1 w-full flex-col items-center py-4 px-32">
        <Header/>
        <div className="mt-[18%] mb-[12pt] text-xl">Page Not Found</div>
    <button
      onClick={() => router.push("/")}
      className="rounded-xs bg-[#3154a1] px-2 py-1 text-white font-medium transition-colors hover:bg-[#24458b]"
    >
      Return Home
    </button>
      </main>
    </div>
    )
}