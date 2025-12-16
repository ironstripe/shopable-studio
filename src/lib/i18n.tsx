import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Locale = "de" | "en";

const STORAGE_KEY = "shopable_locale";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // App
    "app.language.de": "Deutsch",
    "app.language.en": "English",

    // Upload
    "upload.title": "Upload your video",
    "upload.loading": "Loading video...",
    "upload.loadingHint": "This may take a moment on mobile devices.",
    "upload.subtitle": "Tap to choose from your gallery.",
    "upload.success": "Video loaded successfully",
    "upload.error": "Failed to load video",
    "upload.invalidFile": "Please select a valid video file",

    // Header
    "header.untitled": "Untitled Video",
    "header.export": "Export",
    "header.replace": "Replace video",
    "header.replaceHelper": "Keeps link, hotspots and analytics",
    "header.delete": "Delete video",
    "header.deleteTitle": "Delete video",
    "header.deleteConfirmation": "This will permanently delete the video and all hotspots. This action cannot be undone.",
    "header.settings": "Video settings",
    "header.help": "Help & Feedback",

    // Editor
    "editor.tabs.edit": "Edit",
    "editor.tabs.preview": "Preview",
    "editor.tabs.hotspots": "Hotspots",
    "editor.mode.edit": "Edit mode enabled",
    "editor.mode.preview": "Preview mode",
    "editor.mode.editHint": "Tap on the video to add hotspots",
    "editor.mode.previewHint": "See how viewers will experience your video",
    "editor.hint.tapToAddHotspot": "Tap on the video to place your first hotspot.",
    "editor.hint.tapToAddAnother": "Tap the video again to add another hotspot.",

    // Hotspots
    "hotspots.title": "Hotspots",
    "hotspots.empty": "No hotspots yet",
    "hotspots.emptyHint": "Tap + Hotspot to add your first one",
    "hotspots.new": "New hotspot – assign product",
    "hotspots.newHint": "Tap to choose a product",
    "hotspots.deleteConfirm": "Delete this hotspot?",
    "hotspots.created": "Hotspot created!",
    "hotspots.deleted": "Hotspot deleted",
    "hotspots.deleteFailed": "Failed to delete hotspot. Please try again.",
    "hotspots.createFailed": "Failed to save hotspot. Changes are local only.",
    "hotspots.unknownProduct": "Unknown Product",

    // Layout
    "layout.title": "Layout & Behavior",
    "layout.templateFamily": "Template Family",
    "layout.style": "Style",
    "layout.ctaLabel": "CTA Label",
    "layout.ctaPlaceholder": "e.g. Shop Now",
    "layout.clickBehavior": "Click Behavior",
    "layout.clickBehavior.showCard": "Show Card",
    "layout.clickBehavior.directLink": "Direct Link",
    "layout.clickBehavior.noClick": "No Click",
    "layout.timing": "Timing",
    "layout.timing.start": "Start Time",
    "layout.timing.duration": "Duration",
    "layout.timing.end": "End Time (auto)",
    "layout.countdown.title": "Countdown Timer",
    "layout.countdown.show": "Show countdown timer",
    "layout.countdown.subtitle": "Counts down hotspot duration",
    "layout.countdown.style": "Style",
    "layout.countdown.style.light": "Light",
    "layout.countdown.style.bold": "Bold",
    "layout.countdown.position": "Position",
    "layout.countdown.position.above": "Above",
    "layout.countdown.position.below": "Below",
    "layout.countdown.position.corner": "Corner",
    "layout.assignProductFirst": "Assign a product first",
    "layout.assignProductHint": "You need to assign a product before customizing layout & behavior.",

    // Product
    "product.choose": "Choose a product",
    "product.edit": "Edit product",
    "product.new": "New product",
    "product.search": "Search products…",
    "product.empty": "No products yet",
    "product.emptyHint": "Add your first product to link it to this hotspot.",
    "product.create": "Create product",
    "product.noResults": "No products found",
    "product.noResultsHint": "Try a different term or create a new product.",
    "product.change": "Change",
    "product.field.name": "Product name",
    "product.field.nameRequired": "Product name is required",
    "product.field.description": "Description",
    "product.field.descriptionHint": "Optional. Short description that appears in the product card.",
    "product.field.price": "Price",
    "product.field.pricePlaceholder": "e.g. €349",
    "product.field.url": "Product URL",
    "product.field.urlHint": "The link users see when they tap the product card.",
    "product.field.urlInvalid": "Please enter a valid URL (https://...)",
    "product.field.image": "Image URL",
    "product.field.imageUpload": "Add image",
    "product.field.imageChange": "Change",
    "product.field.cta": "Button label",
    "product.field.ctaPlaceholder": "e.g. Shop now",
    "product.field.promo": "Promo code",
    "product.field.promoPlaceholder": "e.g. SAVE20",
    "product.field.namePlaceholder": "e.g. Bose QuietComfort Ultra",
    "product.assigned": "Product assigned to hotspot",
    "product.created": "Product created",
    "product.updated": "Product updated",
    "product.removed": "Product removed from hotspot",

    // Families
    "family.ecommerce.name": "E-Commerce",
    "family.ecommerce.subtitle": "Clean cards for classic shop setups",
    "family.luxury.name": "Luxury",
    "family.luxury.subtitle": "Ultra-clean, subtle, premium brands",
    "family.seasonal.name": "Seasonal",
    "family.seasonal.subtitle": "Special event templates (Valentine, Easter, BF)",

    // Actions
    "actions.save": "Save",
    "actions.saveChanges": "Save changes",
    "actions.saveProduct": "Save product",
    "actions.cancel": "Cancel",
    "actions.delete": "Delete",
    "actions.new": "New",
    
    // Common
    "common.cancel": "Cancel",
    "actions.on": "On",
    "actions.off": "Off",
    "actions.or": "or",
    "actions.pasteUrl": "Paste image URL",

    // FTUX
    "ftux.welcome": "Welcome to Shopable.",
    "ftux.subtitle": "Turn your video into a shop.",
    "ftux.start": "Start",
    "ftux.productHint": "Choose a product or create a new one.",
    "ftux.previewHint": "Switch to Preview to see your final video.",
    "ftux.exportHint": "You can now export your Shopable video.",

    // Video
    "video.removed": "Video removed. Upload a new video to continue.",
    "video.exportSuccess": "Project exported successfully",

    // Export
    "export.title": "Export",
    "export.button": "Export video",
    "export.exporting": "Exporting…",
    "export.ready": "Video is ready to share",
    "export.lastUpdated": "Last updated",
    "export.copyUrl": "Copy share URL",
    "export.copied": "Link copied!",
    "export.needsExport": "Needs export",
    "export.readyToShare": "Ready to share",
    "export.success": "Export finished – video is ready to share",
    "export.rendering": "Your video is being rendered…",
    "export.failed": "Export failed, please try again",

    // Scene State
    "scene.noHotspotsHere": "No hotspots here — next at",
    "scene.jumpToNext": "Jump to next",
    "scene.needsProduct": "hotspot needs a product",
    "scene.needsProductPlural": "hotspots need a product",
    "scene.allCompleteHere": "All hotspots here complete — next at",
    "scene.continue": "Continue",
    "scene.allDone": "All hotspots complete",
    "scene.doneEditing": "Done Editing",
    "scene.nextHotspot": "Next Hotspot",

    // Dialog
    "dialog.deleteVideo.title": "Delete video?",
    "dialog.deleteVideo.description": "This will remove the video and all hotspots. Products will be preserved.",
    "dialog.deleteVideo.confirm": "Delete",
    "dialog.deleteVideo.cancel": "Cancel",
  },

  de: {
    // App
    "app.language.de": "Deutsch",
    "app.language.en": "English",

    // Upload
    "upload.title": "Video hochladen",
    "upload.loading": "Video wird geladen...",
    "upload.loadingHint": "Dies kann auf Mobilgeräten einen Moment dauern.",
    "upload.subtitle": "Tippe, um aus deiner Galerie zu wählen.",
    "upload.success": "Video erfolgreich geladen",
    "upload.error": "Video konnte nicht geladen werden",
    "upload.invalidFile": "Bitte wähle eine gültige Videodatei",

    // Header
    "header.untitled": "Unbenanntes Video",
    "header.export": "Exportieren",
    "header.replace": "Video ersetzen",
    "header.replaceHelper": "Behält Link, Hotspots und Statistiken",
    "header.delete": "Video löschen",
    "header.deleteTitle": "Video löschen",
    "header.deleteConfirmation": "Das Video und alle Hotspots werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
    "header.settings": "Videoeinstellungen",
    "header.help": "Hilfe & Feedback",

    // Editor
    "editor.tabs.edit": "Bearbeiten",
    "editor.tabs.preview": "Vorschau",
    "editor.tabs.hotspots": "Hotspots",
    "editor.mode.edit": "Bearbeitungsmodus aktiviert",
    "editor.mode.preview": "Vorschaumodus",
    "editor.mode.editHint": "Tippe auf das Video, um Hotspots hinzuzufügen",
    "editor.mode.previewHint": "Sieh dir an, wie Zuschauer dein Video erleben werden",
    "editor.hint.tapToAddHotspot": "Tippe auf das Video, um deinen ersten Hotspot zu setzen.",
    "editor.hint.tapToAddAnother": "Tippe erneut auf das Video, um einen weiteren Hotspot zu setzen.",

    // Hotspots
    "hotspots.title": "Hotspots",
    "hotspots.empty": "Noch keine Hotspots",
    "hotspots.emptyHint": "Tippe auf + Hotspot, um deinen ersten zu erstellen",
    "hotspots.new": "Neuer Hotspot – Produkt zuweisen",
    "hotspots.newHint": "Tippe, um ein Produkt zu wählen",
    "hotspots.deleteConfirm": "Diesen Hotspot löschen?",
    "hotspots.created": "Hotspot erstellt!",
    "hotspots.deleted": "Hotspot gelöscht",
    "hotspots.deleteFailed": "Hotspot konnte nicht gelöscht werden. Bitte erneut versuchen.",
    "hotspots.createFailed": "Hotspot konnte nicht gespeichert werden. Änderungen sind nur lokal.",
    "hotspots.unknownProduct": "Unbekanntes Produkt",

    // Layout
    "layout.title": "Layout & Verhalten",
    "layout.templateFamily": "Template-Familie",
    "layout.style": "Stil",
    "layout.ctaLabel": "CTA-Beschriftung",
    "layout.ctaPlaceholder": "z.B. Jetzt kaufen",
    "layout.clickBehavior": "Klickverhalten",
    "layout.clickBehavior.showCard": "Karte zeigen",
    "layout.clickBehavior.directLink": "Direkter Link",
    "layout.clickBehavior.noClick": "Kein Klick",
    "layout.timing": "Timing",
    "layout.timing.start": "Startzeit",
    "layout.timing.duration": "Dauer",
    "layout.timing.end": "Endzeit (automatisch)",
    "layout.countdown.title": "Countdown-Timer",
    "layout.countdown.show": "Countdown-Timer anzeigen",
    "layout.countdown.subtitle": "Zählt die Hotspot-Dauer herunter",
    "layout.countdown.style": "Stil",
    "layout.countdown.style.light": "Hell",
    "layout.countdown.style.bold": "Fett",
    "layout.countdown.position": "Position",
    "layout.countdown.position.above": "Über dem Inhalt",
    "layout.countdown.position.below": "Unter dem Inhalt",
    "layout.countdown.position.corner": "In der Ecke",
    "layout.assignProductFirst": "Zuerst ein Produkt zuweisen",
    "layout.assignProductHint": "Du musst ein Produkt zuweisen, bevor du Layout & Verhalten anpassen kannst.",

    // Product
    "product.choose": "Produkt auswählen",
    "product.edit": "Produkt bearbeiten",
    "product.new": "Neues Produkt",
    "product.search": "Produkte suchen…",
    "product.empty": "Noch keine Produkte",
    "product.emptyHint": "Erstelle dein erstes Produkt, um es mit diesem Hotspot zu verknüpfen.",
    "product.create": "Produkt erstellen",
    "product.noResults": "Keine Produkte gefunden",
    "product.noResultsHint": "Probiere einen anderen Begriff oder erstelle ein neues Produkt.",
    "product.change": "Ändern",
    "product.field.name": "Produktname",
    "product.field.nameRequired": "Produktname ist erforderlich",
    "product.field.description": "Beschreibung",
    "product.field.descriptionHint": "Optional. Kurze Beschreibung, die in der Produktkarte erscheint.",
    "product.field.price": "Preis",
    "product.field.pricePlaceholder": "z.B. 349€",
    "product.field.url": "Produkt-URL",
    "product.field.urlHint": "Der Link, den Nutzer sehen, wenn sie auf die Produktkarte tippen.",
    "product.field.urlInvalid": "Bitte gib eine gültige URL ein (https://...)",
    "product.field.image": "Bild-URL",
    "product.field.imageUpload": "Bild hinzufügen",
    "product.field.imageChange": "Ändern",
    "product.field.cta": "Button-Beschriftung",
    "product.field.ctaPlaceholder": "z.B. Jetzt kaufen",
    "product.field.promo": "Promocode",
    "product.field.promoPlaceholder": "z.B. SAVE20",
    "product.field.namePlaceholder": "z.B. Bose QuietComfort Ultra",
    "product.assigned": "Produkt dem Hotspot zugewiesen",
    "product.created": "Produkt erstellt",
    "product.updated": "Produkt aktualisiert",
    "product.removed": "Produkt vom Hotspot entfernt",

    // Families
    "family.ecommerce.name": "E-Commerce",
    "family.ecommerce.subtitle": "Klare Karten für klassische Shop-Setups",
    "family.luxury.name": "Luxus",
    "family.luxury.subtitle": "Ultra-clean, dezent, Premium-Marken",
    "family.seasonal.name": "Saisonal",
    "family.seasonal.subtitle": "Spezielle Event-Templates (Valentinstag, Ostern, BF)",

    // Actions
    "actions.save": "Speichern",
    "actions.saveChanges": "Änderungen speichern",
    "actions.saveProduct": "Produkt speichern",
    "actions.cancel": "Abbrechen",
    "actions.delete": "Löschen",
    "actions.new": "Neu",
    
    // Common
    "common.cancel": "Abbrechen",
    "actions.on": "An",
    "actions.off": "Aus",
    "actions.or": "oder",
    "actions.pasteUrl": "Bild-URL einfügen",

    // FTUX
    "ftux.welcome": "Willkommen bei Shopable.",
    "ftux.subtitle": "Verwandle dein Video in einen Shop.",
    "ftux.start": "Starten",
    "ftux.productHint": "Wähle ein Produkt oder erstelle ein neues.",
    "ftux.previewHint": "Wechsle zur Vorschau, um dein fertiges Video zu sehen.",
    "ftux.exportHint": "Du kannst dein Shopable-Video jetzt exportieren.",

    // Video
    "video.removed": "Video entfernt. Lade ein neues Video hoch, um fortzufahren.",
    "video.exportSuccess": "Projekt erfolgreich exportiert",

    // Export
    "export.title": "Export",
    "export.button": "Video exportieren",
    "export.exporting": "Exportiert…",
    "export.ready": "Video ist bereit zum Teilen",
    "export.lastUpdated": "Zuletzt aktualisiert",
    "export.copyUrl": "Link kopieren",
    "export.copied": "Link kopiert!",
    "export.needsExport": "Export nötig",
    "export.readyToShare": "Bereit zum Teilen",
    "export.success": "Export abgeschlossen – Video ist bereit zum Teilen",
    "export.rendering": "Dein Video wird gerendert…",
    "export.failed": "Export fehlgeschlagen, bitte erneut versuchen",

    // Scene State
    "scene.noHotspotsHere": "Keine Hotspots hier — nächster bei",
    "scene.jumpToNext": "Zum nächsten",
    "scene.needsProduct": "Hotspot braucht ein Produkt",
    "scene.needsProductPlural": "Hotspots brauchen ein Produkt",
    "scene.allCompleteHere": "Alle Hotspots hier fertig — nächster bei",
    "scene.continue": "Weiter",
    "scene.allDone": "Alle Hotspots fertig",
    "scene.doneEditing": "Bearbeitung abgeschlossen",
    "scene.nextHotspot": "Nächster Hotspot",

    // Dialog
    "dialog.deleteVideo.title": "Video löschen?",
    "dialog.deleteVideo.description": "Das Video und alle Hotspots werden entfernt. Produkte bleiben erhalten.",
    "dialog.deleteVideo.confirm": "Löschen",
    "dialog.deleteVideo.cancel": "Abbrechen",
  },
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "de" || stored === "en") {
        return stored;
      }
    }
    return "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? translations["en"][key] ?? key;
    },
    [locale],
  );

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
