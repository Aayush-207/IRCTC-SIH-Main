import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ChatbotUI from "@/components/ChatbotUI";
import { MessageCircle } from "lucide-react";

const AskDishaFab = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-10 right-6 z-50">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-gradient-railway opacity-40 blur-xl animate-ping"></span>
          <span className="absolute inset-0 rounded-full ring-4 ring-primary/20 animate-pulse"></span>
          <Button
            onClick={() => setOpen(true)}
            className="h-16 w-16 rounded-full shadow-xl bg-gradient-primary p-0 relative fab-breathe"
            aria-label="Open Ask Disha chatbot"
          >
            <MessageCircle className="h-8 w-8 text-primary-foreground icon-breathe" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 w-[90vw] sm:w-[28rem] max-w-[100vw] bg-slate-50 border-l-0">
          <div className="h-[100dvh] overflow-hidden flex flex-col">
            <ChatbotUI isFullScreen={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AskDishaFab;


