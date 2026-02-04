import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center"
    >
      <div className="flex items-center bg-secondary/50 rounded-full p-1">
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className={`rounded-full px-3 py-1 h-7 text-xs font-medium transition-all ${
            language === 'en' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-secondary/80'
          }`}
        >
          EN
        </Button>
        <Button
          variant={language === 'hi' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('hi')}
          className={`rounded-full px-3 py-1 h-7 text-xs font-medium transition-all ${
            language === 'hi' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-secondary/80'
          }`}
        >
          हि
        </Button>
        <Button
          variant={language === 'pa' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('pa')}
          className={`rounded-full px-3 py-1 h-7 text-xs font-medium transition-all ${
            language === 'pa' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-secondary/80'
          }`}
        >
          ਪਾ
        </Button>
      </div>
    </motion.div>
  );
}
