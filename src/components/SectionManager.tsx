import React, { useState } from "react";
import { Section, Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface SectionManagerProps {
  sections: Section[];
  currentSection: string | null;
  onSectionChange: (sectionId: string | null) => void;
  onSectionCreate: (section: Omit<Section, "id">) => void;
  onSectionUpdate: (id: string, updates: Partial<Section>) => void;
  onSectionDelete: (id: string) => void;
  onSectionReorder: (sections: Section[]) => void;
  onCopySectionTasks: (sectionId: string) => void;
  todos: Todo[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SECTION_COLORS = [
  { name: "أزرق", value: "blue", class: "bg-blue-500" },
  { name: "أخضر", value: "green", class: "bg-green-500" },
  { name: "أحمر", value: "red", class: "bg-red-500" },
  { name: "أصفر", value: "yellow", class: "bg-yellow-500" },
  { name: "بنفسجي", value: "purple", class: "bg-purple-500" },
  { name: "وردي", value: "pink", class: "bg-pink-500" },
  { name: "برتقالي", value: "orange", class: "bg-orange-500" },
  { name: "رمادي", value: "gray", class: "bg-gray-500" },
];

const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  currentSection,
  onSectionChange,
  onSectionCreate,
  onSectionUpdate,
  onSectionDelete,
  onSectionReorder,
  onCopySectionTasks,
  todos,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [newSection, setNewSection] = useState({
    name: "",
    description: "",
    color: "blue",
  });

  const currentSectionData = sections.find(s => s.id === currentSection);

  const getSectionTaskCount = (sectionId: string) => {
    return todos.filter(todo => todo.sectionId === sectionId && !todo.parentId).length;
  };

  const getSectionCompletedCount = (sectionId: string) => {
    return todos.filter(todo => todo.sectionId === sectionId && !todo.parentId && todo.completed).length;
  };

  const handleCreateSection = () => {
    if (!newSection.name.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    const section: Omit<Section, "id"> = {
      name: newSection.name.trim(),
      description: newSection.description.trim(),
      color: newSection.color,
      order: sections.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSectionCreate(section);
    setNewSection({ name: "", description: "", color: "blue" });
    setShowCreateDialog(false);
    toast.success("تم إنشاء القسم بنجاح");
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setNewSection({
      name: section.name,
      description: section.description || "",
      color: section.color || "blue",
    });
    setShowEditDialog(true);
  };

  const handleUpdateSection = () => {
    if (!editingSection || !newSection.name.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    onSectionUpdate(editingSection.id, {
      name: newSection.name.trim(),
      description: newSection.description.trim(),
      color: newSection.color,
      updatedAt: Date.now(),
    });

    setShowEditDialog(false);
    setEditingSection(null);
    setNewSection({ name: "", description: "", color: "blue" });
    toast.success("تم تحديث القسم بنجاح");
  };

  const handleDeleteSection = async (section: Section) => {
    const taskCount = getSectionTaskCount(section.id);
    
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `سيتم حذف القسم "${section.name}"${taskCount > 0 ? ` وجميع المهام المرتبطة به (${taskCount} مهمة)` : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      onSectionDelete(section.id);
      if (currentSection === section.id) {
        onSectionChange(null);
      }
      toast.success("تم حذف القسم");
    }
  };

  const handleCopySectionTasks = (sectionId: string) => {
    onCopySectionTasks(sectionId);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {/* Sections Header */}
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-6 w-6"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            أقسام مساحة العمل ({sections.length})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Create Section Button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                إضافة قسم
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة قسم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اسم القسم *
                  </label>
                  <Input
                    value={newSection.name}
                    onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم القسم"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    الوصف (اختياري)
                  </label>
                  <Textarea
                    value={newSection.description}
                    onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="أدخل وصف القسم"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اللون
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {SECTION_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewSection(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                          newSection.color === color.value ? "border-primary" : "border-transparent"
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateSection} className="flex-1">
                    إضافة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sections List */}
      {!isCollapsed && (
        <div className="space-y-2">
          {sections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد أقسام بعد</p>
              <p className="text-sm">انقر على "إضافة قسم" لإنشاء قسم جديد</p>
            </div>
          )}
          {/* Default Section (All Tasks) */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              currentSection === null
                ? "bg-primary/10 border-primary/30"
                : "bg-card hover:bg-accent"
            }`}
            onClick={() => onSectionChange(null)}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <div>
                <div className="font-medium">جميع المهام</div>
                <div className="text-sm text-muted-foreground">
                  {todos.filter(t => !t.parentId).length} مهمة
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopySectionTasks("all");
                }}
                className="gap-1"
              >
                <Copy className="w-4 h-4" />
                نسخ
              </Button>
            </div>
          </div>

          {/* Sections */}
          {sortedSections.length > 0 && sortedSections.map((section) => {
            const taskCount = getSectionTaskCount(section.id);
            const completedCount = getSectionCompletedCount(section.id);
            const isActive = currentSection === section.id;

            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card hover:bg-accent"
                }`}
                onClick={() => onSectionChange(section.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      SECTION_COLORS.find(c => c.value === section.color)?.class || "bg-blue-500"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {taskCount} مهمة {completedCount > 0 && `(${completedCount} مكتملة)`}
                    </div>
                    {section.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {section.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopySectionTasks(section.id);
                    }}
                    className="gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditSection(section)}>
                        <Edit className="w-4 h-4 mr-2" />
                        تعديل القسم
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteSection(section)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        حذف القسم
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Section Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل القسم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                اسم القسم *
              </label>
              <Input
                value={newSection.name}
                onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم القسم"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                الوصف (اختياري)
              </label>
              <Textarea
                value={newSection.description}
                onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل وصف القسم"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                اللون
              </label>
              <div className="flex gap-2 flex-wrap">
                {SECTION_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewSection(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                      newSection.color === color.value ? "border-primary" : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateSection} className="flex-1">
                حفظ التغييرات
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionManager;
