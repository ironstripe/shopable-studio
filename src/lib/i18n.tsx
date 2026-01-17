import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Locale = "de" | "en";

const STORAGE_KEY = "shopable_locale";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // App
    "app.language.de": "Deutsch",
    "app.language.en": "English",

    // Entry Screen
    "entry.headline": "Turn your video into sales.",
    "entry.subline": "Add shopping links directly into your video and turn views into conversions.",
    "entry.microTrust": "No setup. No code. Live in minutes.",

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
    "editor.hint.tapToAddHotspot": "Tap the video to place your first hotspot",
    "editor.hint.tapToAddAnother": "Tap the video to add another hotspot",

    // Hotspots
    "hotspots.title": "Hotspots",
    "hotspots.empty": "No hotspots yet",
    "hotspots.emptyHint": "Tap the video to add one",
    "hotspots.new": "New hotspot – assign product",
    "hotspots.newHint": "Tap to choose a product",
    "hotspots.deleteConfirm": "Delete this hotspot?",
    "hotspots.created": "Hotspot created!",
    "hotspots.deleted": "Hotspot deleted",
    "hotspots.deleteFailed": "Failed to delete hotspot. Please try again.",
    "hotspots.createFailed": "Failed to save hotspot. Changes are local only.",
    "hotspots.unknownProduct": "Unknown Product",
    "hotspots.alreadyExists": "A hotspot already exists at this time. Scrub to a different moment.",

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
    "product.fetchFromUrl": "Fetch",
    "product.fetchingData": "Loading product data...",
    "product.fetchSuccess": "Product data loaded!",
    "product.fetchError": "Could not load product data",
    "product.urlHintAuto": "Paste a product link to auto-fill details",

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
    "ftux.firstSuccess": "Nice. Your first product is linked.",
    "ftux.exitHint": "Next, you'll get your posting link and a ready-to-use caption.",

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

    // Help & Feedback Page
    "help.title": "Help & Feedback",
    "help.subtitle": "Quick answers. Clear guidance. Direct feedback.",
    
    // Quick Actions
    "help.quickActions.title": "Quick Actions",
    "help.quickActions.howHotspots": "How do hotspots work?",
    "help.quickActions.whyCantPlace": "Why can't I place a hotspot here?",
    "help.quickActions.whatIsSafeZone": "What is the safe zone?",
    "help.quickActions.reportProblem": "Report a problem",
    "help.quickActions.sendFeedback": "Send feedback",
    
    // FAQs
    "help.faq.title": "Frequently Asked Questions",
    "help.faq.howHotspotsWork.q": "How do hotspots work?",
    "help.faq.howHotspotsWork.a": "Tap anywhere on the video to place a hotspot. Then link it to a product. Viewers can tap the hotspot to see product details.",
    "help.faq.whyCantPlace.q": "Why can't I place a hotspot here?",
    "help.faq.whyCantPlace.a": "Some areas are reserved for platform UI (like TikTok buttons or captions). These are called safe zones. Place hotspots inside the safe area.",
    "help.faq.whatIsSafeZone.q": "What is the safe zone?",
    "help.faq.whatIsSafeZone.a": "The safe zone is the area of the video that won't be covered by platform controls. Hotspots placed here stay visible on TikTok, Reels, and Shorts.",
    "help.faq.howToEditHotspot.q": "How do I edit a hotspot?",
    "help.faq.howToEditHotspot.a": "Tap the hotspot to select it. Use the toolbar to change the product, adjust timing, or delete it.",
    "help.faq.howToDeleteHotspot.q": "How do I delete a hotspot?",
    "help.faq.howToDeleteHotspot.a": "Select the hotspot, then tap the trash icon in the toolbar. Confirm to delete.",
    "help.faq.whatIsPreviewMode.q": "What is Preview mode?",
    "help.faq.whatIsPreviewMode.a": "Preview mode shows how viewers will experience your video. Tap hotspots to see product cards, just like your audience will.",
    "help.faq.howToExport.q": "How do I export my video?",
    "help.faq.howToExport.a": "Once your hotspots are set up, tap Export. Your video will be processed and ready to share.",
    
    // How it works
    "help.howItWorks.title": "How it works",
    "help.howItWorks.step1": "Upload your video",
    "help.howItWorks.step2": "Tap to place hotspots",
    "help.howItWorks.step3": "Link products",
    "help.howItWorks.step4": "Share & publish",
    
    // Feedback
    "help.feedback.title": "Send Feedback",
    "help.feedback.placeholder": "What could be better?",
    "help.feedback.categoryLabel": "Category (optional)",
    "help.feedback.categoryBug": "Bug",
    "help.feedback.categoryUX": "UX issue",
    "help.feedback.categoryFeature": "Feature idea",
    "help.feedback.submit": "Send feedback",
    "help.feedback.success": "Thanks for your feedback!",
    
    // Report Problem
    "help.report.title": "Report a Problem",
    "help.report.placeholder": "What's not working?",
    "help.report.submit": "Report problem",
    "help.report.success": "Problem reported. We'll look into it.",
    
    // Contact
    "help.contact.title": "Contact",
    "help.contact.email": "support@shopable.one",
    "help.contact.responseTime": "We typically respond within 24 hours.",

    // Publish Flow
    "publish.title.ready": "Ready to publish",
    "publish.title.published": "Published",
    "publish.subline.ready": "Your video is ready. Publish it to make your Shop Link live.",
    "publish.subline.published": "Your landing page is live and ready to share.",
    "publish.button": "Publish to landing page",
    "publish.publishing": "Publishing...",
    "publish.helper": "Your Shop Link will go live instantly.",
    "publish.success": "Published! Your landing page is now live.",
    "publish.error": "Failed to publish. Please try again.",
    "publish.shopLink.label": "Your Shop Link",
    "publish.copyLink": "Copy link",
    "publish.openPage": "Open landing page",
    "publish.copied": "Copied!",
    "publish.linkCopied": "Link copied!",
    "publish.caption.label": "Caption",
    "publish.caption.placeholder": "Write your caption...",
    "publish.caption.helper": "Copy this caption into your social post.",
    "publish.caption.copy": "Copy caption",
    "publish.caption.copied": "Copied!",
    "publish.captionCopied": "Caption copied!",
    
    // Ready to Post Flow (legacy keys for compatibility)
    "readyToPost.button": "Ready to publish",
    "readyToPost.modal.title": "🔗 Your posting link",
    "readyToPost.modal.subline": "This is the link your followers will use to shop your video.",
    "readyToPost.modal.customUrl": "Custom URL",
    "readyToPost.modal.helper": "This link will be used in your bio and in your caption.",
    "readyToPost.modal.available": "This URL is available ✓",
    "readyToPost.modal.taken": "This URL is already taken. Please choose another.",
    "readyToPost.modal.continue": "Continue → Prepare caption",
    "readyToPost.page.exitLabel": "What would you like to do next?",
    "readyToPost.page.createNext": "Create next video",
    "readyToPost.page.backToVideos": "Back to dashboard",
    "readyToPost.page.logout": "Log out",

    // Reset Password
    "resetPassword.title": "Reset password",
    "resetPassword.subtitle": "Choose a new password for your account.",
    "resetPassword.expiredSubtitle": "This link has expired. Request a new one below.",
    "resetPassword.invalidSubtitle": "No password reset link found.",
    "resetPassword.invalidRequestSubtitle": "Enter your email below to request a reset link.",
    "resetPassword.loading": "Preparing password reset...",
    "resetPassword.newPassword": "New password",
    "resetPassword.newPasswordPlaceholder": "Min. 8 characters",
    "resetPassword.confirmPassword": "Confirm new password",
    "resetPassword.confirmPasswordPlaceholder": "Repeat password",
    "resetPassword.updateButton": "Update password",
    "resetPassword.updating": "Updating...",
    "resetPassword.backToSignIn": "Back to sign in",
    "resetPassword.error.noLink": "No password reset link found. Did you click the link in your email?",
    "resetPassword.error.expired": "This reset link has expired or was already used.",
    "resetPassword.error.tooShort": "Password must be at least 8 characters.",
    "resetPassword.error.mismatch": "Passwords don't match.",
    "resetPassword.error.sessionExpired": "Your session has expired. Please request a new reset link.",
    "resetPassword.success.title": "Password updated",
    "resetPassword.success.description": "You can now sign in with your new password.",
    "resetPassword.requestLink.emailLabel": "Email address",
    "resetPassword.requestLink.emailPlaceholder": "Enter your email",
    "resetPassword.requestLink.button": "Send new link",
    "resetPassword.requestLink.sending": "Sending...",
    "resetPassword.requestLink.sent": "Check your email for the new reset link.",
    "resetPassword.requestLink.error": "Could not send reset link",
  },

  de: {
    // App
    "app.language.de": "Deutsch",
    "app.language.en": "English",

    // Entry Screen
    "entry.headline": "Mach dein Video shoppable.",
    "entry.subline": "Füge Shop-Links direkt ins Video ein und verwandle Views in Conversions.",
    "entry.microTrust": "Kein Setup. Kein Code. In wenigen Minuten live.",

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
    "editor.hint.tapToAddHotspot": "Tippe ins Video, um deinen ersten Hotspot zu setzen",
    "editor.hint.tapToAddAnother": "Tippe ins Video, um einen weiteren Hotspot zu setzen",

    // Hotspots
    "hotspots.title": "Hotspots",
    "hotspots.empty": "Noch keine Hotspots",
    "hotspots.emptyHint": "Tippe aufs Video, um einen zu setzen",
    "hotspots.new": "Neuer Hotspot – Produkt zuweisen",
    "hotspots.newHint": "Tippe, um ein Produkt zu wählen",
    "hotspots.deleteConfirm": "Diesen Hotspot löschen?",
    "hotspots.created": "Hotspot erstellt!",
    "hotspots.deleted": "Hotspot gelöscht",
    "hotspots.deleteFailed": "Hotspot konnte nicht gelöscht werden. Bitte erneut versuchen.",
    "hotspots.createFailed": "Hotspot konnte nicht gespeichert werden. Änderungen sind nur lokal.",
    "hotspots.unknownProduct": "Unbekanntes Produkt",
    "hotspots.alreadyExists": "Es existiert bereits ein Hotspot zu diesem Zeitpunkt. Wischen Sie zu einem anderen Moment.",

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
    "product.fetchFromUrl": "Abrufen",
    "product.fetchingData": "Lade Produktdaten...",
    "product.fetchSuccess": "Produktdaten geladen!",
    "product.fetchError": "Produktdaten konnten nicht geladen werden",
    "product.urlHintAuto": "Füge einen Produkt-Link ein, um Daten automatisch auszufüllen",

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
    "ftux.firstSuccess": "Nice. Dein erstes Produkt ist verlinkt.",
    "ftux.exitHint": "Als Nächstes erhältst du deinen Posting-Link und eine fertige Caption.",

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

    // Help & Feedback Page
    "help.title": "Hilfe & Feedback",
    "help.subtitle": "Schnelle Antworten. Klare Anleitungen. Direktes Feedback.",
    
    // Quick Actions
    "help.quickActions.title": "Schnellzugriff",
    "help.quickActions.howHotspots": "Wie funktionieren Hotspots?",
    "help.quickActions.whyCantPlace": "Warum kann ich hier keinen Hotspot platzieren?",
    "help.quickActions.whatIsSafeZone": "Was ist die Safe Zone?",
    "help.quickActions.reportProblem": "Problem melden",
    "help.quickActions.sendFeedback": "Feedback senden",
    
    // FAQs
    "help.faq.title": "Häufig gestellte Fragen",
    "help.faq.howHotspotsWork.q": "Wie funktionieren Hotspots?",
    "help.faq.howHotspotsWork.a": "Tippe auf das Video, um einen Hotspot zu platzieren. Verknüpfe ihn dann mit einem Produkt. Zuschauer können auf den Hotspot tippen, um Produktdetails zu sehen.",
    "help.faq.whyCantPlace.q": "Warum kann ich hier keinen Hotspot platzieren?",
    "help.faq.whyCantPlace.a": "Einige Bereiche sind für Plattform-UI reserviert (z.B. TikTok-Buttons oder Untertitel). Diese nennt man Safe Zones. Platziere Hotspots im sicheren Bereich.",
    "help.faq.whatIsSafeZone.q": "Was ist die Safe Zone?",
    "help.faq.whatIsSafeZone.a": "Die Safe Zone ist der Bereich des Videos, der nicht von Plattform-Controls überdeckt wird. Hotspots hier bleiben auf TikTok, Reels und Shorts sichtbar.",
    "help.faq.howToEditHotspot.q": "Wie bearbeite ich einen Hotspot?",
    "help.faq.howToEditHotspot.a": "Tippe auf den Hotspot, um ihn auszuwählen. Nutze die Toolbar, um das Produkt zu ändern, das Timing anzupassen oder ihn zu löschen.",
    "help.faq.howToDeleteHotspot.q": "Wie lösche ich einen Hotspot?",
    "help.faq.howToDeleteHotspot.a": "Wähle den Hotspot aus und tippe auf das Papierkorb-Symbol in der Toolbar. Bestätige zum Löschen.",
    "help.faq.whatIsPreviewMode.q": "Was ist der Vorschaumodus?",
    "help.faq.whatIsPreviewMode.a": "Der Vorschaumodus zeigt, wie Zuschauer dein Video erleben werden. Tippe auf Hotspots, um Produktkarten zu sehen – genau wie dein Publikum.",
    "help.faq.howToExport.q": "Wie exportiere ich mein Video?",
    "help.faq.howToExport.a": "Sobald deine Hotspots eingerichtet sind, tippe auf Exportieren. Dein Video wird verarbeitet und ist dann bereit zum Teilen.",
    
    // How it works
    "help.howItWorks.title": "So funktioniert's",
    "help.howItWorks.step1": "Video hochladen",
    "help.howItWorks.step2": "Hotspots per Tippen platzieren",
    "help.howItWorks.step3": "Produkte verknüpfen",
    "help.howItWorks.step4": "Teilen & veröffentlichen",
    
    // Feedback
    "help.feedback.title": "Feedback senden",
    "help.feedback.placeholder": "Was könnte besser sein?",
    "help.feedback.categoryLabel": "Kategorie (optional)",
    "help.feedback.categoryBug": "Bug",
    "help.feedback.categoryUX": "UX-Problem",
    "help.feedback.categoryFeature": "Feature-Idee",
    "help.feedback.submit": "Feedback senden",
    "help.feedback.success": "Danke für dein Feedback!",
    
    // Report Problem
    "help.report.title": "Problem melden",
    "help.report.placeholder": "Was funktioniert nicht?",
    "help.report.submit": "Problem melden",
    "help.report.success": "Problem gemeldet. Wir schauen uns das an.",
    
    // Contact
    "help.contact.title": "Kontakt",
    "help.contact.email": "support@shopable.one",
    "help.contact.responseTime": "Wir antworten normalerweise innerhalb von 24 Stunden.",

    // Publish Flow
    "publish.title.ready": "Bereit zum Veröffentlichen",
    "publish.title.published": "Veröffentlicht",
    "publish.subline.ready": "Dein Video ist bereit. Veröffentliche es, um deinen Shop-Link live zu schalten.",
    "publish.subline.published": "Deine Landingpage ist live und bereit zum Teilen.",
    "publish.button": "Auf Landingpage veröffentlichen",
    "publish.publishing": "Wird veröffentlicht...",
    "publish.helper": "Dein Shop-Link wird sofort live.",
    "publish.success": "Veröffentlicht! Deine Landingpage ist jetzt live.",
    "publish.error": "Veröffentlichung fehlgeschlagen. Bitte erneut versuchen.",
    "publish.shopLink.label": "Dein Shop-Link",
    "publish.copyLink": "Link kopieren",
    "publish.openPage": "Landingpage öffnen",
    "publish.copied": "Kopiert!",
    "publish.linkCopied": "Link kopiert!",
    "publish.caption.label": "Caption",
    "publish.caption.placeholder": "Schreibe deine Caption...",
    "publish.caption.helper": "Kopiere diese Caption in deinen Social-Post.",
    "publish.caption.copy": "Caption kopieren",
    "publish.caption.copied": "Kopiert!",
    "publish.captionCopied": "Caption kopiert!",
    
    // Ready to Post Flow (legacy keys for compatibility)
    "readyToPost.button": "Bereit zum Veröffentlichen",
    "readyToPost.modal.title": "🔗 Dein Posting-Link",
    "readyToPost.modal.subline": "Über diesen Link können deine Follower dein Video shoppen.",
    "readyToPost.modal.customUrl": "Individuelle URL",
    "readyToPost.modal.helper": "Dieser Link wird in deiner Bio und in der Caption verwendet.",
    "readyToPost.modal.available": "Diese URL ist verfügbar ✓",
    "readyToPost.modal.taken": "Diese URL ist bereits vergeben. Bitte wähle eine andere.",
    "readyToPost.modal.continue": "Weiter → Caption vorbereiten",
    "readyToPost.page.exitLabel": "Was möchtest du als Nächstes tun?",
    "readyToPost.page.createNext": "Nächstes Video erstellen",
    "readyToPost.page.backToVideos": "Zur Übersicht",
    "readyToPost.page.logout": "Abmelden",

    // Reset Password
    "resetPassword.title": "Passwort zurücksetzen",
    "resetPassword.subtitle": "Wähle ein neues Passwort für dein Konto.",
    "resetPassword.expiredSubtitle": "Dieser Link ist abgelaufen. Fordere unten einen neuen an.",
    "resetPassword.invalidSubtitle": "Kein Passwort-Reset-Link gefunden.",
    "resetPassword.invalidRequestSubtitle": "Gib unten deine E-Mail ein, um einen Reset-Link anzufordern.",
    "resetPassword.loading": "Passwort-Reset wird vorbereitet...",
    "resetPassword.newPassword": "Neues Passwort",
    "resetPassword.newPasswordPlaceholder": "Mind. 8 Zeichen",
    "resetPassword.confirmPassword": "Neues Passwort bestätigen",
    "resetPassword.confirmPasswordPlaceholder": "Passwort wiederholen",
    "resetPassword.updateButton": "Passwort aktualisieren",
    "resetPassword.updating": "Wird aktualisiert...",
    "resetPassword.backToSignIn": "Zurück zur Anmeldung",
    "resetPassword.error.noLink": "Kein Passwort-Reset-Link gefunden. Hast du den Link in der E-Mail angeklickt?",
    "resetPassword.error.expired": "Dieser Reset-Link ist abgelaufen oder wurde bereits verwendet.",
    "resetPassword.error.tooShort": "Das Passwort muss mindestens 8 Zeichen haben.",
    "resetPassword.error.mismatch": "Die Passwörter stimmen nicht überein.",
    "resetPassword.error.sessionExpired": "Deine Sitzung ist abgelaufen. Bitte fordere einen neuen Reset-Link an.",
    "resetPassword.success.title": "Passwort aktualisiert",
    "resetPassword.success.description": "Du kannst dich jetzt mit deinem neuen Passwort anmelden.",
    "resetPassword.requestLink.emailLabel": "E-Mail-Adresse",
    "resetPassword.requestLink.emailPlaceholder": "Deine E-Mail eingeben",
    "resetPassword.requestLink.button": "Neuen Link senden",
    "resetPassword.requestLink.sending": "Wird gesendet...",
    "resetPassword.requestLink.sent": "Prüfe deine E-Mails für den neuen Reset-Link.",
    "resetPassword.requestLink.error": "Reset-Link konnte nicht gesendet werden",
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
