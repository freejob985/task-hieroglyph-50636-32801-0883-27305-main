import { CheckCircle2, Circle, ListTodo, TrendingUp, Target, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgressBarProps {
  total: number;
  completed: number;
  mainTasks: number;
  subTasks: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ProgressBar = ({ total, completed, mainTasks, subTasks, isCollapsed = false, onToggleCollapse }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;
  
  // تحديد لون التقدم بناءً على النسبة
  const getProgressColor = (percent: number) => {
    if (percent === 0) return 'from-gray-400 to-gray-500';
    if (percent < 25) return 'from-red-400 to-red-500';
    if (percent < 50) return 'from-orange-400 to-orange-500';
    if (percent < 75) return 'from-yellow-400 to-yellow-500';
    if (percent < 90) return 'from-blue-400 to-blue-500';
    return 'from-green-400 to-green-500';
  };

  const getProgressTextColor = (percent: number) => {
    if (percent === 0) return 'text-gray-500';
    if (percent < 25) return 'text-red-500';
    if (percent < 50) return 'text-orange-500';
    if (percent < 75) return 'text-yellow-500';
    if (percent < 90) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ListTodo className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">تقدم المهام</h2>
            <p className="text-sm text-muted-foreground">متابعة إنجازك اليومي</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-4xl font-black ${getProgressTextColor(percentage)} transition-colors duration-500`}>
              {percentage}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {completed} من {total}
            </div>
          </div>
          {/* Subtasks Breakdown */}
          {subTasks > 0 && (
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{subTasks}</div>
              <div className="text-xs text-muted-foreground">مهام فرعية</div>
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-200 group"
              title={isCollapsed ? 'إظهار التفاصيل' : 'إخفاء التفاصيل'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
      }`}>
        {/* Enhanced Progress Bar with Multiple Indicators */}
        <div className="relative mb-6 space-y-4">
        {/* Main Progress Bar */}
        <div className="relative">
          <div className="h-6 bg-secondary/50 rounded-full overflow-hidden shadow-inner border border-border/30">
            <div
              className={`absolute inset-y-0 right-0 bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-1000 ease-out rounded-full shadow-lg`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 rounded-full" />
            </div>
          </div>
          
          {/* Progress percentage indicator on the bar */}
          {percentage > 0 && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-bold shadow-lg border border-border/50"
              style={{ right: `${Math.max(0, percentage - 5)}%` }}
            >
              {percentage}%
            </div>
          )}
        </div>
        
        {/* Progress milestones */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full ${percentage >= 0 ? 'bg-primary' : 'bg-secondary'}`} />
            <span>0%</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full ${percentage >= 25 ? 'bg-orange-500' : 'bg-secondary'}`} />
            <span>25%</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full ${percentage >= 50 ? 'bg-yellow-500' : 'bg-secondary'}`} />
            <span>50%</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full ${percentage >= 75 ? 'bg-blue-500' : 'bg-secondary'}`} />
            <span>75%</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-secondary'}`} />
            <span>100%</span>
          </div>
        </div>
        
        {/* Progress status message */}
        <div className="text-center">
          <p className={`text-sm font-medium ${getProgressTextColor(percentage)}`}>
            {percentage === 0 && 'ابدأ رحلتك نحو الإنجاز! 🚀'}
            {percentage > 0 && percentage < 25 && 'بداية جيدة! استمر في التقدم 💪'}
            {percentage >= 25 && percentage < 50 && 'أنت في الطريق الصحيح! 📈'}
            {percentage >= 50 && percentage < 75 && 'أداء ممتاز! اقتربت من الهدف 🎯'}
            {percentage >= 75 && percentage < 100 && 'رائع! أنت تقترب من الإنجاز الكامل ⭐'}
            {percentage === 100 && 'تهانينا! لقد أتممت كل شيء! 🎉'}
          </p>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center mb-2">
            <Circle className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</p>
          <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">إجمالي المهام</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completed}</p>
          <p className="text-xs text-green-500 dark:text-green-300 font-medium">مكتملة</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{remaining}</p>
          <p className="text-xs text-orange-500 dark:text-orange-300 font-medium">متبقية</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{percentage}%</p>
          <p className="text-xs text-purple-500 dark:text-purple-300 font-medium">معدل الإنجاز</p>
        </div>
      </div>

      {/* Task Types with Enhanced Design */}
      <div className="bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">توزيع المهام</h3>
        <div className="flex justify-around">
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
              <ListTodo className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{mainTasks}</p>
            <p className="text-xs text-muted-foreground font-medium">مهام رئيسية</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
              <Circle className="w-6 h-6 text-accent" />
            </div>
            <p className="text-xl font-bold text-foreground">{subTasks}</p>
            <p className="text-xs text-muted-foreground font-medium">مهام فرعية</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProgressBar;
