import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessions, MilkingSession } from '@/lib/api';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Trophy,
  Clock,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SkeletonStats } from '@/components/Skeleton';

interface DailyStats {
  date: string;
  milk: number;
  sessions: number;
  duration: number;
  avgMilk: number;
}

interface TrendData {
  label: string;
  value: number;
  date: string;
}

export default function Statistics() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<MilkingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionsData = await getSessions(100, 0);
      setSessions(sessionsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Error loading statistics',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate daily statistics
  const getDailyStats = (): DailyStats[] => {
    const dailyMap = new Map<string, { milk: number; sessions: number; duration: number }>();

    sessions.forEach((session) => {
      const date = new Date(session.start_time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const existing = dailyMap.get(date) || { milk: 0, sessions: 0, duration: 0 };
      existing.milk += session.milk_quantity || 0;
      existing.sessions += 1;
      existing.duration += session.duration || 0;
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        ...stats,
        avgMilk: stats.milk / stats.sessions,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const dailyStats = getDailyStats();

  // Overall statistics
  const totalSessions = sessions.length;
  const totalMilk = sessions.reduce((acc, s) => acc + (s.milk_quantity || 0), 0);
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgMilkPerSession = totalSessions > 0 ? totalMilk / totalSessions : 0;
  const avgDurationPerSession = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Find highest and lowest milk
  const highestSession = sessions.length > 0
    ? sessions.reduce((max, s) => (s.milk_quantity > max.milk_quantity ? s : max))
    : null;
  const lowestSession = sessions.length > 0
    ? sessions.reduce((min, s) => (s.milk_quantity < min.milk_quantity ? s : min))
    : null;

  // Calculate trend (last 7 days average vs previous 7 days)
  const last7Days = dailyStats.slice(-7);
  const prev7Days = dailyStats.slice(-14, -7);
  const last7AvgMilk = last7Days.length > 0
    ? last7Days.reduce((acc, d) => acc + d.milk, 0) / last7Days.length
    : 0;
  const prev7AvgMilk = prev7Days.length > 0
    ? prev7Days.reduce((acc, d) => acc + d.milk, 0) / prev7Days.length
    : 0;
  const trendPercentage =
    prev7AvgMilk === 0 ? 0 : ((last7AvgMilk - prev7AvgMilk) / prev7AvgMilk) * 100;

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
        <motion.header
          className="p-3 sm:p-4 md:p-6 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 max-w-6xl mx-auto">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold">{t.statistics || 'Statistics'}</h1>
            </div>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </motion.header>
        <main className="p-6 flex items-center justify-center min-h-[calc(100vh-100px)]">
          <SkeletonStats rows={3} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex flex-col relative overflow-hidden">
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
        <div className="flex items-center gap-3 sm:gap-4 max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-secondary/80">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              {t.statistics || 'Statistics & Analytics'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.viewTrends || 'Analyze your milking patterns'}</p>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {error ? (
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                {t.tryAgain}
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-6">📊</div>
              <p className="text-xl sm:text-2xl font-bold mb-2">{t.noData || 'No data available'}</p>
              <p className="text-muted-foreground mb-6">
                {t.createSessionsFirst || 'Create some sessions to see statistics'}
              </p>
              <Link to="/">
                <Button>{t.startMilking}</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Key Metrics */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {/* Total Sessions */}
                <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold">{totalSessions}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t.totalSessions}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Total Milk */}
                <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold">{totalMilk.toFixed(1)}L</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.totalMilk}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Average Per Session */}
                <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {avgMilkPerSession.toFixed(1)}L
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t.avgPerSession}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Trend */}
                <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 ${
                        trendPercentage >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <TrendingUp
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        />
                      </div>
                      <p className={`text-2xl sm:text-3xl font-bold ${
                        trendPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t.trend || '7-Day Trend'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Detailed Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Highest Session */}
                {highestSession && (
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        {t.highestProduction || 'Highest Production'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.milk}:</span>
                        <span className="text-xl font-bold text-primary">
                          {highestSession.milk_quantity.toFixed(2)}L
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.date}:</span>
                        <span className="text-sm">
                          {formatDate(highestSession.start_time)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.duration}:</span>
                        <span className="text-sm">{formatDuration(highestSession.duration)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lowest Session */}
                {lowestSession && (
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Zap className="h-4 w-4 text-blue-500" />
                        {t.lowestProduction || 'Lowest Production'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.milk}:</span>
                        <span className="text-xl font-bold text-accent">
                          {lowestSession.milk_quantity.toFixed(2)}L
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.date}:</span>
                        <span className="text-sm">{formatDate(lowestSession.start_time)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t.duration}:</span>
                        <span className="text-sm">{formatDuration(lowestSession.duration)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Daily Trend Chart */}
              {dailyStats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t.dailyTrend || 'Daily Trend'}
                      </CardTitle>
                      <CardDescription>{t.lastSessions || 'Last 30 days'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dailyStats.slice(-30).map((day, idx) => (
                          <motion.div
                            key={day.date}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02, duration: 0.3 }}
                            className="flex items-center gap-4"
                          >
                            <div className="min-w-16 text-xs font-medium text-muted-foreground">
                              {formatDate(day.date)}
                            </div>
                            <div className="flex-1 bg-secondary/50 rounded-full overflow-hidden h-8 relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(day.milk / (Math.max(...dailyStats.map((d) => d.milk)) || 1)) * 100}%`,
                                }}
                                transition={{ delay: idx * 0.05, duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-end pr-2"
                              />
                            </div>
                            <div className="min-w-12 text-right text-sm font-medium">
                              {day.milk.toFixed(1)}L
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Session Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t.sessionDistribution || 'Session Duration Distribution'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.avgDuration || 'Average Duration'}:</span>
                        <span className="font-medium">{formatDuration(avgDurationPerSession)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.totalDuration || 'Total Duration'}:</span>
                        <span className="font-medium">{formatDuration(totalDuration)}</span>
                      </div>
                      <div className="pt-4 space-y-2">
                        {[
                          {
                            label: '<5m',
                            count: sessions.filter((s) => s.duration < 300).length,
                          },
                          {
                            label: '5m-15m',
                            count: sessions.filter((s) => s.duration >= 300 && s.duration < 900).length,
                          },
                          {
                            label: '15m-30m',
                            count: sessions.filter((s) => s.duration >= 900 && s.duration < 1800).length,
                          },
                          {
                            label: '>30m',
                            count: sessions.filter((s) => s.duration >= 1800).length,
                          },
                        ].map((group) => (
                          <div key={group.label} className="flex items-center gap-3">
                            <div className="min-w-16 text-xs font-medium">{group.label}</div>
                            <div className="flex-1 bg-secondary/50 rounded-full overflow-hidden h-6">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(group.count / totalSessions) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary/50 to-accent/50"
                              />
                            </div>
                            <div className="min-w-12 text-right text-xs font-medium">{group.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
