import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  RefreshCw,
  UserCircle,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { 
  getStats, 
  getDailyBreakdown, 
  getClassDistribution, 
  getTodayStats,
  PeriodStats,
  DailyBreakdown,
  ClassDistribution,
  TodayStats
} from '../services/api';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<PeriodStats | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdown | null>(null);
  const [distribution, setDistribution] = useState<ClassDistribution | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, dailyDataResult, distData, todayData] = await Promise.all([
        getStats(period),
        getDailyBreakdown(period === 'today' ? 'week' : period === 'year' || period === 'all' ? 'month' : period),
        getClassDistribution(period),
        getTodayStats()
      ]);
      setStats(statsData);
      setDailyBreakdown(dailyDataResult);
      setDistribution(distData);
      setTodayStats(todayData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' }
  ];

  const classCards = [
    {
      name: 'Admin',
      count: stats?.admin_count || 0,
      percentage: distribution?.admin?.percentage || 0,
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    },
    {
      name: 'Student',
      count: stats?.student_count || 0,
      percentage: distribution?.student?.percentage || 0,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      name: 'Teacher',
      count: stats?.teacher_count || 0,
      percentage: distribution?.teacher?.percentage || 0,
      icon: UserCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    }
  ];

  const dailyData = dailyBreakdown?.data || [];
  const maxDaily = Math.max(...(dailyData.length > 0 ? dailyData.map(d => d.total_detections) : [1]), 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
            Detection Analytics
          </h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Track your ID card detection statistics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-1.5 sm:gap-2"
      >
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              period === p.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Today's Quick Stats */}
      {todayStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            Today's Activity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{todayStats.total_detections}</div>
              <div className="text-xs sm:text-sm text-gray-400">Detections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{todayStats.request_count}</div>
              <div className="text-xs sm:text-sm text-gray-400">Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{(todayStats.avg_inference_time_ms || 0).toFixed(0)}</div>
              <div className="text-xs sm:text-sm text-gray-400">Avg Time (ms)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {todayStats.admin_count + todayStats.student_count + todayStats.teacher_count > 0
                  ? Math.round((Math.max(todayStats.admin_count, todayStats.student_count, todayStats.teacher_count) / 
                      (todayStats.admin_count + todayStats.student_count + todayStats.teacher_count)) * 100)
                  : 0}%
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Top Class %</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Class Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {classCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textColor}`} />
              </div>
              <span className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>
                {card.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{card.count}</div>
            <div className="text-gray-400 text-sm sm:text-base">{card.name} Cards</div>
            <div className="mt-3 sm:mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${card.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Chart */}
      {dailyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            Daily Detections
          </h3>
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-48 pb-6">
            {dailyData.slice(-7).map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.total_detections / maxDaily) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                className="flex-1 min-w-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group cursor-pointer min-h-[4px]"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.total_detections} detections
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Period Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Detections</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.total_detections}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Admin Cards</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.admin_count}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Student Cards</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.student_count}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Teacher Cards</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.teacher_count}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && stats?.total_detections === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12"
        >
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">No Detection Data Yet</h3>
          <p className="text-gray-500 text-sm sm:text-base">Start detecting ID cards to see your statistics here!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
