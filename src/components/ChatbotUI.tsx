import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Train, Search, CreditCard, Trash2, CalendarDays, Utensils } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'disha';
  timestamp: string;
}

interface ChatbotUIProps {
  className?: string;
  isFullScreen?: boolean;
}

const CHAT_STORAGE_KEY = "irctc_askdisha_chat";

export default function ChatbotUI({ className = "", isFullScreen = false }: ChatbotUIProps) {
  const defaultMessage: Message = {
    id: '1',
    text: 'Hello! I\'m Disha 2.0, your AI assistant for Indian Railways. How can I help you today?',
    sender: 'disha',
    timestamp: new Date().toISOString()
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Could not load chat history", e);
    }
    return [defaultMessage];
  });
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const quickQuestions = [
    { text: "Check PNR status", icon: Search },
    { text: "Train running status", icon: Train },
    { text: "Book a ticket", icon: CalendarDays },
    { text: "Refund process", icon: CreditCard },
    { text: "Order food", icon: Utensils }
  ];

  const sampleResponses = {
    "pnr": "To check your PNR status, you can:\n\n1. Visit the PNR Status page from the navigation menu\n2. Enter your 10-digit PNR number\n3. Get real-time updates on your booking status\n\nYour PNR number is printed on the top-left of your ticket.",
    "train": "For live train status:\n\n1. Go to the Live tab on the Home page\n2. Enter your train number (e.g. 12951)\n3. View real-time location and delay information\n\nYou'll get updates on the current station, expected arrival times, and delay information.",
    "booking": "To book train tickets:\n\n1. Go to the Home page\n2. Enter source (From) and destination (To) stations\n3. Select your travel date\n4. Search for available trains\n5. Select seats and enter passenger details\n6. Make payment securely\n\nFor best availability, book in advance. Tatkal booking opens 1 day before the journey.",
    "refund": "For ticket refunds:\n\n• Cancellation charges apply based on the time before departure.\n• Online cancellation is available up to 4 hours before departure for confirmed tickets.\n• The refund amount is automatically credited to the original payment source within 3-5 business days.\n\nFor e-tickets, cancellation must be done online.",
    "station": "Station facilities generally include:\n\n• Waiting rooms & lounges\n• Food courts and authorized vendors\n• ATMs and banking services\n• Parking facilities\n• WiFi in major stations\n• Wheelchair accessibility\n• Enquiry counters\n\nUse the 'View Station' tab on the home page to check arrivals and departures at any station.",
    "food": "For ordering food in trains:\n\n1. Use our Pantry Cart feature\n2. Enter your train number and seat\n3. Browse menu categories (Meals, Snacks, Beverages)\n4. Add items to cart\n5. Place order for delivery at seat\n\nFood is delivered hot directly to your berth!",
    "greeting": "Hello! I'm here to help you with all your railway-related queries. You can ask me about:\n\n• Ticket booking & PNR status\n• Train schedules & live status\n• Station information\n• Food ordering\n• Refunds & cancellations\n\nWhat would you like to know?"
  };

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pnr') || message.includes('status') || message.includes('reservation')) {
      return sampleResponses.pnr;
    } else if (message.includes('train') && (message.includes('status') || message.includes('live') || message.includes('running') || message.includes('where'))) {
      return sampleResponses.train;
    } else if (message.includes('book') || message.includes('ticket') || message.includes('travel')) {
      return sampleResponses.booking;
    } else if (message.includes('refund') || message.includes('cancel') || message.includes('return') || message.includes('money')) {
      return sampleResponses.refund;
    } else if (message.includes('station') || message.includes('facility') || message.includes('amenity') || message.includes('waiting')) {
      return sampleResponses.station;
    } else if (message.includes('food') || message.includes('pantry') || message.includes('meal') || message.includes('eat') || message.includes('hungry')) {
      return sampleResponses.food;
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('help')) {
      return sampleResponses.greeting;
    } else {
      return "I can help you with various railway services including:\n\n• Checking PNR status and train schedules\n• Booking tickets and seat selection\n• Station information and facilities\n• Food ordering in trains\n• Refund and cancellation policies\n\nCould you please clarify your question?";
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(text);
      const dishaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'disha',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, dishaMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleClearChat = () => {
    setMessages([defaultMessage]);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([defaultMessage]));
  };

  return (
    <Card className={`flex flex-col w-full h-full overflow-hidden ${!isFullScreen ? 'border-0 rounded-none shadow-none' : ''} ${className}`}>
      <CardHeader className="border-b px-4 py-3 bg-white flex flex-row items-center justify-between shrink-0 h-14">
        <CardTitle className="flex items-center space-x-2 text-lg m-0">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none mb-1">Ask Disha 2.0</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs text-muted-foreground font-normal leading-none">Online</span>
            </div>
          </div>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear Chat" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-50">
        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => {
                const isUser = message.sender === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-4 ${
                        isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-primary text-primary-foreground'
                      }`}>
                        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-white border border-slate-200 rounded-bl-sm'
                      }`}>
                        <p className={`whitespace-pre-wrap text-[0.9rem] leading-relaxed ${isUser ? 'text-white' : 'text-slate-700'}`}>
                          {message.text}
                        </p>
                        <p className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center shrink-0 mb-4">
                      <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex space-x-1.5 items-center h-[42px]">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Questions (only show if very few messages exist to not clutter) */}
        {messages.length <= 2 && !isTyping && (
          <div className="p-3 border-t bg-white">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => {
                const Icon = question.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(question.text)}
                    className="flex items-center space-x-1.5 h-7 px-2.5 rounded-full text-xs bg-slate-50 hover:bg-slate-100"
                  >
                    <Icon className="h-3 w-3 text-primary" />
                    <span>{question.text}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-t shrink-0">
          <div className="flex space-x-2 items-center bg-slate-50 border rounded-full px-1 py-1 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
            <Input
              placeholder="Type your question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 h-9 px-3 text-sm"
              disabled={isTyping}
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 text-white rounded-full h-8 w-8 p-0 shrink-0"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
