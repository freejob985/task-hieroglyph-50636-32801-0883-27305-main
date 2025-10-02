import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

interface ProgressBarProps {
  total: number;
  completed: number;
  mainTasks: number;
  subTasks: number;
}

const ProgressBar = ({ total, completed, mainTasks, subTasks }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          تقدم المهام
        </h2>
        <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 right-0 gradient-primary transition-all duration-500 ease-out rounded-full shadow-glow"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <Circle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">إجمالي</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-success">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-success">{completed}</p>
          <p className="text-xs text-muted-foreground">مكتمل</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 text-primary">
            <ListTodo className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-primary">{total - completed}</p>
          <p className="text-xs text-muted-foreground">متبقي</p>
        </div>
      </div>

      {/* Task Types */}
      <div className="mt-4 pt-4 border-t border-border flex justify-around text-sm">
        <div className="text-center">
          <p className="font-semibold">{mainTasks}</p>
          <p className="text-muted-foreground text-xs">رئيسية</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{subTasks}</p>
          <p className="text-muted-foreground text-xs">فرعية</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
