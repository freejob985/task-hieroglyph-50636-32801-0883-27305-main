import { useEffect, useRef, useState } from 'react';
import { Plus, Edit3, Trash2, Copy, Clipboard, ListTree, BarChart3, FileUp, FileDown, Eye, EyeOff, Settings as SettingsIcon, CheckSquare, Square, Filter, List, ChevronRight, MoreHorizontal, AlertTriangle, Database, Link, Archive } from 'lucide-react';
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
  onToggleSelectedOnly?: () => void;
  showToolbar?: boolean;
  showHeader?: boolean;
  showProgress?: boolean;
  hasSelectedTasks?: boolean;
  showSelectedOnly?: boolean;
  onClearAllData?: () => void;
  onAddUrlToSelected?: () => void;
  onArchiveTask?: () => void;
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
  onToggleSelectedOnly,
  showToolbar,
  showHeader,
  showProgress,
  hasSelectedTasks,
  showSelectedOnly,
  onClearAllData,
  onAddUrlToSelected,
  onArchiveTask,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

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
    { icon: Archive, label: 'أرشفة', action: onArchiveTask, show: !isSubTask && !!onArchiveTask },
    { icon: Trash2, label: 'حذف', action: onDelete, show: true, danger: true },
    { type: 'divider', show: true },
    { 
      icon: BarChart3, 
      label: 'الإحصائيات والتحليل', 
      action: onShowStatistics, 
      show: !!onShowStatistics,
      submenu: [
        { icon: BarChart3, label: 'عرض الإحصائيات', action: onShowStatistics, show: !!onShowStatistics },
        { icon: FileUp, label: 'تصدير البيانات', action: onExportDatabase, show: !!onExportDatabase },
        { icon: FileDown, label: 'استيراد البيانات', action: onImportDatabase, show: !!onImportDatabase },
      ]
    },
    { 
      icon: CheckSquare, 
      label: 'إدارة المهام', 
      action: onSelectAllTasks, 
      show: !!onSelectAllTasks || hasSelectedTasks,
      submenu: [
        { icon: CheckSquare, label: 'تحديد جميع المهام', action: onSelectAllTasks, show: !!onSelectAllTasks },
        { icon: Copy, label: 'نسخ جميع المهام', action: onCopyAllTasks, show: !!onCopyAllTasks, shortcut: 'Ctrl+C' },
        { icon: Copy, label: 'نسخ المهام المحددة', action: onCopySelectedTasks, show: !!onCopySelectedTasks && hasSelectedTasks },
        { icon: Link, label: 'إضافة رابط للمهام المحددة', action: onAddUrlToSelected, show: !!onAddUrlToSelected && hasSelectedTasks },
        { icon: Square, label: 'إلغاء التحديد', action: onClearSelection, show: !!onClearSelection && hasSelectedTasks },
        { type: 'divider', show: hasSelectedTasks && onToggleSelectedOnly },
        { icon: showSelectedOnly ? List : Filter, label: showSelectedOnly ? 'إظهار الكل' : 'إظهار المحدد فقط', action: onToggleSelectedOnly, show: !!onToggleSelectedOnly && hasSelectedTasks },
      ]
    },
    { 
      icon: SettingsIcon, 
      label: 'إعدادات العرض', 
      action: onToggleToolbar, 
      show: !!onToggleToolbar || !!onToggleHeader || !!onToggleProgress,
      submenu: [
        { icon: showToolbar ? EyeOff : Eye, label: showToolbar ? 'إخفاء شريط الأدوات' : 'إظهار شريط الأدوات', action: onToggleToolbar, show: !!onToggleToolbar },
        { icon: showHeader ? EyeOff : Eye, label: showHeader ? 'إخفاء الهيدر' : 'إظهار الهيدر', action: onToggleHeader, show: !!onToggleHeader },
        { icon: showProgress ? EyeOff : Eye, label: showProgress ? 'إخفاء شريط التقدم' : 'إظهار شريط التقدم', action: onToggleProgress, show: !!onToggleProgress },
      ]
    },
    { 
      icon: Database, 
      label: 'إدارة البيانات', 
      action: onClearAllData, 
      show: !!onClearAllData,
      submenu: [
        { icon: AlertTriangle, label: 'مسح جميع البيانات', action: onClearAllData, show: !!onClearAllData, danger: true },
        { icon: FileUp, label: 'تصدير البيانات', action: onExportDatabase, show: !!onExportDatabase },
        { icon: FileDown, label: 'استيراد البيانات', action: onImportDatabase, show: !!onImportDatabase },
      ]
    },
  ];

  const renderMenuItem = (item: any, index: number) => {
    if (!item.show) return null;
    
    if (item.type === 'divider') {
      return <div key={index} className="my-1 border-t border-border" />;
    }
    
    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuActive = activeSubmenu === item.label;
    
    return (
      <div key={index} className="relative">
        <button
          onClick={() => {
            if (hasSubmenu) {
              setActiveSubmenu(isSubmenuActive ? null : item.label);
            } else {
              item.action?.();
              onClose();
            }
          }}
          onMouseEnter={() => {
            if (hasSubmenu) {
              setActiveSubmenu(item.label);
            }
          }}
          className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-smooth hover:bg-secondary ${
            item.danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
          } ${isSubmenuActive ? 'bg-secondary' : ''}`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{item.label}</span>
          {item.shortcut && (
            <span className="mr-auto text-xs text-muted-foreground">{item.shortcut}</span>
          )}
          {hasSubmenu && (
            <ChevronRight className="w-3 h-3 mr-auto" />
          )}
        </button>
        
        {/* Submenu */}
        {hasSubmenu && isSubmenuActive && (
          <div className="absolute right-full top-0 mr-2 bg-popover border-2 border-border rounded-lg shadow-2xl py-1 min-w-[200px] animate-fade-in backdrop-blur-sm">
            {item.submenu.map((subItem: any, subIndex: number) => {
              if (!subItem.show) return null;
              
              if (subItem.type === 'divider') {
                return <div key={subIndex} className="my-1 border-t border-border" />;
              }
              
              const SubIcon = subItem.icon;
              return (
                <button
                  key={subIndex}
                  onClick={() => {
                    subItem.action?.();
                    onClose();
                  }}
                  className={`w-full px-4 py-2.5 text-right flex items-center gap-3 transition-smooth hover:bg-secondary ${
                    subItem.danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
                  }`}
                >
                  <SubIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{subItem.label}</span>
                  {subItem.shortcut && (
                    <span className="mr-auto text-xs text-muted-foreground">{subItem.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-popover border-2 border-border rounded-lg shadow-2xl py-1 min-w-[200px] animate-fade-in backdrop-blur-sm"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {menuItems.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
};

export default ContextMenu;
