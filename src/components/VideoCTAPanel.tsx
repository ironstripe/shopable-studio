import { useState } from "react";
import { VideoCTA, VideoCTAMode } from "@/types/video";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface VideoCTAPanelProps {
  videoCTA: VideoCTA;
  onUpdateCTA: (cta: VideoCTA) => void;
}

const VideoCTAPanel = ({ videoCTA, onUpdateCTA }: VideoCTAPanelProps) => {
  const [label, setLabel] = useState(videoCTA.label);
  const [url, setUrl] = useState(videoCTA.url);
  const [mode, setMode] = useState<VideoCTAMode>(videoCTA.mode);

  const handleSave = () => {
    onUpdateCTA({ label, url, mode });
  };

  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-4 space-y-4">
      <h3 className="text-[14px] font-semibold text-[#111827]">Video CTA</h3>

      <div className="space-y-3">
        <div>
          <Label className="text-[12px] text-[#6B7280] mb-1.5">CTA Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Shop Now"
            className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
          />
        </div>

        <div>
          <Label className="text-[12px] text-[#6B7280] mb-1.5">CTA URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="www.example.com or https://..."
            className="h-9 text-[13px] bg-white border-[#E0E0E0] text-[#111827]"
          />
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Protocol (https://) will be added automatically if not provided
          </p>
        </div>

        <div>
          <Label className="text-[12px] text-[#6B7280] mb-2">Display Mode</Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as VideoCTAMode)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="off" id="mode-off" />
              <Label htmlFor="mode-off" className="text-[13px] text-[#111827] cursor-pointer">
                Off
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="show-at-end" id="mode-end" />
              <Label htmlFor="mode-end" className="text-[13px] text-[#111827] cursor-pointer">
                Show at video end (last 3 seconds)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="always-visible" id="mode-always" />
              <Label htmlFor="mode-always" className="text-[13px] text-[#111827] cursor-pointer">
                Always visible
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-9 text-[13px] bg-[#3B82F6] hover:bg-[#2563EB] text-white"
        >
          Save CTA Settings
        </Button>
      </div>
    </div>
  );
};

export default VideoCTAPanel;
