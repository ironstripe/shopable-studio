import { Hotspot } from "@/types/video";

interface VideoHotspotProps {
  hotspot: Hotspot;
  currentTime: number;
  onClick: (e: React.MouseEvent) => void;
}

const VideoHotspot = ({ hotspot, currentTime, onClick }: VideoHotspotProps) => {
  const countdown = Math.ceil(hotspot.timeEnd - currentTime);
  const isActive = currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd;

  if (!isActive) return null;

  return (
    <div
      className="absolute cursor-pointer hotspot-pulse z-10"
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {/* Monitor screen */}
        <div className="relative bg-primary border-4 border-shopable-black rounded-2xl w-16 h-12 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">{countdown}</span>
        </div>
        {/* Monitor stand */}
        <div className="w-12 h-2 bg-shopable-black rounded-sm mt-1" />
      </div>
    </div>
  );
};

export default VideoHotspot;
