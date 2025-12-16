import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, MousePointerClick, Link2, Share2, HelpCircle, AlertTriangle, ShieldQuestion, Bug, MessageSquare, Mail, ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HelpPage = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  
  // Form states
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string>("");
  const [reportText, setReportText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  
  // Refs for scrolling
  const faqRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Quick action items
  const quickActions = [
    { id: "hotspots", label: t("help.quickActions.howHotspots"), icon: HelpCircle, faqId: "faq-hotspots" },
    { id: "cantPlace", label: t("help.quickActions.whyCantPlace"), icon: AlertTriangle, faqId: "faq-cantPlace" },
    { id: "safeZone", label: t("help.quickActions.whatIsSafeZone"), icon: ShieldQuestion, faqId: "faq-safeZone" },
    { id: "report", label: t("help.quickActions.reportProblem"), icon: Bug, scrollTo: reportRef },
    { id: "feedback", label: t("help.quickActions.sendFeedback"), icon: MessageSquare, scrollTo: feedbackRef },
  ];
  
  // FAQ items
  const faqItems = [
    { id: "faq-hotspots", q: t("help.faq.howHotspotsWork.q"), a: t("help.faq.howHotspotsWork.a") },
    { id: "faq-cantPlace", q: t("help.faq.whyCantPlace.q"), a: t("help.faq.whyCantPlace.a") },
    { id: "faq-safeZone", q: t("help.faq.whatIsSafeZone.q"), a: t("help.faq.whatIsSafeZone.a") },
    { id: "faq-editHotspot", q: t("help.faq.howToEditHotspot.q"), a: t("help.faq.howToEditHotspot.a") },
    { id: "faq-deleteHotspot", q: t("help.faq.howToDeleteHotspot.q"), a: t("help.faq.howToDeleteHotspot.a") },
    { id: "faq-previewMode", q: t("help.faq.whatIsPreviewMode.q"), a: t("help.faq.whatIsPreviewMode.a") },
    { id: "faq-export", q: t("help.faq.howToExport.q"), a: t("help.faq.howToExport.a") },
  ];
  
  // How it works steps
  const steps = [
    { icon: Upload, label: t("help.howItWorks.step1") },
    { icon: MousePointerClick, label: t("help.howItWorks.step2") },
    { icon: Link2, label: t("help.howItWorks.step3") },
    { icon: Share2, label: t("help.howItWorks.step4") },
  ];
  
  const [activeFaqId, setActiveFaqId] = useState<string>("");
  
  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.scrollTo) {
      action.scrollTo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (action.faqId) {
      setActiveFaqId(action.faqId);
      faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSendingFeedback(true);
    
    // Simulate sending (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log("[Help] Feedback submitted:", {
      text: feedbackText,
      category: feedbackCategory || "general",
      timestamp: new Date().toISOString(),
    });
    
    setFeedbackText("");
    setFeedbackCategory("");
    setIsSendingFeedback(false);
    toast.success(t("help.feedback.success"));
  };
  
  const handleSendReport = async () => {
    if (!reportText.trim()) return;
    
    setIsSendingReport(true);
    
    // Collect device info (invisibly attached)
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      appVersion: "1.0.0", // Would come from app config
      videoId: null, // Would come from current context if available
    };
    
    // Simulate sending (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log("[Help] Problem reported:", {
      text: reportText,
      deviceInfo,
      timestamp: new Date().toISOString(),
    });
    
    setReportText("");
    setIsSendingReport(false);
    toast.success(t("help.report.success"));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors -ml-2"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{t("help.title")}</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 pb-20 max-w-lg mx-auto">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t("help.title")}</h2>
          <p className="text-neutral-500">{t("help.subtitle")}</p>
        </div>
        
        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.quickActions.title")}
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium text-neutral-800">
                  {action.label}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </section>
        
        {/* FAQs */}
        <section ref={faqRef} className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.faq.title")}
          </h3>
          <Accordion 
            type="single" 
            collapsible 
            value={activeFaqId}
            onValueChange={setActiveFaqId}
            className="space-y-2"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-neutral-100 rounded-xl overflow-hidden bg-white data-[state=open]:border-neutral-200"
              >
                <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium text-neutral-800 hover:no-underline hover:bg-neutral-50 [&[data-state=open]]:bg-neutral-50">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        
        {/* How it works */}
        <section className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.howItWorks.title")}
          </h3>
          <div className="bg-neutral-50 rounded-xl p-4">
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-neutral-700">{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
        
        {/* Feedback Form */}
        <section ref={feedbackRef} className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.feedback.title")}
          </h3>
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t("help.feedback.placeholder")}
              className="min-h-[100px] bg-white border-neutral-200 resize-none"
              maxLength={1000}
            />
            <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
              <SelectTrigger className="bg-white border-neutral-200">
                <SelectValue placeholder={t("help.feedback.categoryLabel")} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-neutral-200 shadow-lg z-[100]">
                <SelectItem value="bug">{t("help.feedback.categoryBug")}</SelectItem>
                <SelectItem value="ux">{t("help.feedback.categoryUX")}</SelectItem>
                <SelectItem value="feature">{t("help.feedback.categoryFeature")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSendFeedback}
              disabled={!feedbackText.trim() || isSendingFeedback}
              className="w-full"
            >
              {isSendingFeedback ? "..." : t("help.feedback.submit")}
            </Button>
          </div>
        </section>
        
        {/* Report Problem */}
        <section ref={reportRef} className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.report.title")}
          </h3>
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={t("help.report.placeholder")}
              className="min-h-[100px] bg-white border-neutral-200 resize-none"
              maxLength={1000}
            />
            <Button
              onClick={handleSendReport}
              disabled={!reportText.trim() || isSendingReport}
              variant="outline"
              className="w-full"
            >
              {isSendingReport ? "..." : t("help.report.submit")}
            </Button>
          </div>
        </section>
        
        {/* Contact */}
        <section className="mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
            {t("help.contact.title")}
          </h3>
          <div className="bg-neutral-50 rounded-xl p-4">
            <a
              href={`mailto:${t("help.contact.email")}`}
              className="flex items-center gap-3 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">{t("help.contact.email")}</span>
            </a>
            <p className="text-xs text-neutral-500 mt-2">
              {t("help.contact.responseTime")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpPage;
