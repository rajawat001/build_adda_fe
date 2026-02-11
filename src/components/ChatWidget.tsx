import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiMessageCircle, FiX, FiArrowLeft, FiSend, FiCheck,
  FiPackage, FiInfo, FiTruck, FiCreditCard, FiRefreshCw, FiUsers,
  FiMessageSquare, FiCpu
} from 'react-icons/fi';
import api from '../services/api';
import { getUser } from '../utils/auth';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

interface FaqTopic {
  id: string;
  label: string;
  icon: React.ReactNode;
  subject: string;
  reply: string;
}

const FAQ_TOPICS: FaqTopic[] = [
  {
    id: 'track-order',
    label: 'Track My Order',
    icon: <FiPackage />,
    subject: 'order-issue',
    reply:
      'To track your order, go to your **Profile → Orders** section. You\'ll see the current status of each order. You also receive email updates at every stage — order confirmed, shipped, out for delivery, and delivered.\n\nIf your order status hasn\'t updated in a while, please contact our support team with your order ID.'
  },
  {
    id: 'product-info',
    label: 'Product Information',
    icon: <FiInfo />,
    subject: 'product-inquiry',
    reply:
      'You can find detailed specifications, images, and pricing on each product page. Use the search bar or browse by category to find what you need.\n\n**For bulk orders** (50+ units), please contact our support team for special pricing and availability.'
  },
  {
    id: 'delivery',
    label: 'Delivery Info',
    icon: <FiTruck />,
    subject: 'delivery-question',
    reply:
      'We offer **same-day delivery** in select cities and **2-5 business days** for standard delivery across India.\n\nDelivery charges vary based on weight and location. Orders above a certain value may qualify for free delivery. Check the product page for delivery estimates to your pincode.'
  },
  {
    id: 'payment',
    label: 'Payment Help',
    icon: <FiCreditCard />,
    subject: 'payment-issue',
    reply:
      'We accept multiple payment methods:\n• **UPI** (Google Pay, PhonePe, Paytm)\n• **Credit & Debit Cards** (Visa, Mastercard, RuPay)\n• **Cash on Delivery** (COD)\n• **Net Banking**\n\nIf your payment failed but money was deducted, it will be refunded within 5-7 business days. If not, please contact support.'
  },
  {
    id: 'returns',
    label: 'Return & Refund',
    icon: <FiRefreshCw />,
    subject: 'return-refund',
    reply:
      'We have a **7-day return policy**. To initiate a return:\n1. Go to **Profile → Orders**\n2. Select the order and click "Return"\n3. Choose your reason and submit\n\nRefunds are processed within 5-7 business days after we receive the returned item. Items must be in original condition with packaging intact.'
  },
  {
    id: 'distributor',
    label: 'Become a Distributor',
    icon: <FiUsers />,
    subject: 'distributor-inquiry',
    reply:
      'Interested in becoming a BuildAdda distributor? Here\'s how:\n1. Visit our **Distributors** page\n2. Click "Register as Distributor"\n3. Fill in your business details\n4. Our team will review and approve within **48 hours**\n\nDistributors get access to wholesale pricing, dedicated support, and a dashboard to manage orders.'
  }
];

// ─── AI Chat Knowledge Base ──────────────────────────────────────────────────

interface KnowledgeEntry {
  keywords: string[];
  response: string;
}

const AI_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['track', 'order', 'status', 'where', 'shipping', 'shipped', 'dispatch',
      'order kahan', 'order kab', 'mera order', 'kahan hai', 'kahan pahuncha', 'kab aayega', 'kab milega', 'track karo', 'order status', 'kahan tak', 'dispatch hua'],
    response: 'Apna order track karne ke liye **Profile → Orders** mein jaayein. Har order ka current status wahan dikhega. Har stage pe aapko email update bhi milega.\n\nTo track your order, go to **Profile → Orders**. You\'ll see real-time status and receive email updates at each stage. If you\'re facing issues, contact support with your order ID.'
  },
  {
    keywords: ['delivery', 'deliver', 'time', 'how long', 'when', 'arrive', 'days',
      'kitne din', 'kab tak', 'delivery kab', 'aayega kab', 'kitna time', 'pohchega kab', 'delivery time', 'same day', 'jaldi chahiye'],
    response: 'Hum select cities mein **same-day delivery** aur baaki jagah **2-5 din** mein standard delivery dete hain. Delivery charges weight aur location ke hisaab se hote hain.\n\nWe offer **same-day delivery** in select cities and **2-5 business days** standard delivery. Check the product page for pincode-specific delivery estimates.'
  },
  {
    keywords: ['return', 'refund', 'exchange', 'replace', 'damaged', 'broken', 'wrong',
      'wapas', 'vapas', 'wapsi', 'paisa wapas', 'refund kab', 'exchange karo', 'toota', 'tuta', 'kharab', 'galat', 'galat aaya', 'damage', 'tutaa hua'],
    response: 'Humari **7 din ki return policy** hai. Return karne ke liye:\n1. **Profile → Orders** mein jaayein\n2. Item select karein aur "Return" pe click karein\n3. Reason choose karke submit karein\n\nRefund 5-7 business days mein process hota hai. Item original condition mein hona chahiye.\n\nWe have a **7-day return policy**. Refunds process within 5-7 business days. Items must be in original condition with packaging.'
  },
  {
    keywords: ['payment', 'pay', 'upi', 'card', 'cod', 'cash', 'failed', 'deducted', 'transaction',
      'paisa', 'bhugtan', 'paise kat gaye', 'payment fail', 'paise kab', 'online payment', 'cash on delivery', 'paise wapas', 'kat gaya', 'debit ho gaya'],
    response: 'Hum ye payment methods accept karte hain:\n• **UPI** (Google Pay, PhonePe, Paytm)\n• **Credit/Debit Cards**\n• **Cash on Delivery (COD)**\n• **Net Banking**\n\nAgar payment fail hua lekin paise kat gaye, toh 5-7 din mein auto-refund ho jayega.\n\nIf your payment failed but money was deducted, it\'ll be auto-refunded in 5-7 days. For persistent issues, contact support with your transaction ID.'
  },
  {
    keywords: ['price', 'cost', 'bulk', 'wholesale', 'discount', 'offer', 'coupon', 'code',
      'kitne ka', 'kya price', 'rate', 'rate kya', 'daam', 'sasta', 'mehenga', 'mehnga', 'offer hai', 'discount milega', 'coupon code', 'jyada quantity', 'thok', 'bulk order'],
    response: 'Har product page pe price aur details di gayi hain. **Bulk orders (50+ units)** ke liye special pricing ke liye humse contact karein. Homepage pe latest offers aur discounts check karein!\n\nPrices are listed on each product page. For **bulk orders (50+ units)**, contact support for special pricing. Check our homepage for ongoing offers!'
  },
  {
    keywords: ['distributor', 'distribute', 'dealer', 'partner', 'business', 'wholesale',
      'dealer banna', 'distributor banna', 'dealership', 'wholesale rate', 'business karna', 'partnership', 'thok mein', 'vyapaar'],
    response: 'BuildAdda distributor banne ke liye:\n1. Hamari **Distributors** page visit karein\n2. "Register as Distributor" pe click karein\n3. Business details bharein\n4. Humari team **48 ghante** mein review karegi\n\nDistributors ko wholesale pricing aur dedicated dashboard milta hai.\n\nTo become a distributor, visit our Distributors page and register. Approval within **48 hours**.'
  },
  {
    keywords: ['product', 'material', 'cement', 'steel', 'brick', 'sand', 'paint', 'tile', 'pipe', 'wire', 'fitting',
      'saamaan', 'samaan', 'saman', 'cement', 'sariya', 'rod', 'eent', 'int', 'balu', 'ret', 'paint', 'tiles', 'pipe', 'taar', 'building material', 'construction', 'nirman'],
    response: 'Aap humari saari construction materials category wise browse kar sakte hain ya search bar use kar sakte hain. Har product page pe detailed specs, pricing aur availability hai.\n\nYou can browse all our construction materials by category or use the search bar. Each product page has detailed specs, pricing, and availability. Need help choosing? Contact our support team!'
  },
  {
    keywords: ['cancel', 'cancellation',
      'cancel karo', 'cancel karna', 'order cancel', 'nahi chahiye', 'band karo', 'hatao', 'cancel krdo', 'cancel krna'],
    response: 'Order cancel karne ke liye **Profile → Orders** mein jaayein aur "Cancel" pe click karein (agar ship nahi hua toh). Ship hone ke baad aapko return karna hoga. Cancel hone pe refund 3-5 business days mein aa jayega.\n\nTo cancel, go to **Profile → Orders** and click "Cancel" (if not shipped yet). Refunds for cancelled orders process within 3-5 business days.'
  },
  {
    keywords: ['account', 'login', 'register', 'signup', 'password', 'forgot', 'otp',
      'login nahi', 'login kaise', 'account banana', 'account banao', 'password bhul gaya', 'otp nahi aaya', 'sign up', 'register kaise'],
    response: 'Account banane ya login karne ke liye top-right menu use karein. Hum **email + OTP** login support karte hain.\n\nAgar login mein problem aa rahi hai, toh "Forgot Password" option try karein ya support se contact karein.\n\nYou can create an account or log in from the top-right menu. We support **email + OTP** login for security.'
  },
  {
    keywords: ['contact', 'support', 'help', 'call', 'phone', 'email', 'reach',
      'madad', 'sahayata', 'baat karni', 'baat karo', 'call karo', 'phone number', 'email karo', 'sampark', 'contact kaise'],
    response: 'Aap humse yahan contact kar sakte hain:\n• **Email:** contact@buildadda.in\n• **Phone:** +91 6377845721\n• **Samay:** Mon-Fri 9AM-6PM, Sat 10AM-4PM\n\nYa neeche "Contact Support" button pe click karke seedha message bhejein!\n\nYou can also use the "Contact Support" button below to send us a message directly!'
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste',
      'namaskar', 'namaskaar', 'kaise ho', 'kya haal', 'helo', 'suno', 'bhai', 'bhaiya'],
    response: 'Namaste! BuildAdda mein aapka swagat hai. Aaj hum aapki kaise madad kar sakte hain? Aap orders, delivery, payments, returns ya building materials ke baare mein kuch bhi pooch sakte hain.\n\nHello! Welcome to BuildAdda. How can I help you today? Ask me about orders, delivery, payments, returns, or anything about building materials.'
  },
  {
    keywords: ['thank', 'thanks', 'bye', 'okay', 'ok', 'great',
      'dhanyavaad', 'dhanyawad', 'shukriya', 'alvida', 'theek hai', 'thik hai', 'accha', 'bahut accha', 'bohot acha'],
    response: 'Dhanyavaad! Agar aur koi madad chahiye toh poochne mein bilkul na jhijhakein. Aapka din shubh ho! 🏗️\n\nYou\'re welcome! If you need any more help, feel free to ask. Have a great day!'
  },
  {
    keywords: ['pincode', 'pin code', 'area', 'city', 'location', 'address',
      'kahan deliver', 'mere area', 'mere city', 'hamari city', 'deliver hota hai kya', 'available hai kya', 'milta hai kya'],
    response: 'Delivery availability check karne ke liye product page pe apna **pincode** enter karein. Hum India ke bahut saare cities mein deliver karte hain.\n\nTo check delivery availability, enter your **pincode** on the product page. We deliver across many cities in India. If your area isn\'t serviceable yet, contact support!'
  },
  {
    keywords: ['quality', 'original', 'genuine', 'fake', 'nakli', 'asli',
      'quality kaisi', 'acchi quality', 'original hai', 'genuine hai', 'bharosa', 'trust', 'vishwas'],
    response: 'BuildAdda pe sab products **100% genuine aur original** hain. Hum seedha authorized manufacturers aur distributors se source karte hain. Har product quality-checked hota hai.\n\nAll products on BuildAdda are **100% genuine and original**, sourced directly from authorized manufacturers. Every product is quality-checked before dispatch.'
  },
  {
    keywords: ['gst', 'bill', 'invoice', 'tax', 'receipt',
      'bill chahiye', 'gst bill', 'invoice kahan', 'tax invoice', 'receipt chahiye', 'bill download'],
    response: 'Har order ke saath **GST tax invoice** milta hai. Aap apna invoice **Profile → Orders** se download kar sakte hain. GST registered business ke liye proper tax invoice generate hota hai.\n\nA **GST tax invoice** is provided with every order. You can download your invoice from **Profile → Orders**.'
  }
];

function getAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  if (msg.length < 2) {
    return 'Kripya apna sawaal thoda detail mein batayein. Hum orders, delivery, payments, returns aur aur bhi bahut kuch mein madad kar sakte hain.\n\nCould you please provide more details? I\'m here to help with orders, delivery, payments, returns, and more.';
  }

  // Score each knowledge entry by keyword matches
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of AI_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword)) {
        score += keyword.length; // longer keyword matches = more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 3) {
    return bestMatch.response;
  }

  return 'Mujhe aapka sawaal samajh nahi aaya. Ye kuch topics hain jinmein main madad kar sakta hoon:\n\n• **Order tracking** - Order kahan tak pahuncha\n• **Delivery** - Delivery kab aayegi\n• **Payment** - Payment methods aur issues\n• **Returns** - Wapsi aur refund\n• **Products** - Product ki jaankari\n• **Distributor** - Distributor registration\n\nAap neeche "Contact Support" button bhi use kar sakte hain!\n\nYou can also click "Contact Support" to reach our team directly!';
}

// ─── Subject Labels (matching backend) ───────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  'product-inquiry': 'Product Inquiry',
  'order-issue': 'Order Issue',
  'delivery-question': 'Delivery Question',
  'payment-issue': 'Payment Issue',
  'return-refund': 'Return/Refund',
  'distributor-inquiry': 'Become a Distributor',
  'partnership': 'Partnership',
  'feedback': 'Feedback',
  'other': 'Other'
};

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatView = 'welcome' | 'faq' | 'ai-chat' | 'contact' | 'success';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

interface ThreadMessage {
  _id: string;
  sender: 'user' | 'admin';
  subject?: string;
  message: string;
  createdAt: string;
}

interface ContactThread {
  _id: string;
  name: string;
  email: string;
  status: string;
  messages: ThreadMessage[];
  lastMessageAt: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ChatWidget: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ChatView>('welcome');
  const [selectedTopic, setSelectedTopic] = useState<FaqTopic | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPulse, setShowPulse] = useState(true);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { id: 0, sender: 'bot', text: 'Namaste! Main BuildAdda ka AI assistant hoon. Aap mujhse Hindi, Hinglish ya English mein kuch bhi pooch sakte hain - orders, delivery, payments, returns ya products ke baare mein!\n\nHi! I\'m BuildAdda\'s AI assistant. Ask me anything in Hindi, Hinglish or English!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const aiMsgIdRef = useRef(1);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Contact thread state (for logged-in users)
  const [thread, setThread] = useState<ContactThread | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadFetched, setThreadFetched] = useState(false);
  const [replyText, setReplyText] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Hide on admin/distributor pages
  const hiddenPrefixes = ['/admin', '/distributor'];
  const isHidden = hiddenPrefixes.some(p => router.pathname.startsWith(p));

  // Get logged-in user info
  const loggedInUser = typeof window !== 'undefined' ? getUser() : null;

  // Stop pulse after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll AI chat to bottom on new messages
  useEffect(() => {
    if (aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiTyping]);

  // Fetch user's contact thread when opening contact view
  const fetchThread = useCallback(async () => {
    if (!loggedInUser) return;
    setThreadLoading(true);
    try {
      const res = await api.get('/contact/my-thread');
      setThread(res.data.contact || null);
      setThreadFetched(true);
    } catch {
      // Silently fail - user may not be authenticated or no thread exists
      setThreadFetched(true);
    } finally {
      setThreadLoading(false);
    }
  }, [loggedInUser]);

  // Scroll thread to bottom
  useEffect(() => {
    if (threadEndRef.current && currentView === 'contact') {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread, currentView]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowPulse(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTopicClick = useCallback((topic: FaqTopic) => {
    setSelectedTopic(topic);
    setCurrentView('faq');
  }, []);

  const handleBack = useCallback(() => {
    setCurrentView('welcome');
    setSelectedTopic(null);
    setError('');
  }, []);

  const handleContactFromFaq = useCallback(() => {
    if (loggedInUser && !threadFetched) fetchThread();
    setCurrentView('contact');
  }, [loggedInUser, threadFetched, fetchThread]);

  const handleContactDirect = useCallback(() => {
    setSelectedTopic(null);
    if (loggedInUser && !threadFetched) fetchThread();
    setCurrentView('contact');
  }, [loggedInUser, threadFetched, fetchThread]);

  const handleAiChat = useCallback(() => {
    setCurrentView('ai-chat');
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }, []);

  const handleSubmitContact = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = formData.name.trim() || loggedInUser?.name || '';
    const email = formData.email.trim() || loggedInUser?.email || '';
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      await api.post('/contact', {
        name,
        email,
        phone: '',
        subject: selectedTopic?.subject || 'other',
        message
      });

      // If logged in, refresh the thread to show the new message
      if (loggedInUser) {
        await fetchThread();
        setFormData({ name: '', email: '', message: '' });
        setReplyText('');
      } else {
        setCurrentView('success');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [formData, selectedTopic, loggedInUser, fetchThread]);

  // Thread reply handler (logged-in user sending a follow-up message)
  const handleThreadReply = useCallback(async () => {
    if (!replyText.trim() || !loggedInUser || sending) return;
    setError('');
    setSending(true);
    try {
      await api.post('/contact', {
        name: loggedInUser.name,
        email: loggedInUser.email,
        phone: '',
        subject: 'other',
        message: replyText.trim()
      });
      setReplyText('');
      await fetchThread();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [replyText, loggedInUser, sending, fetchThread]);

  const handleReplyKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleThreadReply();
    }
  }, [handleThreadReply]);

  // AI Chat send handler
  const handleAiSend = useCallback(() => {
    const text = aiInput.trim();
    if (!text || aiTyping) return;

    const userMsg: ChatMessage = { id: aiMsgIdRef.current++, sender: 'user', text };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const botMsg: ChatMessage = { id: aiMsgIdRef.current++, sender: 'bot', text: response };
      setAiMessages(prev => [...prev, botMsg]);
      setAiTyping(false);
    }, 600 + Math.random() * 400);
  }, [aiInput, aiTyping]);

  const handleAiKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  }, [handleAiSend]);

  if (isHidden) return null;

  // ── Render helpers ──

  const renderWelcome = () => (
    <div className="cw-body-inner">
      <div className="cw-welcome-msg">
        <span className="cw-wave">👋</span>
        <p>Hi! Welcome to <strong>BuildAdda</strong>. How can we help you?</p>
      </div>

      <button className="cw-ai-chat-btn" onClick={handleAiChat}>
        <FiCpu />
        <div>
          <strong>Ask AI Assistant</strong>
          <span>Get instant answers to your questions</span>
        </div>
      </button>

      <div className="cw-topics-label">Quick Help Topics</div>
      <div className="cw-topics-grid">
        {FAQ_TOPICS.map(topic => (
          <button key={topic.id} className="cw-topic-btn" onClick={() => handleTopicClick(topic)}>
            <span className="cw-topic-icon">{topic.icon}</span>
            <span className="cw-topic-label">{topic.label}</span>
          </button>
        ))}
      </div>

      <button className="cw-contact-link" onClick={handleContactDirect}>
        <FiMessageSquare />
        Contact Support Directly
      </button>
    </div>
  );

  const renderFaq = () => (
    <div className="cw-body-inner">
      <div className="cw-faq-bubble">
        <div className="cw-faq-topic-name">{selectedTopic?.label}</div>
        <div className="cw-faq-text">
          {selectedTopic?.reply.split('\n').map((line, i) => {
            // Bold markdown
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <React.Fragment key={i}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j}>{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
                {i < (selectedTopic?.reply.split('\n').length ?? 0) - 1 && <br />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="cw-faq-actions">
        <div className="cw-helpful-label">Was this helpful?</div>
        <div className="cw-helpful-btns">
          <button className="cw-helpful-btn cw-helpful-yes" onClick={handleClose}>
            <FiCheck /> Yes, thanks!
          </button>
          <button className="cw-helpful-btn cw-helpful-no" onClick={handleContactFromFaq}>
            <FiMessageSquare /> No, contact support
          </button>
        </div>
      </div>

      <button className="cw-contact-link" onClick={handleContactFromFaq}>
        <FiMessageSquare />
        Still need help? Contact Support
      </button>
    </div>
  );

  const renderBubbleText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j}>{part.slice(2, -2)}</strong>
        : <span key={j}>{part}</span>
    );
  };

  const renderAiChat = () => (
    <div className="cw-body-inner cw-ai-view">
      <div className="cw-ai-messages">
        {aiMessages.map(msg => (
          <div key={msg.id} className={`cw-ai-msg cw-ai-msg-${msg.sender}`}>
            <div className="cw-ai-msg-bubble">
              {msg.text.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {renderBubbleText(line)}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {aiTyping && (
          <div className="cw-ai-msg cw-ai-msg-bot">
            <div className="cw-ai-msg-bubble cw-typing-bubble">
              <span className="cw-typing-dot"></span>
              <span className="cw-typing-dot"></span>
              <span className="cw-typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={aiChatEndRef} />
      </div>
      <div className="cw-ai-input-bar">
        <input
          type="text"
          className="cw-ai-input"
          placeholder="Type your question..."
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={handleAiKeyDown}
          autoFocus
        />
        <button
          className="cw-ai-send-btn"
          onClick={handleAiSend}
          disabled={!aiInput.trim() || aiTyping}
          aria-label="Send"
        >
          <FiSend />
        </button>
      </div>
      <button className="cw-contact-link" onClick={handleContactFromFaq}>
        <FiMessageSquare />
        Need more help? Contact Support
      </button>
    </div>
  );

  const formatMsgDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${time}`;
  };

  const renderContact = () => {
    // Loading thread
    if (loggedInUser && threadLoading && !threadFetched) {
      return (
        <div className="cw-body-inner cw-thread-loading">
          <span className="cw-spinner cw-spinner-lg"></span>
          <p>Loading your conversations...</p>
        </div>
      );
    }

    // Logged-in user with an existing thread — show conversation
    if (loggedInUser && thread && thread.messages.length > 0) {
      return (
        <div className="cw-body-inner cw-thread-view">
          <div className="cw-thread-messages">
            {thread.messages.map((msg) => (
              <div key={msg._id} className={`cw-thread-msg cw-thread-msg-${msg.sender}`}>
                {msg.sender === 'user' && msg.subject && (
                  <span className="cw-thread-subject-tag">
                    {SUBJECT_LABELS[msg.subject] || msg.subject}
                  </span>
                )}
                <div className="cw-thread-msg-bubble">
                  {msg.message}
                </div>
                <div className="cw-thread-msg-meta">
                  {msg.sender === 'admin' ? 'BuildAdda Support' : 'You'} &middot; {formatMsgDate(msg.createdAt)}
                </div>
              </div>
            ))}
            <div ref={threadEndRef} />
          </div>

          {error && <div className="cw-error">{error}</div>}

          <div className="cw-thread-reply-bar">
            <textarea
              className="cw-thread-reply-input"
              placeholder="Type your reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              rows={2}
            />
            <button
              className="cw-thread-reply-send"
              onClick={handleThreadReply}
              disabled={!replyText.trim() || sending}
              aria-label="Send reply"
            >
              {sending ? <span className="cw-spinner cw-spinner-sm"></span> : <FiSend />}
            </button>
          </div>
        </div>
      );
    }

    // Not logged in, or no thread yet — show contact form
    return (
      <div className="cw-body-inner">
        <div className="cw-contact-intro">
          Send us a message and we'll get back to you via email.
          {selectedTopic && (
            <span className="cw-contact-topic-tag">
              Re: {selectedTopic.label}
            </span>
          )}
        </div>

        {error && <div className="cw-error">{error}</div>}

        <form className="cw-contact-form" onSubmit={handleSubmitContact}>
          {!loggedInUser && (
            <>
              <div className="cw-form-group">
                <label htmlFor="cw-name">Name *</label>
                <input
                  id="cw-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="cw-form-group">
                <label htmlFor="cw-email">Email *</label>
                <input
                  id="cw-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </>
          )}

          {loggedInUser && (
            <div className="cw-logged-in-info">
              Sending as <strong>{loggedInUser.name}</strong> ({loggedInUser.email})
            </div>
          )}

          <div className="cw-form-group">
            <label htmlFor="cw-message">Message *</label>
            <textarea
              id="cw-message"
              name="message"
              placeholder="How can we help?"
              value={formData.message}
              onChange={handleFormChange}
              rows={4}
              required
            />
          </div>

          <button type="submit" className="cw-submit-btn" disabled={sending}>
            {sending ? (
              <>
                <span className="cw-spinner"></span> Sending...
              </>
            ) : (
              <>
                <FiSend /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="cw-body-inner cw-success-view">
      <div className="cw-success-icon">
        <FiCheck />
      </div>
      <h3>Message Sent!</h3>
      <p>We'll get back to you via email as soon as possible.</p>
      <button className="cw-done-btn" onClick={handleClose}>
        Done
      </button>
    </div>
  );

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'faq': return selectedTopic?.label || 'Help';
      case 'ai-chat': return 'AI Assistant';
      case 'contact': return (loggedInUser && thread && thread.messages.length > 0) ? 'My Conversations' : 'Contact Support';
      case 'success': return 'Thank You';
      default: return 'BuildAdda Support';
    }
  };

  const showBackButton = currentView !== 'welcome';

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`cw-toggle-btn${showPulse ? ' cw-pulse' : ''}`}
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="cw-btn-icon"
            >
              <FiX />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="cw-btn-icon"
            >
              <FiMessageCircle />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="cw-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className="cw-popup"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              {/* Header */}
              <div className="cw-header">
                {showBackButton && (
                  <button className="cw-back-btn" onClick={handleBack} aria-label="Back">
                    <FiArrowLeft />
                  </button>
                )}
                <div className="cw-header-title">{getHeaderTitle()}</div>
                <button className="cw-close-btn" onClick={handleClose} aria-label="Close">
                  <FiX />
                </button>
              </div>

              {/* Body */}
              <div className="cw-body">
                {currentView === 'welcome' && renderWelcome()}
                {currentView === 'faq' && renderFaq()}
                {currentView === 'ai-chat' && renderAiChat()}
                {currentView === 'contact' && renderContact()}
                {currentView === 'success' && renderSuccess()}
              </div>

              {/* Footer */}
              <div className="cw-footer">
                Powered by <strong>BuildAdda</strong>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
