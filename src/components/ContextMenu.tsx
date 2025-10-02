import { useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, Copy, Clipboard, ListTree, BarChart3, FileUp, FileDown, Eye, EyeOff, Settings as SettingsIcon, CheckSquare, Square } from 'lucide-react';
import { ContextMenuPosition } from '@/types/todo';

interface ContextMenuProps {
  position: ContextMenuPosition;
  onClose: () => void;
  onAddTask: () => void;
  onAddSubTask?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  hasCopiedTask: boolean;
  isSubTask: boolean;
  onShowStatistics?: () => void;
  onCopyAllTasks?: () => void;
  onCopySelectedTasks?: () => void;
  onSelectAllTasks?: () => void;
  onClearSelection?: () => void;
  onToggleToolbar?: () => void;
  onToggleHeader?: () => void;
  onToggleProgress?: () => void;
  onExportDatabase?: () => void;
  onImportDatabase?: () => void;
  showToolbar?: boolean;
  showHeader?: boolean;
  showProgress?: boolean;
  hasSelectedTasks?: boolean;
}

const ContextMenu = ({
  position,
  onClose,
  onAddTask,
  onAddSubTask,
  onEdit,
  onDelete,
  onCopy,
  onPaste,
  hasCopiedTask,
  isSubTask,
  onShowStatistics,
  onCopyAllTasks,
  onCopySelectedTasks,
  onSelectAllTasks,
  onClearSelection,
  onToggleToolbar,
  onToggleHeader,
  onToggleProgress,
  onExportDatabase,
  onImportDatabase,
  showToolbar,
  showHeader,
  showProgress,
  hasSelectedTasks,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { icon: Plus, label: 'إضافة مهمة جديدة', action: onAddTask, show: true },
    { icon: ListTree, label: 'إضافة مهمة فرعية', action: onAddSubTask, show: !isSubTask && onAddSubTask },
    { icon: Edit3, label: 'تعديل', action: onEdit, show: true },
    { icon: Copy, label: 'نسخ', action: onCopy, show: true },
    { icon: Clipboard, label: 'لصق', action: onPaste, show: hasCopiedTask },
    { icon: Trash2, label: 'حذف', action: onDelete, show: true, danger: true },
    { type: 'divider', show: onShowStatistics || onCopyAllTasks || onSelectAllTasks },
    { icon: BarChart3, label: 'الإحصائيات', action: onShowStatistics, show: !!onShowStatistics },
    { icon: Copy, label: 'نسخ جميع المهام', action: onCopyAllTasks, show: !!onCopyAllTasks, shortcut: 'Ctrl+C' },
    { icon: CheckSquare, label: 'تحديد جميع المهام', action: onSelectAllTasks, show: !!onSelectAllTasks },
    { icon: Copy, label: 'نسخ المهام المحددة', action: onCopySelectedTasks, show: !!onCopySelectedTasks && hasSelectedTasks },
    { icon: Square, label: 'إلغاء التحديد', action: onClearSelection, show: !!onClearSelection && hasSelectedTasks },
    { type: 'divider', show: onToggleToolbar || onToggleHeader || onToggleProgress },
    { icon: showToolbar ? EyeOff : Eye, label: showToolbar ? 'إخفاء شريط الأدوات' : 'إظهار شريط الأدوات', action: onToggleToolbar, show: !!onToggleToolbar },
    { icon: showHeader ? EyeOff : Eye, label: showHeader ? 'إخفاء الهيدر' : 'إظهار الهيدر', action: onToggleHeader, show: !!onToggleHeader },
    { icon: showProgress ? EyeOff : Eye, label: showProgress ? 'إخفاء شريط التقدم' : 'إظهار شريط التقدم', action: onToggleProgress, show: !!onToggleProgress },
    { type: 'divider', show: onExportDatabase || onImportDatabase },
    { icon: FileUp, label: 'تصدير قاعدة البيانات', action: onExportDatabase, show: !!onExportDatabase },
    { icon: FileDown, label: 'استيراد قاعدة البيانات', action: onImportDatabase, show: !!onImportDatabase },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-popover border-2 border-border rounded-lg shadow-2xl py-1 min-w-[200px] animate-fade-in backdrop-blur-sm"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {menuItems.map((item, index) => {
        if (!item.show) return null;
        
        if (item.type === 'divider') {
          return <div key={index} className="my-1 border-t border-border" />;
        }
        
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={() => {
              item.action?.();
              onClose();
            }}
            className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-smooth hover:bg-secondary ${
              item.danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
            {item.shortcut && (
              <span className="mr-auto text-xs text-muted-foreground">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
