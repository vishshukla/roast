interface PlayerAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export default function PlayerAvatar({ name, color, size = "md" }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium truncate max-w-[120px]">{name}</span>
    </div>
  );
}
