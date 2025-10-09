import { useState } from 'react';
import { TaskStatus } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Palette, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface StatusManagerProps {
  statuses: TaskStatus[];
  onStatusesChange: (statuses: TaskStatus[]) => void;
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string | undefined) => void;
  showSelect?: boolean;
  compact?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const defaultIcons = [
  '⏳', '🚀', '✅', '❌', '⚠️', '🔄', '⏸️', '🎯', '💡', '🔥',
  '⭐', '📝', '🔍', '💻', '📊', '🎨', '🔧', '📋', '🎪', '🏆'
];

export default function StatusManager({
  statuses,
  onStatusesChange,
  selectedStatusId,
  onStatusSelect,
  showSelect = false,
  compact = false,
  isCollapsed = false,
  onToggleCollapse
}: StatusManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<TaskStatus | null>(null);
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: defaultColors[0],
    icon: defaultIcons[0]
  });

  const handleAddStatus = () => {
    if (!newStatus.name.trim()) {
      toast.error('يرجى إدخال اسم الحالة');
      return;
    }

    const status: TaskStatus = {
      id: Date.now().toString(),
      name: newStatus.name.trim(),
      color: newStatus.color,
      icon: newStatus.icon,
      order: statuses.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onStatusesChange([...statuses, status]);
    setNewStatus({ name: '', color: defaultColors[0], icon: defaultIcons[0] });
    setIsDialogOpen(false);
    toast.success('تم إضافة الحالة بنجاح');
  };

  const handleEditStatus = (status: TaskStatus) => {
    setEditingStatus(status);
    setNewStatus({
      name: status.name,
      color: status.color,
      icon: status.icon || defaultIcons[0]
    });
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!editingStatus || !newStatus.name.trim()) {
      toast.error('يرجى إدخال اسم الحالة');
      return;
    }

    const updatedStatus: TaskStatus = {
      ...editingStatus,
      name: newStatus.name.trim(),
      color: newStatus.color,
      icon: newStatus.icon,
      updatedAt: Date.now()
    };

    onStatusesChange(
      statuses.map(s => s.id === editingStatus.id ? updatedStatus : s)
    );
    setEditingStatus(null);
    setNewStatus({ name: '', color: defaultColors[0], icon: defaultIcons[0] });
    setIsDialogOpen(false);
    toast.success('تم تحديث الحالة بنجاح');
  };

  const handleDeleteStatus = (statusId: string) => {
    onStatusesChange(statuses.filter(s => s.id !== statusId));
    toast.success('تم حذف الحالة بنجاح');
  };

  const handleStatusSelect = (statusId: string) => {
    if (onStatusSelect) {
      onStatusSelect(statusId === 'none' ? undefined : statusId);
    }
  };

  const getStatusById = (id: string) => statuses.find(s => s.id === id);

  const selectedStatus = selectedStatusId ? getStatusById(selectedStatusId) : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showSelect && (
          <Select value={selectedStatusId || 'none'} onValueChange={handleStatusSelect}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>بدون حالة</span>
                </div>
              </SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span>{status.icon} {status.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              إدارة الحالات
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إدارة حالات المهام</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الحالة</Label>
                <Input
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  placeholder="مثال: قيد التنفيذ"
                />
              </div>
              
              <div className="space-y-2">
                <Label>اللون</Label>
                <div className="grid grid-cols-5 gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewStatus({ ...newStatus, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newStatus.color === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>الأيقونة</Label>
                <div className="grid grid-cols-10 gap-1">
                  {defaultIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewStatus({ ...newStatus, icon })}
                      className={`w-8 h-8 rounded border text-lg ${
                        newStatus.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={editingStatus ? handleUpdateStatus : handleAddStatus}>
                  {editingStatus ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingStatus(null);
                  setNewStatus({ name: '', color: defaultColors[0], icon: defaultIcons[0] });
                }}>
                  إلغاء
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>الحالات الموجودة</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {statuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span>{status.icon} {status.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStatus(status)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStatus(status.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5" />
            حالات المهام
          </h3>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة حالة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStatus ? 'تعديل الحالة' : 'إضافة حالة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الحالة</Label>
                <Input
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  placeholder="مثال: قيد التنفيذ"
                />
              </div>
              
              <div className="space-y-2">
                <Label>اللون</Label>
                <div className="grid grid-cols-5 gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewStatus({ ...newStatus, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newStatus.color === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>الأيقونة</Label>
                <div className="grid grid-cols-10 gap-1">
                  {defaultIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewStatus({ ...newStatus, icon })}
                      className={`w-8 h-8 rounded border text-lg ${
                        newStatus.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={editingStatus ? handleUpdateStatus : handleAddStatus}>
                  {editingStatus ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingStatus(null);
                  setNewStatus({ name: '', color: defaultColors[0], icon: defaultIcons[0] });
                }}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-lg">{status.icon}</span>
                  <span className="font-medium">{status.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStatus(status)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStatus(status.id)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {statuses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حالات مهام</p>
              <p className="text-sm">انقر على "إضافة حالة" لإنشاء حالة جديدة</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
