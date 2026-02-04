import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSessions, getStats, MilkingSession, StatsResponse } from '@/lib/api';
import { ArrowLeft, Calendar, Milk, Timer, Clock, Search, X, Filter, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SkeletonStats, SkeletonTable } from '@/components/Skeleton';
import { EditSessionDialog } from '@/components/EditSessionDialog';

interface Filters {
  search: string;
  milkMin: number | null;
  milkMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  durationMin: number | null;
  durationMax: number | null;
}

export default function History() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<MilkingSession[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    milkMin: null,
    milkMax: null,
    dateFrom: null,
    dateTo: null,
    durationMin: null,
    durationMax: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingSession, setEditingSession] = useState<MilkingSession | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionsData, statsData] = await Promise.all([
        getSessions(),
        getStats().catch(() => null), // Stats endpoint might not exist
      ]);
      // Sort sessions by start_time in descending order (most recent first)
      const sortedSessions = sessionsData.sort((a, b) => 
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      setSessions(sortedSessions);
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

  const filteredSessions = sessions.filter((session) => {
    // Search filter
    if (filters.search) {
      const dateStr = formatDate(session.start_time);
      const timeStr = formatTime(session.start_time);
      const milkStr = (session.milk_quantity || 0).toFixed(2);
      const query = filters.search.toLowerCase();
      if (
        !dateStr.toLowerCase().includes(query) &&
        !timeStr.toLowerCase().includes(query) &&
        !milkStr.includes(query)
      ) {
        return false;
      }
    }

    // Milk quantity filters
    const milk = session.milk_quantity || 0;
    if (filters.milkMin !== null && milk < filters.milkMin) return false;
    if (filters.milkMax !== null && milk > filters.milkMax) return false;

    // Date range filters
    if (filters.dateFrom) {
      const sessionDate = new Date(session.start_time).getTime();
      const fromDate = new Date(filters.dateFrom).getTime();
      if (sessionDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const sessionDate = new Date(session.start_time).getTime();
      const toDate = new Date(filters.dateTo).getTime() + 86400000; // Add 1 day to include the whole day
      if (sessionDate > toDate) return false;
    }

    // Duration filters
    if (filters.durationMin !== null && session.duration < filters.durationMin) return false;
    if (filters.durationMax !== null && session.duration > filters.durationMax) return false;

    return true;
  });

  const hasActiveFilters =
    filters.search ||
    filters.milkMin !== null ||
    filters.milkMax !== null ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.durationMin !== null ||
    filters.durationMax !== null;

  const resetFilters = () => {
    setFilters({
      search: '',
      milkMin: null,
      milkMax: null,
      dateFrom: null,
      dateTo: null,
      durationMin: null,
      durationMax: null,
    });
    setShowFilters(false);
  };

  const handleEditSession = (session: MilkingSession) => {
    setEditingSession(session);
    setShowEditDialog(true);
  };

  const handleSaveSession = (updated: MilkingSession) => {
    setSessions((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s._id !== id));
  };

  // Calculate stats from sessions if stats endpoint fails
  const calculatedStats = {
    totalSessions: stats?.totalSessions ?? filteredSessions.length,
    totalMilk: stats?.totalMilk ?? filteredSessions.reduce((acc, s) => acc + (s.milk_quantity || 0), 0),
    totalDuration: stats?.totalDuration ?? filteredSessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    avgMilkPerSession: stats?.avgMilkPerSession ?? (filteredSessions.length > 0 
      ? filteredSessions.reduce((acc, s) => acc + (s.milk_quantity || 0), 0) / filteredSessions.length 
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
          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t.search || 'Search sessions...'}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {t.filter || 'Filter'}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  {t.clear || 'Clear'}
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50"
              >
                {/* Milk Min */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.milkMin || 'Min Milk (L)'}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.milkMin ?? ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        milkMin: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="text-sm"
                  />
                </div>

                {/* Milk Max */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.milkMax || 'Max Milk (L)'}</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={filters.milkMax ?? ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        milkMax: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="text-sm"
                  />
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.dateFrom || 'From Date'}</label>
                  <Input
                    type="date"
                    value={filters.dateFrom ?? ''}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
                    className="text-sm"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.dateTo || 'To Date'}</label>
                  <Input
                    type="date"
                    value={filters.dateTo ?? ''}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
                    className="text-sm"
                  />
                </div>

                {/* Duration Min */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.durationMin || 'Min Duration (s)'}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.durationMin ?? ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        durationMin: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="text-sm"
                  />
                </div>

                {/* Duration Max */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t.durationMax || 'Max Duration (s)'}</label>
                  <Input
                    type="number"
                    placeholder="3600"
                    value={filters.durationMax ?? ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        durationMax: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && !showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                {t.showingResults || 'Showing results:'} {filteredSessions.length} {t.of || 'of'} {sessions.length} {t.sessions || 'sessions'}
              </motion.div>
            )}
          </motion.div>
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
                ) : filteredSessions.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 sm:py-16 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="text-6xl">
                        {hasActiveFilters ? '🔍' : '🐄'}
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                      {hasActiveFilters ? (t.noResults || 'No sessions found') : (t.noSessionsYet || 'No sessions yet')}
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6">
                      {hasActiveFilters
                        ? t.adjustFilters || 'Try adjusting your filters'
                        : t.startFirstSession || 'Start your first session'}
                    </p>
                    {!hasActiveFilters && (
                      <Link to="/">
                        <Button className="gap-2">
                          <Milk className="h-4 w-4" />
                          {t.startMilking}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
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
                          <TableHead className="text-center text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{t.actions || 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.map((session, index) => (
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
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSession(session)}
                                    className="h-8 w-8 p-0"
                                    title={t.editSession}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </div>
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

      {/* Edit Session Dialog */}
      <EditSessionDialog
        session={editingSession}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingSession(null);
        }}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
      />
    </div>
  );
}
