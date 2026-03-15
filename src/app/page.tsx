"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/utils";
import JoinForm from "@/components/JoinForm";

export default function Home() {
  const router = useRouter();
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = () => {
    const code = generateRoomCode();
    router.push(`/host/${code}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-6xl font-black tracking-tight mb-2">
        ROAST<span className="text-orange-500">.</span>
      </h1>
      <p className="text-neutral-400 text-lg mb-12">AI-powered party games</p>

      {!showJoin ? (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handleCreate}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold
                       py-4 px-8 rounded-2xl text-xl transition-colors
                       focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Create Room
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold
                       py-4 px-8 rounded-2xl text-xl transition-colors
                       focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Join Room
          </button>
        </div>
      ) : (
        <JoinForm onBack={() => setShowJoin(false)} />
      )}
    </main>
  );
}
