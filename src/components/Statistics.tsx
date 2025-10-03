import { BarChart3, TrendingUp, Calendar, Clock, Target, Zap, Award, Activity, Users, CheckCircle2, Circle, Star, Trophy, Flame, Rocket } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatisticsProps {
  todos: Todo[];
}

const Statistics = ({ todos }: StatisticsProps) => {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    createdToday: todos.filter(t => t.createdAt >= today).length,
    completedThisWeek: todos.filter(t => t.completed && t.updatedAt >= weekAgo).length,
    mainTasks: todos.filter(t => !t.parentId).length,
    subTasks: todos.filter(t => t.parentId).length,
    avgCompletionTime: calculateAvgCompletionTime(todos),
    // إحصائيات متقدمة
    streak: calculateStreak(todos),
    productivity: calculateProductivity(todos),
    efficiency: calculateEfficiency(todos),
    recentActivity: calculateRecentActivity(todos),
  };

  function calculateAvgCompletionTime(todos: Todo[]) {
    const completed = todos.filter(t => t.completed);
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((acc, todo) => {
      return acc + (todo.updatedAt - todo.createdAt);
    }, 0);
    
    return Math.round(totalTime / completed.length / (1000 * 60 * 60)); // hours
  }

  function calculateStreak(todos: Todo[]) {
    // حساب سلسلة الأيام المتتالية مع إنجاز مهام
    const completed = todos.filter(t => t.completed);
    if (completed.length === 0) return 0;
    
    const completionDates = completed.map(t => new Date(t.updatedAt).toDateString());
    const uniqueDates = [...new Set(completionDates)].sort();
    
    let streak = 0;
    let currentStreak = 0;
    const today = new Date().toDateString();
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (i === uniqueDates.length - 1) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(uniqueDates[i + 1]);
        if (prevDate.getTime() - date.getTime() === 24 * 60 * 60 * 1000) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      
      streak = Math.max(streak, currentStreak);
    }
    
    return streak;
  }

  function calculateProductivity(todos: Todo[]) {
    // حساب الإنتاجية بناءً على المهام المكتملة في الأسبوع الماضي
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentCompleted = todos.filter(t => t.completed && t.updatedAt >= weekAgo);
    return recentCompleted.length;
  }

  function calculateEfficiency(todos: Todo[]) {
    // حساب الكفاءة بناءً على نسبة المهام المكتملة إلى المهام المعلقة
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.completed).length;
    return Math.round((completed / todos.length) * 100);
  }

  function calculateRecentActivity(todos: Todo[]) {
    // حساب النشاط الأخير (آخر 24 ساعة)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return todos.filter(t => t.updatedAt >= dayAgo).length;
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const statCards = [
    {
      icon: Trophy,
      label: 'معدل الإنجاز',
      value: `${completionRate}%`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 dark:from-amber-900/20 dark:via-amber-800/20 dark:to-yellow-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      description: 'نسبة المهام المكتملة',
      trend: completionRate >= 75 ? 'excellent' : completionRate >= 50 ? 'good' : 'needs-improvement',
      gradient: 'from-amber-400 to-yellow-500',
      emoji: completionRate >= 75 ? '🏆' : completionRate >= 50 ? '🥈' : '🥉'
    },
    {
      icon: Target,
      label: 'سلسلة الإنجاز',
      value: `${stats.streak} يوم`,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-red-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      description: 'أيام متتالية من الإنجاز',
      trend: stats.streak >= 7 ? 'excellent' : stats.streak >= 3 ? 'good' : 'needs-improvement',
      gradient: 'from-orange-400 to-red-500',
      emoji: stats.streak >= 7 ? '🔥' : stats.streak >= 3 ? '⚡' : '💪'
    },
    {
      icon: Zap,
      label: 'الإنتاجية',
      value: `${stats.productivity}`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-indigo-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      description: 'مهام مكتملة هذا الأسبوع',
      trend: stats.productivity >= 10 ? 'excellent' : stats.productivity >= 5 ? 'good' : 'needs-improvement',
      gradient: 'from-blue-400 to-indigo-500',
      emoji: stats.productivity >= 10 ? '🚀' : stats.productivity >= 5 ? '⚡' : '📈'
    },
    {
      icon: Activity,
      label: 'النشاط الأخير',
      value: `${stats.recentActivity}`,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 dark:from-green-900/20 dark:via-green-800/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-800',
      description: 'مهام محدثة في آخر 24 ساعة',
      trend: stats.recentActivity >= 5 ? 'excellent' : stats.recentActivity >= 2 ? 'good' : 'needs-improvement',
      gradient: 'from-green-400 to-emerald-500',
      emoji: stats.recentActivity >= 5 ? '🌟' : stats.recentActivity >= 2 ? '✨' : '💫'
    },
    {
      icon: CheckCircle2,
      label: 'المهام المكتملة',
      value: `${stats.completed}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:via-emerald-800/20 dark:to-teal-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      description: 'إجمالي المهام المنجزة',
      trend: stats.completed >= 20 ? 'excellent' : stats.completed >= 10 ? 'good' : 'needs-improvement',
      gradient: 'from-emerald-400 to-teal-500',
      emoji: stats.completed >= 20 ? '🎯' : stats.completed >= 10 ? '✅' : '📝'
    },
    {
      icon: Circle,
      label: 'المهام المعلقة',
      value: `${stats.pending}`,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-gradient-to-br from-slate-50 via-slate-100 to-gray-50 dark:from-slate-900/20 dark:via-slate-800/20 dark:to-gray-900/20',
      border: 'border-slate-200 dark:border-slate-800',
      description: 'المهام في الانتظار',
      trend: stats.pending <= 5 ? 'excellent' : stats.pending <= 10 ? 'good' : 'needs-improvement',
      gradient: 'from-slate-400 to-gray-500',
      emoji: stats.pending <= 5 ? '🎉' : stats.pending <= 10 ? '👍' : '⏳'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            لوحة الإحصائيات المتقدمة
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          تتبع أداءك وإنجازاتك مع إحصائيات تفصيلية ومؤشرات ذكية
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className={`group relative overflow-hidden p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${stat.bg} ${stat.border} border-2`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              
              <div className="relative space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {stat.emoji}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.label}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </span>
                    {stat.label === 'معدل الإنجاز' && (
                      <span className="text-sm text-muted-foreground">من 100%</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
                
                {/* Progress Bar for Completion Rate */}
                {stat.label === 'معدل الإنجاز' && (
                  <div className="space-y-3">
                    <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
                
                {/* Trend Indicator */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stat.trend === 'excellent' ? 'bg-green-500' :
                      stat.trend === 'good' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {stat.trend === 'excellent' ? 'ممتاز' :
                       stat.trend === 'good' ? 'جيد' :
                       'يحتاج تحسين'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Performance Overview */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50 border-2 border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">نظرة عامة على الأداء</h3>
            </div>
            <p className="text-muted-foreground">تحليل شامل لأداءك وإنجازاتك</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">{stats.mainTasks}</p>
              <p className="text-sm font-bold text-foreground mb-1">مهام رئيسية</p>
              <p className="text-xs text-muted-foreground">المهام الأساسية</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">{stats.subTasks}</p>
              <p className="text-sm font-bold text-foreground mb-1">مهام فرعية</p>
              <p className="text-xs text-muted-foreground">المهام المساعدة</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">{stats.completed}</p>
              <p className="text-sm font-bold text-foreground mb-1">مكتملة</p>
              <p className="text-xs text-muted-foreground">تم إنجازها</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl">⏳</span>
              </div>
              <p className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-2">{stats.pending}</p>
              <p className="text-sm font-bold text-foreground mb-1">متبقية</p>
              <p className="text-xs text-muted-foreground">في الانتظار</p>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-foreground">الإنتاجية اليومية</h4>
              </div>
              <p className="text-2xl font-black text-blue-600 mb-2">
                {stats.createdToday > 0 ? `${stats.createdToday} مهمة` : '0 مهام'}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.createdToday > 0 ? 'مهام جديدة اليوم' : 'لا توجد مهام جديدة'}
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-foreground">الإنجاز الأسبوعي</h4>
              </div>
              <p className="text-2xl font-black text-green-600 mb-2">
                {stats.completedThisWeek > 0 ? `${stats.completedThisWeek} مهمة` : '0 مهام'}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.completedThisWeek > 0 ? 'مكتملة هذا الأسبوع' : 'لا توجد إنجازات'}
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-foreground">كفاءة الإنجاز</h4>
              </div>
              <p className="text-2xl font-black text-amber-600 mb-2">
                {completionRate}%
              </p>
              <p className="text-sm text-muted-foreground">
                {completionRate >= 75 ? 'ممتازة 🎉' : 
                 completionRate >= 50 ? 'جيدة 👍' : 
                 'تحتاج تحسين 💪'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
