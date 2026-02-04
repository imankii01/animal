import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSessions, getStats, MilkingSession, StatsResponse } from '@/lib/api';
import { ArrowLeft, Calendar, Milk, Timer, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SkeletonStats, SkeletonTable } from '@/components/Skeleton';

export default function History() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<MilkingSession[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionsData, statsData] = await Promise.all([
        getSessions(),
        getStats().catch(() => null), // Stats endpoint might not exist
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Error loading history',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Calculate stats from sessions if stats endpoint fails
  const calculatedStats = {
    totalSessions: stats?.totalSessions ?? sessions.length,
    totalMilk: stats?.totalMilk ?? sessions.reduce((acc, s) => acc + (s.milk_quantity || 0), 0),
    totalDuration: stats?.totalDuration ?? sessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    avgMilkPerSession: stats?.avgMilkPerSession ?? (sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + (s.milk_quantity || 0), 0) / sessions.length 
      : 0),
  };

  const totalMinutes = Math.floor(calculatedStats.totalDuration / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        className="p-3 sm:p-4 md:p-6 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 sm:gap-4 max-w-5xl mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-secondary/80">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t.milkingHistory}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.viewAllSessions}</p>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 relative z-10">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{calculatedStats.totalSessions || 0}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.totalSessions}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Milk className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{(calculatedStats.totalMilk || 0).toFixed(1)}L</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.totalMilk}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalMinutes || 0}m</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.totalTime}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{(calculatedStats.avgMilkPerSession || 0).toFixed(1)}L</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.avgPerSession}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sessions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <SkeletonTable rows={5} />
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchData} variant="outline">
                      {t.tryAgain}
                    </Button>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg mb-2">{t.noSessionsYet}</p>
                    <p className="text-sm">{t.startFirstSession}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border">
                          <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{t.date}</TableHead>
                          <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{t.startTime}</TableHead>
                          <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{t.endTime}</TableHead>
                          <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{t.duration}</TableHead>
                          <TableHead className="text-right text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{t.milk}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session, index) => (
                          <motion.tr 
                            key={session._id} 
                            className={`border-b border-border last:border-0 table-row-hover transition-colors ${index % 2 === 0 ? 'table-row-even' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <TableCell className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">
                              {formatDate(session.start_time)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                              {formatTime(session.start_time)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                              {formatTime(session.end_time)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                              {formatDuration(session.duration)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary text-xs sm:text-sm whitespace-nowrap">
                              {(session.milk_quantity || 0).toFixed(2)} L
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
