import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Language = 'en' | 'hi' | 'pa';

interface Translations {
  // Landing page
  appName: string;
  milkingTracker: string;
  tagline: string;
  startMilking: string;
  viewHistory: string;
  calmingMusic: string;
  calmingMusicDesc: string;
  sessionTimer: string;
  sessionTimerDesc: string;
  funFact: string;
  
  // Active session
  milkingInProgress: string;
  pause: string;
  resume: string;
  stop: string;
  musicPlaying: string;
  
  // Dialog
  enterMilkQuantity: string;
  howMuchMilk: string;
  sessionDuration: string;
  milkQuantityPlaceholder: string;
  cancel: string;
  saveSession: string;
  saving: string;
  
  // History page
  milkingHistory: string;
  viewAllSessions: string;
  totalSessions: string;
  totalMilk: string;
  totalTime: string;
  avgPerSession: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  milk: string;
  noSessionsYet: string;
  startFirstSession: string;
  tryAgain: string;
  
  // Toast messages
  sessionSaved: string;
  recorded: string;
  errorSaving: string;
  checkConnection: string;
  
  // Settings
  settings: string;
  language: string;
  soundEffects: string;
  volume: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Landing page
    appName: 'Moo Music',
    milkingTracker: 'Milking Tracker',
    tagline: 'Track your milking sessions with soothing music for happier, more productive cattle',
    startMilking: 'Start Milking',
    viewHistory: 'View History',
    calmingMusic: 'Calming Music',
    calmingMusicDesc: 'Relaxing sounds for stress-free milking',
    sessionTimer: 'Session Timer',
    sessionTimerDesc: 'Track duration with precision timing',
    funFact: 'Calming music can increase milk yield by up to 3%',
    
    // Active session
    milkingInProgress: 'Milking in progress...',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    musicPlaying: 'Music playing',
    
    // Dialog
    enterMilkQuantity: 'Enter Milk Quantity',
    howMuchMilk: 'How much milk was collected in this session?',
    sessionDuration: 'Session duration',
    milkQuantityPlaceholder: 'Enter quantity in liters',
    cancel: 'Cancel',
    saveSession: 'Save Session',
    saving: 'Saving...',
    
    // History page
    milkingHistory: 'Milking History',
    viewAllSessions: 'View all your past milking sessions',
    totalSessions: 'Total Sessions',
    totalMilk: 'Total Milk',
    totalTime: 'Total Time',
    avgPerSession: 'Avg per Session',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration',
    milk: 'Milk',
    noSessionsYet: 'No sessions yet!',
    startFirstSession: 'Start your first milking session to see records here.',
    tryAgain: 'Try Again',
    
    // Toast messages
    sessionSaved: 'Session Saved! 🎉',
    recorded: 'Recorded',
    errorSaving: 'Error saving session',
    checkConnection: 'Please check your API connection',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    soundEffects: 'Sound Effects',
    volume: 'Volume',
  },
  hi: {
    // Landing page
    appName: 'मू म्यूजिक',
    milkingTracker: 'दूध निकालना ट्रैकर',
    tagline: 'खुश और अधिक उत्पादक पशुओं के लिए सुखदायक संगीत के साथ अपने दूध निकालने के सत्र को ट्रैक करें',
    startMilking: 'दूध निकालना शुरू करें',
    viewHistory: 'इतिहास देखें',
    calmingMusic: 'शांत संगीत',
    calmingMusicDesc: 'तनाव-मुक्त दूध निकालने के लिए आरामदायक ध्वनि',
    sessionTimer: 'सत्र टाइमर',
    sessionTimerDesc: 'सटीक समय के साथ अवधि ट्रैक करें',
    funFact: 'शांत संगीत दूध उत्पादन को 3% तक बढ़ा सकता है',
    
    // Active session
    milkingInProgress: 'दूध निकाला जा रहा है...',
    pause: 'रोकें',
    resume: 'जारी रखें',
    stop: 'बंद करें',
    musicPlaying: 'संगीत चल रहा है',
    
    // Dialog
    enterMilkQuantity: 'दूध की मात्रा दर्ज करें',
    howMuchMilk: 'इस सत्र में कितना दूध एकत्र हुआ?',
    sessionDuration: 'सत्र की अवधि',
    milkQuantityPlaceholder: 'लीटर में मात्रा दर्ज करें',
    cancel: 'रद्द करें',
    saveSession: 'सत्र सहेजें',
    saving: 'सहेज रहा है...',
    
    // History page
    milkingHistory: 'दूध निकालने का इतिहास',
    viewAllSessions: 'अपने सभी पिछले सत्र देखें',
    totalSessions: 'कुल सत्र',
    totalMilk: 'कुल दूध',
    totalTime: 'कुल समय',
    avgPerSession: 'प्रति सत्र औसत',
    date: 'तारीख',
    startTime: 'शुरू का समय',
    endTime: 'समाप्ति का समय',
    duration: 'अवधि',
    milk: 'दूध',
    noSessionsYet: 'अभी तक कोई सत्र नहीं!',
    startFirstSession: 'यहां रिकॉर्ड देखने के लिए अपना पहला दूध निकालने का सत्र शुरू करें।',
    tryAgain: 'पुनः प्रयास करें',
    
    // Toast messages
    sessionSaved: 'सत्र सहेजा गया! 🎉',
    recorded: 'रिकॉर्ड किया गया',
    errorSaving: 'सत्र सहेजने में त्रुटि',
    checkConnection: 'कृपया अपना API कनेक्शन जांचें',
    
    // Settings
    settings: 'सेटिंग्स',
    language: 'भाषा',
    soundEffects: 'ध्वनि प्रभाव',
    volume: 'वॉल्यूम',
  },
  pa: {
    // Landing page
    appName: 'Moo ਸੰਗੀਤ',
    milkingTracker: 'ਦਾ ਕੱਢਣ ਟ੍ਰੈਕਰ',
    tagline: 'ਸੁਖਮਈ ਸੰਗੀਤ ਦੇ ਨਾਲ ਆਪਣੇ ਦਾ ਕੱਢਣ ਦੇ ਸਮੇਂ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ ਤਾਂ ਜੋ ਮਵੇਸ਼ੀ ਖੁਸ਼ ਅਤੇ ਵੱਧ ਉਤਪਾਦਕ ਹੋਣ',
    startMilking: 'ਦਾ ਕੱਢਣਾ ਸ਼ੁਰੂ ਕਰੋ',
    viewHistory: 'ਇਤਿਹਾਸ ਵੇਖੋ',
    calmingMusic: 'ਸੁਖਮਈ ਸੰਗੀਤ',
    calmingMusicDesc: 'ਤਣਾਅ-ਮੁਕ্ত ਦਾ ਕੱਢਣ ਲਈ ਆਰਾਮਦਾਇਕ ਆਵਾਜ਼',
    sessionTimer: 'ਸੈਸ਼ਨ ਟਾਈਮਰ',
    sessionTimerDesc: 'ਸ਼ੁੱਧ ਸਮੇ ਦੇ ਨਾਲ ਮਿਆਦ ਦਾ ਪਤਾ ਕਰੋ',
    funFact: 'ਸੁਖਮਈ ਸੰਗੀਤ ਦਾ ਉਤਪਾਦ 3% ਤੱਕ ਵਧ ਸਕਦਾ ਹੈ',
    
    // Active session
    milkingInProgress: 'ਦਾ ਕੱਢਣਾ ਜਾਰੀ ਹੈ...',
    pause: 'ਰੋਕੋ',
    resume: 'ਜਾਰੀ ਰਖੋ',
    stop: 'ਬੰਦ ਕਰੋ',
    musicPlaying: 'ਸੰਗੀਤ ਚੱਲ ਰਿਹਾ ਹੈ',
    
    // Dialog
    enterMilkQuantity: 'ਦਾ ਦੀ ਮਾਤਰਾ ਦਰਜ ਕਰੋ',
    howMuchMilk: 'ਇਸ ਸੈਸ਼ਨ ਵਿੱਚ ਕਿੰਨਾ ਦਾ ਇਕੱਠਾ ਹੋਇਆ?',
    sessionDuration: 'ਸੈਸ਼ਨ ਦੀ ਮਿਆਦ',
    milkQuantityPlaceholder: 'ਲਿਟਰ ਵਿੱਚ ਮਾਤਰਾ ਦਰਜ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    saveSession: 'ਸੈਸ਼ਨ ਸੰਭਾਲੋ',
    saving: 'ਸੰਭਾਲ ਰਿਹਾ ਹਾਂ...',
    
    // History page
    milkingHistory: 'ਦਾ ਕੱਢਣ ਦਾ ਇਤਿਹਾਸ',
    viewAllSessions: 'ਆਪਣੇ ਸਾਰੇ ਪਿਛਲੇ ਸੈਸ਼ਨ ਵੇਖੋ',
    totalSessions: 'ਕੁੱਲ ਸੈਸ਼ਨ',
    totalMilk: 'ਕੁੱਲ ਦਾ',
    totalTime: 'ਕੁੱਲ ਸਮਾਂ',
    avgPerSession: 'ਪ੍ਰਤੀ ਸੈਸ਼ਨ ਔਸਤ',
    date: 'ਤਾਰੀਖ',
    startTime: 'ਸ਼ੁਰੂ ਦਾ ਸਮਾਂ',
    endTime: 'ਖਤਮ ਹੋਣ ਦਾ ਸਮਾਂ',
    duration: 'ਮਿਆਦ',
    milk: 'ਦਾ',
    noSessionsYet: 'ਹਨੂੰ ਤੱਕ ਕੋਈ ਸੈਸ਼ਨ ਨਹੀਂ!',
    startFirstSession: 'ਇਹਾਂ ਰਿਕਾਰਡ ਦੇਖਣ ਲਈ ਆਪਣਾ ਪਹਿਲਾ ਦਾ ਕੱਢਣ ਦਾ ਸੈਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ।',
    tryAgain: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    
    // Toast messages
    sessionSaved: 'ਸੈਸ਼ਨ ਸੰਭਾਲਿਆ! 🎉',
    recorded: 'ਰਿਕਾਰਡ ਕੀਤਾ',
    errorSaving: 'ਸੈਸ਼ਨ ਸੰਭਾਲਣ ਵਿੱਚ ਗਲਤੀ',
    checkConnection: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ API ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ',
    
    // Settings
    settings: 'ਸੈਟਿੰਗ',
    language: 'ਭਾਸ਼ਾ',
    soundEffects: 'ਆਵਾਜ਼ ਪ੍ਰਭਾਵ',
    volume: 'ਵੈਲਯੂਮ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get saved language from localStorage
const getSavedLanguage = (): Language => {
  const saved = localStorage.getItem('moo-language');
  return (saved === 'hi' || saved === 'en' || saved === 'pa') ? saved : 'en';
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('moo-language', lang);
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
