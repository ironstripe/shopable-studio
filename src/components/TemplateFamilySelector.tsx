import { Check, ShoppingBag, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATE_FAMILIES, TemplateFamilyId } from "@/types/templates";
import { useLocale } from "@/lib/i18n";

interface TemplateFamilySelectorProps {
  value: TemplateFamilyId;
  onChange: (value: TemplateFamilyId) => void;
  disabled?: boolean;
}

// Simple icon mapping for each family
const getFamilyIcon = (familyId: TemplateFamilyId) => {
  switch (familyId) {
    case "ecommerce":
      return <ShoppingBag className="w-5 h-5 text-blue-600" />;
    case "luxury":
      return <Sparkles className="w-5 h-5 text-amber-600" />;
    case "seasonal":
      return <Calendar className="w-5 h-5 text-rose-500" />;
    default:
      return <ShoppingBag className="w-5 h-5 text-muted-foreground" />;
  }
};

const TemplateFamilySelector = ({
  value,
  onChange,
  disabled = false,
}: TemplateFamilySelectorProps) => {
  const { t } = useLocale();

  return (
    <div className="space-y-2">
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
            {/* Simple icon - NOT a preview */}
            <div
              className={cn(
                "w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors",
                isSelected ? "bg-primary/10" : "bg-muted"
              )}
            >
              {getFamilyIcon(family.id)}
            </div>

            {/* Name + subtitle */}
            <div className="flex-1 text-left min-w-0">
              <div
                className={cn(
                  "text-[14px] font-medium truncate",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {t(`family.${family.id}.name`)}
              </div>
              <div className="text-[12px] text-muted-foreground truncate">
                {t(`family.${family.id}.subtitle`)}
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
