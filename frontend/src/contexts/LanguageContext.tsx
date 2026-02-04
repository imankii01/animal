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
  
  // Search and Filter
  search: string;
  filter: string;
  clear: string;
  milkMin: string;
  milkMax: string;
  dateFrom: string;
  dateTo: string;
  durationMin: string;
  durationMax: string;
  noResults: string;
  adjustFilters: string;
  showingResults: string;
  of: string;
  sessions: string;
  
  // Edit/Delete Session
  editSession: string;
  editSessionDesc: string;
  delete: string;
  deleteSession: string;
  deleteConfirmation: string;
  confirmDelete: string;
  deleting: string;
  sessionDeleted: string;
  sessionRemoved: string;
  sessionUpdated: string;
  changesApplied: string;
  updateFailed: string;
  deleteFailed: string;
  saveChanges: string;
  milkQuantity: string;
  milkCantBeNegative: string;
  milkTooHigh: string;
  milkRequired: string;
  endTimeError: string;
  actions: string;
  
  // Statistics page
  statistics: string;
  viewTrends: string;
  noData: string;
  createSessionsFirst: string;
  highestProduction: string;
  lowestProduction: string;
  trend: string;
  dailyTrend: string;
  lastSessions: string;
  sessionDistribution: string;
  avgDuration: string;
  totalDuration: string;
  
  // Goals page
  goals: string;
  setTargets: string;
  createGoal: string;
  newGoal: string;
  goalType: string;
  targetMilk: string;
  create: string;
  noGoalsYet: string;
  createGoalPrompt: string;
  daily: string;
  weekly: string;
  goal: string;
  active: string;
  inactive: string;
  target: string;
  streak: string;
  days: string;
  sessionsDone: string;
  today: string;
  thisWeek: string;
  goalAchieved: string;
  tips: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  deleteGoal: string;
  deleteGoalConfirm: string;
  
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
    
    // Search and Filter
    search: 'Search sessions...',
    filter: 'Filter',
    clear: 'Clear',
    milkMin: 'Min Milk (L)',
    milkMax: 'Max Milk (L)',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    durationMin: 'Min Duration (s)',
    durationMax: 'Max Duration (s)',
    noResults: 'No sessions found',
    adjustFilters: 'Try adjusting your filters',
    showingResults: 'Showing results:',
    of: 'of',
    sessions: 'sessions',
    
    // Edit/Delete Session
    editSession: 'Edit Session',
    editSessionDesc: 'Modify the details of this milking session.',
    delete: 'Delete',
    deleteSession: 'Delete Session',
    deleteConfirmation: 'This action cannot be undone. The session will be permanently deleted.',
    confirmDelete: 'Delete Session?',
    deleting: 'Deleting...',
    sessionDeleted: 'Session Deleted',
    sessionRemoved: 'The session has been removed.',
    sessionUpdated: 'Session Updated',
    changesApplied: 'Your changes have been saved.',
    updateFailed: 'Update Failed',
    deleteFailed: 'Delete Failed',
    saveChanges: 'Save Changes',
    milkQuantity: 'Milk Quantity (L)',
    milkCantBeNegative: 'Milk cannot be negative',
    milkTooHigh: 'Maximum 100L per session',
    milkRequired: 'Milk quantity is required',
    endTimeError: 'End time must be after start time',
    actions: 'Actions',
    
    // Statistics page
    statistics: 'Statistics',
    viewTrends: 'Analyze your milking patterns',
    noData: 'No data available',
    createSessionsFirst: 'Create some sessions to see statistics',
    highestProduction: 'Highest Production',
    lowestProduction: 'Lowest Production',
    trend: '7-Day Trend',
    dailyTrend: 'Daily Trend',
    lastSessions: 'Last 30 days',
    sessionDistribution: 'Session Duration Distribution',
    avgDuration: 'Average Duration',
    totalDuration: 'Total Duration',
    
    // Goals page
    goals: 'Goals & Milestones',
    setTargets: 'Set and track your milking targets',
    createGoal: 'Create New Goal',
    newGoal: 'Create New Goal',
    goalType: 'Goal Type',
    targetMilk: 'Target Milk (L)',
    create: 'Create',
    noGoalsYet: 'No goals yet',
    createGoalPrompt: 'Set your first goal to start tracking',
    daily: 'Daily Goal',
    weekly: 'Weekly Goal',
    goal: 'Goal',
    active: 'Active',
    inactive: 'Inactive',
    target: 'Target',
    streak: 'Streak',
    days: 'days',
    sessionsDone: 'sessions completed',
    today: 'today',
    thisWeek: 'this week',
    goalAchieved: 'Goal achieved!',
    tips: 'Tips for Success',
    tip1: 'Set realistic goals based on your current production',
    tip2: 'Daily goals help you stay consistent',
    tip3: 'Weekly goals give you flexibility',
    tip4: 'Track your streaks to build momentum',
    deleteGoal: 'Delete Goal?',
    deleteGoalConfirm: 'This goal and its progress will be permanently removed.',
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
    
    // Search and Filter
    search: 'सत्र खोजें...',
    filter: 'फ़िल्टर',
    clear: 'साफ़ करें',
    milkMin: 'न्यूनतम दूध (एल)',
    milkMax: 'अधिकतम दूध (एल)',
    dateFrom: 'तारीख से',
    dateTo: 'तारीख तक',
    durationMin: 'न्यूनतम अवधि (सेकंड)',
    durationMax: 'अधिकतम अवधि (सेकंड)',
    noResults: 'कोई सत्र नहीं मिला',
    adjustFilters: 'अपने फ़िल्टर को समायोजित करने का प्रयास करें',
    showingResults: 'परिणाम दिखा रहा है:',
    of: 'का',
    sessions: 'सत्र',
    
    // Edit/Delete Session
    editSession: 'सत्र संपादित करें',
    editSessionDesc: 'इस दूध निकालने वाले सत्र के विवरण को संशोधित करें।',
    delete: 'हटाएं',
    deleteSession: 'सत्र हटाएं',
    deleteConfirmation: 'यह कार्रवाई को पूर्ववत नहीं किया जा सकता। सत्र स्थायी रूप से हटा दिया जाएगा।',
    confirmDelete: 'सत्र हटाएं?',
    deleting: 'हटा रहा है...',
    sessionDeleted: 'सत्र हटा दिया गया',
    sessionRemoved: 'सत्र को हटा दिया गया है।',
    sessionUpdated: 'सत्र अपडेट हो गया',
    changesApplied: 'आपके परिवर्तन सहेज दिए गए हैं।',
    updateFailed: 'अपडेट विफल',
    deleteFailed: 'हटाना विफल',
    saveChanges: 'परिवर्तन सहेजें',
    milkQuantity: 'दूध की मात्रा (एल)',
    milkCantBeNegative: 'दूध नकारात्मक नहीं हो सकता',
    milkTooHigh: 'प्रति सत्र अधिकतम 100एल',
    milkRequired: 'दूध की मात्रा आवश्यक है',
    endTimeError: 'समाप्ति समय शुरू होने से बाद में होना चाहिए',
    actions: 'क्रियाएं',
    
    // Statistics page
    statistics: 'सांख्यिकी',
    viewTrends: 'अपने दूध निकालने के पैटर्न का विश्लेषण करें',
    noData: 'कोई डेटा उपलब्ध नहीं',
    createSessionsFirst: 'आंकड़े देखने के लिए कुछ सत्र बनाएं',
    highestProduction: 'सर्वोच्च उत्पादन',
    lowestProduction: 'न्यूनतम उत्पादन',
    trend: '7 दिन का रुझान',
    dailyTrend: 'दैनिक प्रवृत्ति',
    lastSessions: 'पिछले 30 दिन',
    sessionDistribution: 'सत्र अवधि वितरण',
    avgDuration: 'औसत अवधि',
    totalDuration: 'कुल अवधि',
    
    // Goals page
    goals: 'लक्ष्य और मील के पत्थर',
    setTargets: 'अपने दूध निकालने के लक्ष्य निर्धारित करें और ट्रैक करें',
    createGoal: 'नया लक्ष्य बनाएं',
    newGoal: 'नया लक्ष्य बनाएं',
    goalType: 'लक्ष्य प्रकार',
    targetMilk: 'लक्ष्य दूध (एल)',
    create: 'बनाएं',
    noGoalsYet: 'अभी तक कोई लक्ष्य नहीं',
    createGoalPrompt: 'ट्रैकिंग शुरू करने के लिए अपना पहला लक्ष्य निर्धारित करें',
    daily: 'दैनिक लक्ष्य',
    weekly: 'साप्ताहिक लक्ष्य',
    goal: 'लक्ष्य',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    target: 'लक्ष्य',
    streak: 'स्ट्रीक',
    days: 'दिन',
    sessionsDone: 'सत्र पूरण',
    today: 'आज',
    thisWeek: 'इस हफ्ते',
    goalAchieved: 'लक्ष्य प्राप्त!',
    tips: 'सफलता के टिप्स',
    tip1: 'अपने वर्तमान उत्पादन के आधार पर यथार्थवादी लक्ष्य निर्धारित करें',
    tip2: 'दैनिक लक्ष्य आपको सुसंगत रहने में मदद करते हैं',
    tip3: 'साप्ताहिक लक्ष्य आपको लचकीलापन देते हैं',
    tip4: 'गति बनाने के लिए अपनी स्ट्रीक को ट्रैक करें',
    deleteGoal: 'लक्ष्य हटाएं?',
    deleteGoalConfirm: 'यह लक्ष्य और इसकी प्रगति स्थायी रूप से हटा दी जाएगी।',
    
    // Toast messages
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
    
    // Search and Filter
    search: 'ਸੈਸ਼ਨ ਖੋਜੋ...',
    filter: 'ਸਿਨੋ',
    clear: 'ਸਾਫ਼ ਕਰੋ',
    milkMin: 'ਘੱਟ ਤੋਂ ਘੱਟ ਦਾ (ਲਿ)',
    milkMax: 'ਵੱਧ ਤੋਂ ਵੱਧ ਦਾ (ਲਿ)',
    dateFrom: 'ਤਾਰੀਖ ਤੋਂ',
    dateTo: 'ਤਾਰੀਖ ਤੱਕ',
    durationMin: 'ਘੱਟ ਤੋਂ ਘੱਟ ਮਿਆਦ (ਸਕਿੰਟ)',
    durationMax: 'ਵੱਧ ਤੋਂ ਵੱਧ ਮਿਆਦ (ਸਕਿੰਟ)',
    noResults: 'ਕੋਈ ਸੈਸ਼ਨ ਨਹੀਂ ਮਿਲਿਆ',
    adjustFilters: 'ਆਪਣੇ ਸਿਨੋ ਨੂੰ ਸਮਾਯੋਜਿਤ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    showingResults: 'ਨਤੀਜੇ ਦਿਖਾ ਰਿਹਾ ਹਾਂ:',
    of: 'ਦਾ',
    sessions: 'ਸੈਸ਼ਨ',
    
    // Edit/Delete Session
    editSession: 'ਸੈਸ਼ਨ ਸੰਪਾਦਿਤ ਕਰੋ',
    editSessionDesc: 'ਇਸ ਦਾ ਕੱਢਣ ਸੈਸ਼ਨ ਦੇ ਵੇਰਵਿਆਂ ਨੂੰ ਸੋਧੋ।',
    delete: 'ਹਟਾਓ',
    deleteSession: 'ਸੈਸ਼ਨ ਹਟਾਓ',
    deleteConfirmation: 'ਇਹ ਕਾਰਵਾਈ ਨੂੰ ਵਾਪਸ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ। ਸੈਸ਼ਨ ਸਥਾਈ ਰੂਪ ਨਾਲ ਹਟਾ ਦਿਆ ਜਾਵੇਗਾ।',
    confirmDelete: 'ਸੈਸ਼ਨ ਹਟਾਓ?',
    deleting: 'ਹਟਾ ਰਿਹਾ ਹਾਂ...',
    sessionDeleted: 'ਸੈਸ਼ਨ ਹਟਾ ਦਿਆ ਗਿਆ',
    sessionRemoved: 'ਸੈਸ਼ਨ ਨੂੰ ਹਟਾ ਦਿਆ ਗਿਆ ਹੈ।',
    sessionUpdated: 'ਸੈਸ਼ਨ ਅੱਪਡੇਟ ਹੋ ਗਿਆ',
    changesApplied: 'ਆਪਣੀ ਤਬਦੀਲੀਆਂ ਸੰਭਾਲ ਲਈ ਗਈਆਂ।',
    updateFailed: 'ਅੱਪਡੇਟ ਅਸਫਲ',
    deleteFailed: 'ਹਟਾਉਣਾ ਅਸਫਲ',
    saveChanges: 'ਤਬਦੀਲੀਆਂ ਸੰਭਾਲੋ',
    milkQuantity: 'ਦਾ ਦੀ ਮਾਤਰਾ (ਲਿ)',
    milkCantBeNegative: 'ਦਾ ਨਕਾਰਾਤਮਕ ਨਹੀਂ ਹੋ ਸਕਦਾ',
    milkTooHigh: 'ਪ੍ਰਤੀ ਸੈਸ਼ਨ ਵੱਧ ਤੋਂ ਵੱਧ 100ਲਿ',
    milkRequired: 'ਦਾ ਦੀ ਮਾਤਰਾ ਲਾਜ਼ਮੀ ਹੈ',
    endTimeError: 'ਸਮਾਪਤੀ ਸਮਾਂ ਸ਼ੁਰੂ ਹੋਣ ਤੋਂ ਬਾਅਦ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ',
    actions: 'ਕਾਰਵਾਈਆਂ',
    
    // Statistics page
    statistics: 'ਅੰਕੜੇ',
    viewTrends: 'ਆਪਣੇ ਦਾ ਕੱਢਣ ਦੇ ਪੈਟਰਨ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
    noData: 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ',
    createSessionsFirst: 'ਅੰਕੜੇ ਦੇਖਣ ਲਈ ਕੁਝ ਸੈਸ਼ਨ ਬਣਾਓ',
    highestProduction: 'ਸਭ ਤੋਂ ਵੱਧ ਉਤਪਾਦਨ',
    lowestProduction: 'ਸਭ ਤੋਂ ਘੱਟ ਉਤਪਾਦਨ',
    trend: '7 ਦਿਨ ਦਾ ਰੁਝਾਨ',
    dailyTrend: 'ਰੋਜ਼ਾਨਾ ਰੁਝਾਨ',
    lastSessions: 'ਪਿਛਲੇ 30 ਦਿਨ',
    sessionDistribution: 'ਸੈਸ਼ਨ ਮਿਆਦ ਵੰਡ',
    avgDuration: 'ਔਸਤ ਮਿਆਦ',
    totalDuration: 'ਕੁੱਲ ਮਿਆਦ',
    
    // Goals page
    goals: 'ਲਕਸ਼ ਅਤੇ ਮਾਈਲ ਸਟੋਨ',
    setTargets: 'ਆਪਣੇ ਦਾ ਕੱਢਣ ਦੇ ਟੀਚੇ ਨਿਰਧਾਰਤ ਕਰੋ ਅਤੇ ਟ੍ਰੈਕ ਕਰੋ',
    createGoal: 'ਨਵਾ ਟੀਚਾ ਬਣਾਓ',
    newGoal: 'ਨਵਾ ਟੀਚਾ ਬਣਾਓ',
    goalType: 'ਟੀਚੇ ਦਕਿਸਮ',
    targetMilk: 'ਟੀਚਾ ਦਾ (ਲਿ)',
    create: 'ਬਣਾਓ',
    noGoalsYet: 'ਹਨੂੰ ਤੱਕ ਕੋਈ ਟੀਚਾ ਨਹੀਂ',
    createGoalPrompt: 'ਟ੍ਰੈਕਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣਾ ਪਹਿਲਾ ਟੀਚਾ ਨਿਰਧਾਰਤ ਕਰੋ',
    daily: 'ਰੋਜ਼ਾਨਾ ਟੀਚਾ',
    weekly: 'ਸਾਪਤਾਹਿਕ ਟੀਚਾ',
    goal: 'ਟੀਚਾ',
    active: 'ਸਕਿਰਿਆ',
    inactive: 'ਨਿਸ਼ਕਿਰਿਆ',
    target: 'ਟੀਚਾ',
    streak: 'ਸ਼ਰਿਖਲਾ',
    days: 'ਦਿਨ',
    sessionsDone: 'ਸੈਸ਼ਨ ਮੁਕੰਮਲ',
    today: 'ਅੱਜ',
    thisWeek: 'ਇਸ ਹਫ਼ਤੇ',
    goalAchieved: 'ਟੀਚਾ ਪ੍ਰਾਪਤ!',
    tips: 'ਸਫ਼ਲਤਾ ਦੇ ਸੁਝਾਅ',
    tip1: 'ਆਪਣੇ ਮੌਜੂਦਾ ਉਤਪਾਦਨ ਦੇ ਆਧਾਰ ਤੇ ਯਥਾਰਥਵਾਦੀ ਟੀਚੇ ਨਿਰਧਾਰਤ ਕਰੋ',
    tip2: 'ਰੋਜ਼ਾਨਾ ਟੀਚੇ ਤੁਹਾਨੂੰ ਇਕਰੂਰ ਰਹਿਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ',
    tip3: 'ਸਾਪਤਾਹਿਕ ਟੀਚੇ ਤੁਹਾਨੂੰ ਲਚਕ ਦਿੰਦੇ ਹਨ',
    tip4: 'ਗਤੀ ਬਣਾਉਣ ਲਈ ਆਪਣੀ ਸ਼ਰਿਖਲਾ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ',
    deleteGoal: 'ਟੀਚਾ ਹਟਾਓ?',
    deleteGoalConfirm: 'ਇਹ ਟੀਚਾ ਅਤੇ ਇਸ ਦੀ ਪ੍ਰਗਤੀ ਸਥਾਈ ਤੌਰ ਤੇ ਹਟਾ ਦਿਤੀ ਜਾਵੇਗੀ।',
    
    // Toast messages
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
