import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATE_FAMILIES, TemplateFamilyId } from "@/types/templates";
import HotspotStylePreview from "./HotspotStylePreview";

interface TemplateFamilySelectorProps {
  value: TemplateFamilyId;
  onChange: (value: TemplateFamilyId) => void;
  disabled?: boolean;
}

const TemplateFamilySelector = ({
  value,
  onChange,
  disabled = false,
}: TemplateFamilySelectorProps) => {
  return (
    <div className="space-y-2 max-h-[220px] overflow-y-auto">
      {TEMPLATE_FAMILIES.map((family) => {
        const isSelected = value === family.id;

        return (
          <button
            key={family.id}
            onClick={() => onChange(family.id)}
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-3 px-3 h-14 rounded-xl transition-all duration-150",
              isSelected
                ? "border-2 border-primary bg-primary/5"
                : "border border-border hover:border-muted-foreground/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Small preview thumbnail */}
            <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden">
              <HotspotStylePreview
                family={family.id}
                hotspotStyle={family.mainStyle}
                isActive={isSelected}
                ctaLabel="Shop"
                compact
              />
            </div>

            {/* Name + subtitle */}
            <div className="flex-1 text-left min-w-0">
              <div
                className={cn(
                  "text-[14px] font-medium truncate",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {family.name}
              </div>
              <div className="text-[12px] text-muted-foreground truncate">
                {family.subtitle}
              </div>
            </div>

            {/* Radio indicator */}
            <div
              className={cn(
                "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TemplateFamilySelector;
