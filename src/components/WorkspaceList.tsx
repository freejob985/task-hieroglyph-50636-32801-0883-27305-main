import React, { useState } from "react";
import { Workspace } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  List,
  Grid,
  Search,
  MoreVertical,
  Folder,
  Clock,
  FileText,
  Edit,
  Copy,
  Trash2,
  Download,
  Play,
  CheckCircle,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface WorkspaceListProps {
  workspaces: Workspace[];
  currentWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string | null) => void;
  onWorkspaceUpdate: (id: string, updates: Partial<Workspace>) => void;
  onWorkspaceDelete: (id: string) => void;
  onWorkspaceCopy: (workspace: Workspace) => void;
  onWorkspaceExport: (workspace: Workspace) => void;
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

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onWorkspaceUpdate,
  onWorkspaceDelete,
  onWorkspaceCopy,
  onWorkspaceExport,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "created" | "updated" | "tasks">("updated");

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkspaceStats = (workspace: Workspace) => {
    const totalTasks = workspace.todos.length;
    const completedTasks = workspace.todos.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate
    };
  };

  const filteredAndSortedWorkspaces = workspaces
    .filter(workspace => 
      workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workspace.description && workspace.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, 'ar');
        case "created":
          return b.createdAt - a.createdAt;
        case "updated":
          return b.updatedAt - a.updatedAt;
        case "tasks":
          return b.todos.length - a.todos.length;
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

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
      toast.success("تم حذف مساحة العمل");
    }
  };

  const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
    const stats = getWorkspaceStats(workspace);
    const isActive = currentWorkspace === workspace.id;
    const colorClass = WORKSPACE_COLORS.find(c => c.value === workspace.color)?.class || "bg-blue-500";

    return (
      <Card className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isActive ? 'ring-2 ring-primary border-primary shadow-lg' : 'hover:border-primary/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${colorClass}`} />
              <CardTitle className="text-lg font-semibold truncate">
                {workspace.name}
              </CardTitle>
              {isActive && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  نشط
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onWorkspaceChange(workspace.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  تفعيل مساحة العمل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onWorkspaceCopy(workspace)}>
                  <Copy className="w-4 h-4 mr-2" />
                  نسخ مساحة العمل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onWorkspaceExport(workspace)}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير مساحة العمل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteWorkspace(workspace)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف مساحة العمل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {workspace.description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {workspace.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Task Statistics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary/20 rounded-lg p-2">
                <div className="text-lg font-semibold text-primary">{stats.totalTasks}</div>
                <div className="text-xs text-muted-foreground">إجمالي المهام</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2">
                <div className="text-lg font-semibold text-green-600">{stats.completedTasks}</div>
                <div className="text-xs text-muted-foreground">مكتملة</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-2">
                <div className="text-lg font-semibold text-orange-600">{stats.pendingTasks}</div>
                <div className="text-xs text-muted-foreground">معلقة</div>
              </div>
            </div>

            {/* Progress Bar */}
            {stats.totalTasks > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>التقدم</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(workspace.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>تم الإنشاء {formatDate(workspace.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const WorkspaceListItem = ({ workspace }: { workspace: Workspace }) => {
    const stats = getWorkspaceStats(workspace);
    const isActive = currentWorkspace === workspace.id;
    const colorClass = WORKSPACE_COLORS.find(c => c.value === workspace.color)?.class || "bg-blue-500";

    return (
      <div className={`flex items-center justify-between p-4 bg-card rounded-lg border transition-all duration-200 hover:shadow-md ${
        isActive ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
      }`}>
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-4 h-4 rounded-full ${colorClass}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{workspace.name}</h3>
              {isActive && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  نشط
                </div>
              )}
            </div>
            {workspace.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {workspace.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{stats.totalTasks} مهمة</span>
              <span>{stats.completedTasks} مكتملة</span>
              <span>آخر تحديث: {formatDate(workspace.updatedAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.totalTasks > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">{stats.completionRate}%</div>
              <div className="w-20 bg-secondary rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onWorkspaceChange(workspace.id)}>
                <Play className="w-4 h-4 mr-2" />
                تفعيل مساحة العمل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onWorkspaceCopy(workspace)}>
                <Copy className="w-4 h-4 mr-2" />
                نسخ مساحة العمل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWorkspaceExport(workspace)}>
                <Download className="w-4 h-4 mr-2" />
                تصدير مساحة العمل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteWorkspace(workspace)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف مساحة العمل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <List className="w-4 h-4" />
          عرض جميع مساحات العمل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">إدارة مساحات العمل</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث في مساحات العمل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="updated">آخر تحديث</option>
                <option value="created">تاريخ الإنشاء</option>
                <option value="name">الاسم</option>
                <option value="tasks">عدد المهام</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Workspaces Display */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredAndSortedWorkspaces.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد مساحات عمل"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? "جرب البحث بكلمات مختلفة" 
                    : "ابدأ بإنشاء مساحة عمل جديدة لتنظيم مهامك"
                  }
                </p>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-3"
              }>
                {filteredAndSortedWorkspaces.map((workspace) => (
                  <div key={workspace.id}>
                    {viewMode === "grid" ? (
                      <WorkspaceCard workspace={workspace} />
                    ) : (
                      <WorkspaceListItem workspace={workspace} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {workspaces.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  إجمالي مساحات العمل: {workspaces.length}
                  {searchTerm && ` (${filteredAndSortedWorkspaces.length} ظاهرة)`}
                </span>
                <span>
                  إجمالي المهام: {workspaces.reduce((sum, w) => sum + w.todos.length, 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceList;