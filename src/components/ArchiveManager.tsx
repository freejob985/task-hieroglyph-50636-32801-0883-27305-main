import { useState, useEffect } from 'react';
import { Archive, RotateCcw, Trash2, Search, ChevronLeft, ChevronRight, Calendar, User, FileText, Eye, EyeOff } from 'lucide-react';
import { ArchivedTask, ArchivePage } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface ArchiveManagerProps {
  archivedTasks: ArchivedTask[];
  onRestoreTask: (archivedTask: ArchivedTask) => void;
  onDeleteArchivedTask: (archivedTaskId: string) => void;
  onArchiveTask: (mainTaskId: string, reason?: string) => void;
  todos: any[]; // للوصول إلى المهام الحالية
}

const ArchiveManager = ({
  archivedTasks,
  onRestoreTask,
  onDeleteArchivedTask,
  onArchiveTask,
  todos
}: ArchiveManagerProps) => {
  const [showArchive, setShowArchive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const itemsPerPage = 5;

  // فلترة المهام المؤرشفة
  const filteredTasks = archivedTasks.filter(task =>
    task.mainTask.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.subTasks.some(sub => sub.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // حساب الصفحات
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // إعادة تعيين الصفحة عند تغيير البحث
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleArchiveTask = async (taskId: string) => {
    const mainTask = todos.find(t => t.id === taskId && !t.parentId);
    if (!mainTask) {
      toast.error('المهمة الرئيسية غير موجودة');
      return;
    }

    setSelectedTaskId(taskId);
    setShowArchiveDialog(true);
  };

  const confirmArchive = async () => {
    if (!selectedTaskId) return;

    const mainTask = todos.find(t => t.id === selectedTaskId && !t.parentId);
    if (!mainTask) {
      toast.error('المهمة الرئيسية غير موجودة');
      return;
    }

    onArchiveTask(selectedTaskId, archiveReason || undefined);
    setShowArchiveDialog(false);
    setSelectedTaskId(null);
    setArchiveReason('');
    toast.success('تم أرشفة المهمة بنجاح');
  };

  const handleRestoreTask = (archivedTask: ArchivedTask) => {
    onRestoreTask(archivedTask);
    toast.success('تم استعادة المهمة بنجاح');
  };

  const handleDeleteArchivedTask = (archivedTask: ArchivedTask) => {
    onDeleteArchivedTask(archivedTask.id);
    toast.success('تم حذف المهمة نهائياً من الأرشيف');
  };

  const toggleDetails = (taskId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // الحصول على المهام الرئيسية التي يمكن أرشفتها
  const availableMainTasks = todos.filter(t => !t.parentId && !t.completed);

  return (
    <>
      {/* زر فتح الأرشيف */}
      <Dialog open={showArchive} onOpenChange={setShowArchive}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 hover:shadow-md transition-smooth"
          >
            <Archive className="w-4 h-4" />
            الأرشيف ({archivedTasks.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Archive className="w-6 h-6 text-primary" />
              إدارة الأرشيف
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* شريط البحث */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث في الأرشيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            <Button
              onClick={() => setShowArchiveDialog(true)}
              variant="gradient"
              className="gap-2"
              disabled={availableMainTasks.length === 0}
            >
              <Archive className="w-4 h-4" />
              أرشفة مهمة ({availableMainTasks.length})
            </Button>
            </div>

            {/* قائمة المهام المؤرشفة */}
            {paginatedTasks.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مهام مؤرشفة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'جرب كلمات بحث مختلفة' : 'أضف مهام جديدة لأرشفتها لاحقاً'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedTasks.map((archivedTask) => (
                  <Card key={archivedTask.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {archivedTask.mainTask.text}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(archivedTask.archivedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {archivedTask.archivedBy}
                            </div>
                            <Badge variant="secondary">
                              {archivedTask.subTasks.length} مهمة فرعية
                            </Badge>
                          </div>
                          {archivedTask.reason && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              السبب: {archivedTask.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDetails(archivedTask.id)}
                            className="gap-2"
                          >
                            {showDetails[archivedTask.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            {showDetails[archivedTask.id] ? 'إخفاء' : 'تفاصيل'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreTask(archivedTask)}
                            className="gap-2 text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4" />
                            استعادة
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteArchivedTask(archivedTask)}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* تفاصيل المهام الفرعية */}
                    {showDetails[archivedTask.id] && archivedTask.subTasks.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            المهام الفرعية:
                          </h4>
                          <div className="space-y-1">
                            {archivedTask.subTasks.map((subTask) => (
                              <div
                                key={subTask.id}
                                className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md"
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  subTask.completed ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                <span className={`text-sm ${
                                  subTask.completed ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {subTask.text}
                                </span>
                                {subTask.url && (
                                  <Badge variant="outline" className="text-xs">
                                    رابط
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* عناصر التحكم في الصفحات */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  عرض {startIndex + 1} إلى {Math.min(endIndex, filteredTasks.length)} من {filteredTasks.length} مهمة
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    السابق
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    التالي
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  صفحة {currentPage} من {totalPages}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة أرشفة مهمة */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>أرشفة مهمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                اختر المهمة المراد أرشفتها:
              </label>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">اختر مهمة...</option>
                {availableMainTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.text}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                سبب الأرشفة (اختياري):
              </label>
              <Textarea
                placeholder="أدخل سبب أرشفة هذه المهمة..."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={confirmArchive}
                disabled={!selectedTaskId}
                className="flex-1 gap-2"
              >
                <Archive className="w-4 h-4" />
                أرشفة المهمة
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowArchiveDialog(false);
                  setSelectedTaskId(null);
                  setArchiveReason('');
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArchiveManager;
