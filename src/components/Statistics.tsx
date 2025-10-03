import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Card } from '@/components/ui/card';

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
  };

  function calculateAvgCompletionTime(todos: Todo[]) {
    const completed = todos.filter(t => t.completed);
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((acc, todo) => {
      return acc + (todo.updatedAt - todo.createdAt);
    }, 0);
    
    return Math.round(totalTime / completed.length / (1000 * 60 * 60)); // hours
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const statCards = [
    {
      icon: BarChart3,
      label: 'معدل الإنجاز',
      value: `${completionRate}%`,
      color: 'text-primary',
      bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
      border: 'border-primary/20',
      description: 'نسبة المهام المكتملة',
      trend: completionRate >= 75 ? 'excellent' : completionRate >= 50 ? 'good' : 'needs-improvement'
    },
    {
      icon: BarChart3,
      label: 'المهام الرئيسية',
      value: stats.mainTasks.toString(),
      color: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-25',
      border: 'border-blue-200',
      description: 'عدد المهام الرئيسية',
      trend: 'stable'
    },
    {
      icon: BarChart3,
      label: 'المهام الفرعية',
      value: stats.subTasks.toString(),
      color: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-25',
      border: 'border-purple-200',
      description: 'عدد المهام الفرعية',
      trend: 'stable',
      badge: stats.subTasks > 0 ? 'نشط' : 'غير موجود'
    },
    {
      icon: Calendar,
      label: 'مهام اليوم',
      value: stats.createdToday,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-800',
      description: 'مهام جديدة اليوم',
      trend: stats.createdToday > 0 ? 'positive' : 'neutral'
    },
    {
      icon: TrendingUp,
      label: 'مكتمل هذا الأسبوع',
      value: stats.completedThisWeek,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      border: 'border-green-200 dark:border-green-800',
      description: 'إنجازات هذا الأسبوع',
      trend: stats.completedThisWeek > 0 ? 'positive' : 'neutral'
    },
    {
      icon: Clock,
      label: 'متوسط وقت الإنجاز',
      value: stats.avgCompletionTime > 0 ? `${stats.avgCompletionTime}س` : 'N/A',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-800',
      description: 'الوقت المتوسط للإنجاز',
      trend: stats.avgCompletionTime > 0 ? 'positive' : 'neutral'
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        الإحصائيات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const getTrendIcon = (trend: string) => {
            switch (trend) {
              case 'excellent': return '🎉';
              case 'good': return '👍';
              case 'positive': return '📈';
              case 'needs-improvement': return '💪';
              default: return '📊';
            }
          };
          
          return (
            <Card key={index} className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${stat.bg} ${stat.border} border-2`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {stat.badge}
                      </span>
                    )}
                    <span className="text-2xl opacity-70">{getTrendIcon(stat.trend)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color} transition-colors duration-300`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
                
                {/* Progress indicator for completion rate */}
                {stat.label === 'معدل الإنجاز' && (
                  <div className="space-y-2">
                    <div className="w-full bg-secondary/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                          completionRate >= 75 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          completionRate >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Detailed Stats */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-2 border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">تفاصيل إضافية</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.mainTasks}</p>
            <p className="text-sm text-muted-foreground font-medium">مهام رئيسية</p>
            <p className="text-xs text-muted-foreground/70 mt-1">المهام الأساسية</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.subTasks}</p>
            <p className="text-sm text-muted-foreground font-medium">مهام فرعية</p>
            <p className="text-xs text-muted-foreground/70 mt-1">المهام المساعدة</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            <p className="text-sm text-muted-foreground font-medium">مكتملة</p>
            <p className="text-xs text-muted-foreground/70 mt-1">تم إنجازها</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
            <p className="text-sm text-muted-foreground font-medium">متبقية</p>
            <p className="text-xs text-muted-foreground/70 mt-1">في الانتظار</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">معدل الإنتاجية اليومية</p>
              <p className="text-lg font-bold text-foreground">
                {stats.createdToday > 0 ? `${stats.createdToday} مهمة/يوم` : 'لا توجد مهام جديدة'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">معدل الإنجاز الأسبوعي</p>
              <p className="text-lg font-bold text-foreground">
                {stats.completedThisWeek > 0 ? `${stats.completedThisWeek} مهمة/أسبوع` : 'لا توجد إنجازات'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">كفاءة الإنجاز</p>
              <p className="text-lg font-bold text-foreground">
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
