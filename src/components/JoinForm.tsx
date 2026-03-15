"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_NAME_LENGTH } from "@/lib/constants";

export default function JoinForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleJoin = () => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (trimmedCode.length === 4 && trimmedName) {
      router.push(
        `/play/${trimmedCode}?name=${encodeURIComponent(trimmedName)}`
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <input
        type="text"
        placeholder="Room Code"
        aria-label="Room Code"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="bg-neutral-800 text-white text-center text-2xl font-mono
                   tracking-[0.5em] py-4 px-6 rounded-2xl outline-none
                   focus:ring-2 focus:ring-orange-500 uppercase placeholder:tracking-normal"
      />
      <input
        type="text"
        placeholder="Your Name"
        aria-label="Your Name"
        maxLength={MAX_NAME_LENGTH}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && code.length === 4 && name.trim() && handleJoin()}
        className="bg-neutral-800 text-white text-center text-xl
                   py-4 px-6 rounded-2xl outline-none
                   focus:ring-2 focus:ring-orange-500"
      />
      <button
        onClick={handleJoin}
        disabled={code.length !== 4 || !name.trim()}
        className="bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700
                   disabled:text-neutral-500 text-white font-bold
                   py-4 px-8 rounded-2xl text-xl transition-colors"
      >
        Join
      </button>
      <button
        onClick={onBack}
        className="text-neutral-400 hover:text-white transition-colors py-3 min-h-[48px]"
      >
        &larr; Back
      </button>
    </div>
  );
}
