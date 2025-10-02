import { useState } from 'react';
import { Trash2, Search, BookmarkCheck } from 'lucide-react';
import { SavedTask } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface SavedTasksManagerProps {
  savedTasks: SavedTask[];
  onDelete: (id: string) => void;
  onUse: (text: string) => void;
}

const SavedTasksManager = ({ savedTasks, onDelete, onUse }: SavedTasksManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = savedTasks.filter(task =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (task: SavedTask) => {
    const result = await Swal.fire({
      title: 'حذف القالب',
      text: `هل تريد حذف "${task.text}"؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      onDelete(task.id);
      toast.success('تم حذف القالب');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-primary" />
          القوالب المحفوظة
        </h2>
        <span className="text-sm text-muted-foreground">
          {savedTasks.length} قالب
        </span>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في القوالب..."
            className="pr-10"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookmarkCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{searchQuery ? 'لا توجد نتائج' : 'لا توجد قوالب محفوظة'}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-smooth group"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onUse(task.text)}>
                <p className="text-sm font-medium">{task.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  استخدم {task.usageCount} مرة
                </p>
              </div>
              <Button
                onClick={() => handleDelete(task)}
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-smooth text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default SavedTasksManager;
