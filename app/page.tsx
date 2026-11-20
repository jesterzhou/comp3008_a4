import Image from "next/image";
import Header from "../components/header.jsx";
import MyAnimeList from "../components/myanimelist.jsx";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white text-black">
      <main className="flex flex-1 w-full flex-col items-center py-4 px-32">
        <Suspense>
          <Header title={""}/>
        </Suspense>

        <MyAnimeList/>
      </main>
    </div>
  );
}
