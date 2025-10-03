import React, { useState } from "react";
import { Workspace, Todo } from "@/types/todo";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FolderOpen,
  Trash2,
  Edit,
  Check,
  X,
  MoreVertical,
  Palette,
  Copy,
  Download,
  Upload,
  Settings,
  Folder,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import WorkspaceList from "./WorkspaceList";

interface WorkspaceManagerProps {
  workspaces: Workspace[];
  currentWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string | null) => void;
  onWorkspaceCreate: (workspace: Omit<Workspace, "id">) => void;
  onWorkspaceUpdate: (id: string, updates: Partial<Workspace>) => void;
  onWorkspaceDelete: (id: string) => void;
  onWorkspaceSave: (workspaceId: string, todos: Todo[]) => void;
}

const WORKSPACE_COLORS = [
  { name: "أزرق", value: "blue", class: "bg-blue-500" },
  { name: "أخضر", value: "green", class: "bg-green-500" },
  { name: "أحمر", value: "red", class: "bg-red-500" },
  { name: "أصفر", value: "yellow", class: "bg-yellow-500" },
  { name: "بنفسجي", value: "purple", class: "bg-purple-500" },
  { name: "وردي", value: "pink", class: "bg-pink-500" },
  { name: "برتقالي", value: "orange", class: "bg-orange-500" },
  { name: "رمادي", value: "gray", class: "bg-gray-500" },
];

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onWorkspaceCreate,
  onWorkspaceUpdate,
  onWorkspaceDelete,
  onWorkspaceSave,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    color: "blue",
  });

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name.trim()) {
      toast.error("يرجى إدخال اسم مساحة العمل");
      return;
    }

    const workspace: Omit<Workspace, "id"> = {
      name: newWorkspace.name.trim(),
      description: newWorkspace.description.trim(),
      color: newWorkspace.color,
      todos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onWorkspaceCreate(workspace);
    setNewWorkspace({ name: "", description: "", color: "blue" });
    setShowCreateDialog(false);
    toast.success("تم إنشاء مساحة العمل بنجاح");
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setNewWorkspace({
      name: workspace.name,
      description: workspace.description || "",
      color: workspace.color || "blue",
    });
    setShowEditDialog(true);
  };

  const handleUpdateWorkspace = () => {
    if (!editingWorkspace || !newWorkspace.name.trim()) {
      toast.error("يرجى إدخال اسم مساحة العمل");
      return;
    }

    onWorkspaceUpdate(editingWorkspace.id, {
      name: newWorkspace.name.trim(),
      description: newWorkspace.description.trim(),
      color: newWorkspace.color,
      updatedAt: Date.now(),
    });

    setShowEditDialog(false);
    setEditingWorkspace(null);
    setNewWorkspace({ name: "", description: "", color: "blue" });
    toast.success("تم تحديث مساحة العمل بنجاح");
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `سيتم حذف مساحة العمل "${workspace.name}" وجميع المهام المرتبطة بها`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      onWorkspaceDelete(workspace.id);
      if (currentWorkspace === workspace.id) {
        onWorkspaceChange(null);
      }
      toast.success("تم حذف مساحة العمل");
    }
  };

  const handleSaveCurrentWorkspace = () => {
    if (!currentWorkspace) {
      toast.error("لا توجد مساحة عمل نشطة للحفظ");
      return;
    }
    // This will be handled by the parent component
    onWorkspaceSave(currentWorkspace, []);
    toast.success("تم حفظ مساحة العمل الحالية");
  };

  const handleCopyWorkspace = async (workspace: Workspace) => {
    const { value: newName } = await Swal.fire({
      title: "نسخ مساحة العمل",
      input: "text",
      inputLabel: "اسم مساحة العمل الجديدة",
      inputValue: `نسخة من ${workspace.name}`,
      inputPlaceholder: "أدخل اسم مساحة العمل الجديدة",
      showCancelButton: true,
      confirmButtonText: "نسخ",
      cancelButtonText: "إلغاء",
      inputValidator: (value) => {
        if (!value) {
          return "يرجى إدخال اسم مساحة العمل";
        }
        if (workspaces.some(w => w.name === value)) {
          return "اسم مساحة العمل موجود بالفعل";
        }
        return null;
      }
    });

    if (newName) {
      const newWorkspace: Omit<Workspace, "id"> = {
        name: newName,
        description: workspace.description ? `نسخة من: ${workspace.description}` : "",
        color: workspace.color || "blue",
        todos: [...workspace.todos], // نسخ المهام
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      onWorkspaceCreate(newWorkspace);
      toast.success("تم نسخ مساحة العمل بنجاح");
    }
  };

  const handleExportWorkspace = (workspace: Workspace) => {
    const data = {
      workspace,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workspace-${workspace.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تصدير مساحة العمل");
  };

  const handleImportWorkspace = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.workspace || !data.workspace.name) {
          toast.error("ملف غير صحيح. تأكد من أنه ملف مساحة عمل صالح.");
          return;
        }

        // التحقق من وجود اسم مساحة العمل
        let workspaceName = data.workspace.name;
        let counter = 1;
        while (workspaces.some(w => w.name === workspaceName)) {
          workspaceName = `${data.workspace.name} (${counter})`;
          counter++;
        }

        const importedWorkspace: Omit<Workspace, "id"> = {
          name: workspaceName,
          description: data.workspace.description || "",
          color: data.workspace.color || "blue",
          todos: data.workspace.todos || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        onWorkspaceCreate(importedWorkspace);
        toast.success("تم استيراد مساحة العمل بنجاح");
      } catch (error) {
        toast.error("فشل استيراد مساحة العمل. تأكد من صحة الملف.");
      }
    };
    input.click();
  };

  const handleExportAllWorkspaces = () => {
    if (workspaces.length === 0) {
      toast.error("لا توجد مساحات عمل للتصدير");
      return;
    }

    const data = {
      workspaces,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-workspaces-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تصدير جميع مساحات العمل");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Current Workspace Display */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-primary" />
          <div>
            {currentWorkspaceData ? (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      WORKSPACE_COLORS.find(c => c.value === currentWorkspaceData.color)?.class || "bg-blue-500"
                    }`}
                  />
                  <span className="font-semibold text-lg text-primary">
                    {currentWorkspaceData.name}
                  </span>
                  <span className="text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                    {currentWorkspaceData.todos.length} مهمة
                  </span>
                </div>
                {currentWorkspaceData.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentWorkspaceData.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>تم الإنشاء: {formatDate(currentWorkspaceData.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>آخر تحديث: {formatDate(currentWorkspaceData.updatedAt)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <span className="font-semibold text-lg text-muted-foreground">
                  مساحة العمل الافتراضية
                </span>
                <p className="text-sm text-muted-foreground">
                  لم يتم تحديد مساحة عمل محددة
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace Selector */}
          <Select
            value={currentWorkspace || "default"}
            onValueChange={(value) => onWorkspaceChange(value === "default" ? null : value)}
          >
            <SelectTrigger className="w-56 border-primary/30">
              <SelectValue placeholder="اختر مساحة العمل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>مساحة العمل الافتراضية</span>
                </div>
              </SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        WORKSPACE_COLORS.find(c => c.value === workspace.color)?.class || "bg-blue-500"
                      }`}
                    />
                    <span>{workspace.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({workspace.todos.length})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workspace Management Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            إدارة مساحات العمل ({workspaces.length})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Workspace List */}
          <WorkspaceList
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={onWorkspaceChange}
            onWorkspaceUpdate={onWorkspaceUpdate}
            onWorkspaceDelete={onWorkspaceDelete}
            onWorkspaceCopy={handleCopyWorkspace}
            onWorkspaceExport={handleExportWorkspace}
          />

          {/* Import/Export Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                إعدادات متقدمة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleImportWorkspace}>
                <Upload className="w-4 h-4 mr-2" />
                استيراد مساحة عمل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAllWorkspaces}>
                <Download className="w-4 h-4 mr-2" />
                تصدير جميع مساحات العمل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {currentWorkspaceData && (
                <>
                  <DropdownMenuItem onClick={() => handleExportWorkspace(currentWorkspaceData)}>
                    <Download className="w-4 h-4 mr-2" />
                    تصدير مساحة العمل الحالية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyWorkspace(currentWorkspaceData)}>
                    <Copy className="w-4 h-4 mr-2" />
                    نسخ مساحة العمل الحالية
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Workspace Button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                إنشاء مساحة عمل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مساحة عمل جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اسم مساحة العمل *
                  </label>
                  <Input
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم مساحة العمل"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    الوصف (اختياري)
                  </label>
                  <Textarea
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="أدخل وصف مساحة العمل"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اللون
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {WORKSPACE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewWorkspace(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                          newWorkspace.color === color.value ? "border-primary" : "border-transparent"
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateWorkspace} className="flex-1">
                    إنشاء
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

          {/* Workspace Actions Menu */}
          {currentWorkspaceData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditWorkspace(currentWorkspaceData)}>
                  <Edit className="w-4 h-4 mr-2" />
                  تعديل مساحة العمل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSaveCurrentWorkspace}>
                  <Check className="w-4 h-4 mr-2" />
                  حفظ التغييرات
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteWorkspace(currentWorkspaceData)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف مساحة العمل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Edit Workspace Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل مساحة العمل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                اسم مساحة العمل *
              </label>
              <Input
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم مساحة العمل"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                الوصف (اختياري)
              </label>
              <Textarea
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل وصف مساحة العمل"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                اللون
              </label>
              <div className="flex gap-2 flex-wrap">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewWorkspace(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                      newWorkspace.color === color.value ? "border-primary" : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateWorkspace} className="flex-1">
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

export default WorkspaceManager;
