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

  const statCards = [
    {
      icon: BarChart3,
      label: 'معدل الإنجاز',
      value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Calendar,
      label: 'مهام اليوم',
      value: stats.createdToday,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      icon: TrendingUp,
      label: 'مكتمل هذا الأسبوع',
      value: stats.completedThisWeek,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      icon: Clock,
      label: 'متوسط وقت الإنجاز',
      value: stats.avgCompletionTime > 0 ? `${stats.avgCompletionTime}س` : 'N/A',
      color: 'text-muted-foreground',
      bg: 'bg-muted'
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        الإحصائيات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 hover:shadow-lg transition-smooth">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">تفاصيل إضافية</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.mainTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">مهام رئيسية</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.subTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">مهام فرعية</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">مكتمل</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <p className="text-2xl font-bold text-primary">{stats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">متبقي</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
