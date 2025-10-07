import { useState, useRef, useEffect } from 'react';
import { Check, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { SubTask } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SubTaskListProps {
  subTasks: SubTask[];
  onSubTasksChange: (subTasks: SubTask[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  soundEnabled?: boolean;
}

const SubTaskList = ({
  subTasks,
  onSubTasksChange,
  isCollapsed,
  onToggleCollapse,
  soundEnabled = true
}: SubTaskListProps) => {
  const [newTaskText, setNewTaskText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // دالة لإنشاء أصوات مختلفة للأحداث
  const playSound = (type: 'add' | 'delete' | 'toggle') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const currentTime = audioContext.currentTime;
    
    switch (type) {
      case 'add':
        // صوت إضافة مهمة فرعية - نغمة خفيفة
        oscillator.frequency.setValueAtTime(523.25, currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.2);
        break;
        
      case 'delete':
        // صوت حذف مهمة فرعية - نغمة منخفضة
        oscillator.frequency.setValueAtTime(392.00, currentTime); // G4
        oscillator.frequency.setValueAtTime(349.23, currentTime + 0.1); // F4
        gainNode.gain.setValueAtTime(0.25, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'toggle':
        // صوت تبديل حالة المهمة - نغمة متوسطة
        oscillator.frequency.setValueAtTime(440, currentTime); // A4
        oscillator.frequency.setValueAtTime(523.25, currentTime + 0.05); // C5
        gainNode.gain.setValueAtTime(0.15, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.1);
        break;
    }
  };

  const addSubTask = () => {
    if (newTaskText.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString() + Math.random(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      onSubTasksChange([...subTasks, newSubTask]);
      setNewTaskText('');
      playSound('add');
      toast.success('تم إضافة المهمة الفرعية');
      
      // إعادة التركيز على حقل الإدخال
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const updateSubTask = (id: string, text: string) => {
    const updatedSubTasks = subTasks.map(subTask =>
      subTask.id === id ? { ...subTask, text, updatedAt: Date.now() } : subTask
    );
    onSubTasksChange(updatedSubTasks);
  };

  const toggleSubTask = (id: string) => {
    const updatedSubTasks = subTasks.map(subTask =>
      subTask.id === id ? { ...subTask, completed: !subTask.completed, updatedAt: Date.now() } : subTask
    );
    onSubTasksChange(updatedSubTasks);
    playSound('toggle');
  };

  const deleteSubTask = (id: string) => {
    const updatedSubTasks = subTasks.filter(subTask => subTask.id !== id);
    onSubTasksChange(updatedSubTasks);
    playSound('delete');
    toast.success('تم حذف المهمة الفرعية');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubTask();
    }
  };

  const completedCount = subTasks.filter(task => task.completed).length;
  const totalCount = subTasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            المهام الفرعية ({completedCount}/{totalCount})
          </span>
          {totalCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-6 w-6 p-0 hover:bg-primary/10"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="space-y-2">
          {/* إضافة مهمة فرعية جديدة */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب مهمة فرعية جديدة..."
              className="flex-1"
            />
            <Button
              onClick={addSubTask}
              size="sm"
              variant="outline"
              disabled={!newTaskText.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </Button>
          </div>

          {/* قائمة المهام الفرعية */}
          {subTasks.length > 0 ? (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 hover:bg-secondary/50 ${
                    subTask.completed ? 'bg-success/5 border-success/20' : 'bg-card border-border'
                  }`}
                >
                  <Checkbox
                    checked={subTask.completed}
                    onCheckedChange={() => toggleSubTask(subTask.id)}
                    className="border-2 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white focus-visible:ring-green-500 data-[state=checked]:border-green-500 hover:border-green-600 transition-colors"
                    title="تمييز كمكتملة"
                  />
                  
                  <div className="flex-1 flex items-center gap-2">
                    {subTask.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    
                    <Input
                      value={subTask.text}
                      onChange={(e) => updateSubTask(subTask.id, e.target.value)}
                      className={`flex-1 border-0 bg-transparent p-0 h-auto ${
                        subTask.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                      placeholder="نص المهمة الفرعية..."
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubTask(subTask.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد مهام فرعية</p>
              <p className="text-xs">اكتب مهمة فرعية واضغط Enter لإضافتها</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubTaskList;
