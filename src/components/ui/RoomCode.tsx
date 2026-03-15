interface RoomCodeProps {
  code: string;
  size?: "sm" | "lg";
}

export default function RoomCode({ code, size = "lg" }: RoomCodeProps) {
  const textSize = size === "lg" ? "text-7xl sm:text-9xl md:text-[12rem]" : "text-4xl";

  return (
    <div className="flex flex-col items-center">
      {size === "lg" && (
        <p className="text-neutral-400 text-lg mb-2">Join at roast.gg</p>
      )}
      <p
        className={`${textSize} font-black tracking-[0.3em] font-mono
                     text-orange-500 leading-none`}
      >
        {code}
      </p>
    </div>
  );
}
