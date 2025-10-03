import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
  FileText,
  CheckSquare,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Todo, ContextMenuPosition, Workspace, SavedTask } from "@/types/todo";
import TodoItem from "./TodoItem";
import ContextMenu from "./ContextMenu";
import ProgressBar from "./ProgressBar";
import Statistics from "./Statistics";
import SavedTasksManager from "./SavedTasksManager";
import ThemeToggle from "./ThemeToggle";
import CheckboxLegend from "./CheckboxLegend";
import WorkspaceManager from "./WorkspaceManager";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { generateWorkspacePrompt } from "@/utils/geminiService";
import TechnologyInput from "./TechnologyInput";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition;
    todo: Todo | null;
  } | null>(null);
  const [copiedTodo, setCopiedTodo] = useState<Todo | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const [savedTasks, setSavedTasks] = useState<SavedTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showWorkspacePrompt, setShowWorkspacePrompt] = useState(false);
  const [workspacePromptMode, setWorkspacePromptMode] = useState<
    "full-code" | "code-changes"
  >("full-code");
  const [workspaceTechnologies, setWorkspaceTechnologies] = useState<string[]>(
    []
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showTextOnly, setShowTextOnly] = useState(false);
  const [globalPromptMode, setGlobalPromptMode] = useState<
    "full-code" | "code-changes" | "notes"
  >("full-code");
  const [globalFontSize, setGlobalFontSize] = useState(14);
  const [globalLineHeight, setGlobalLineHeight] = useState(1.8);
  const [showHeader, setShowHeader] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const saveCurrentWorkspace = useCallback((workspaceId: string, todos: Todo[]) => {
    setWorkspaces(workspaces.map(ws => 
      ws.id === workspaceId 
        ? { ...ws, todos: [...todos], updatedAt: Date.now() }
        : ws
    ));
  }, [workspaces]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    const savedWorkspaces = localStorage.getItem("workspaces");
    const savedCurrentWorkspace = localStorage.getItem("currentWorkspace");
    const savedTasksData = localStorage.getItem("savedTasks");
    const savedGlobalPromptMode = localStorage.getItem("globalPromptMode");
    const savedGlobalFontSize = localStorage.getItem("globalFontSize");
    const savedGlobalLineHeight = localStorage.getItem("globalLineHeight");
    const savedShowHeader = localStorage.getItem("showHeader");
    const savedShowToolbar = localStorage.getItem("showToolbar");
    const savedProgressCollapsed = localStorage.getItem("isProgressCollapsed");

    if (saved) setTodos(JSON.parse(saved));
    if (savedWorkspaces) setWorkspaces(JSON.parse(savedWorkspaces));
    if (savedCurrentWorkspace) setCurrentWorkspace(savedCurrentWorkspace);
    if (savedTasksData) setSavedTasks(JSON.parse(savedTasksData));
    if (savedGlobalPromptMode)
      setGlobalPromptMode(
        savedGlobalPromptMode as "full-code" | "code-changes" | "notes"
      );
    if (savedGlobalFontSize) setGlobalFontSize(Number(savedGlobalFontSize));
    if (savedGlobalLineHeight)
      setGlobalLineHeight(Number(savedGlobalLineHeight));
    if (savedShowHeader !== null) setShowHeader(savedShowHeader === "true");
    if (savedShowToolbar !== null) setShowToolbar(savedShowToolbar === "true");
    if (savedProgressCollapsed !== null) setIsProgressCollapsed(savedProgressCollapsed === "true");
  }, []);

  // Auto-save
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem("todos", JSON.stringify(todos));
      // Also save to current workspace if one is active
      if (currentWorkspace) {
        saveCurrentWorkspace(currentWorkspace, todos);
      }
    }
  }, [todos, currentWorkspace, saveCurrentWorkspace]);

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem("currentWorkspace", currentWorkspace || "");
  }, [currentWorkspace]);

  useEffect(() => {
    localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
  }, [savedTasks]);

  useEffect(() => {
    localStorage.setItem("globalPromptMode", globalPromptMode);
  }, [globalPromptMode]);

  useEffect(() => {
    localStorage.setItem("globalFontSize", globalFontSize.toString());
  }, [globalFontSize]);

  useEffect(() => {
    localStorage.setItem("globalLineHeight", globalLineHeight.toString());
  }, [globalLineHeight]);

  useEffect(() => {
    localStorage.setItem("showHeader", showHeader.toString());
  }, [showHeader]);

  useEffect(() => {
    localStorage.setItem("showToolbar", showToolbar.toString());
  }, [showToolbar]);

  useEffect(() => {
    localStorage.setItem("isProgressCollapsed", isProgressCollapsed.toString());
  }, [isProgressCollapsed]);

  const addTodo = useCallback((text: string, parentId: string | null = null) => {
    if (!text.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      parentId,
      order: todos.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTodos([...todos, newTodo]);
    toast.success("تمت إضافة المهمة بنجاح");
    setNewTaskText("");
  }, [todos]);

  const updateTodo = (id: string, text: string, updates?: Partial<Todo>) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, text, updatedAt: Date.now(), ...updates }
          : todo
      )
    );
    toast.success("تم تحديث المهمة");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف المهمة وجميع المهام الفرعية",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      const todoToDelete = todos.find((t) => t.id === id);
      const idsToDelete = [id];

      if (todoToDelete && !todoToDelete.parentId) {
        const subTodos = todos.filter((t) => t.parentId === id);
        idsToDelete.push(...subTodos.map((t) => t.id));
      }

      setTodos(todos.filter((todo) => !idsToDelete.includes(todo.id)));
      toast.success("تم حذف المهمة");
    }
  };

  const copyTodo = (todo: Todo) => {
    setCopiedTodo(todo);
    toast.success("تم نسخ المهمة");
  };

  const pasteTodo = (parentId: string | null = null) => {
    if (!copiedTodo) return;

    const newTodo: Todo = {
      ...copiedTodo,
      id: Date.now().toString(),
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTodos([...todos, newTodo]);
    toast.success("تم لصق المهمة");
  };

  const copyAllTasks = useCallback(() => {
    const text = todos
      .filter((todo) => !todo.parentId && !todo.completed)
      .map((todo) => {
        const subTasks = todos.filter(
          (t) => t.parentId === todo.id && !t.completed
        );
        let result = `○ ${todo.text}`;
        if (todo.url) {
          result += `\n  🔗 ${todo.url}`;
        }
        subTasks.forEach((sub) => {
          result += `\n  ○ ${sub.text}`;
          if (sub.url) {
            result += `\n    🔗 ${sub.url}`;
          }
        });
        return result;
      })
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success("تم نسخ المهام غير المكتملة مع الروابط");
  }, [todos]);

  const copySelectedTasks = () => {
    if (selectedTodos.length === 0) {
      toast.error("لم يتم تحديد أي مهام");
      return;
    }

    const text = todos
      .filter((todo) => selectedTodos.includes(todo.id) && !todo.parentId)
      .map((todo) => {
        const subTasks = todos.filter(
          (t) => t.parentId === todo.id && selectedTodos.includes(t.id)
        );
        let result = `○ ${todo.text}`;
        if (todo.url) {
          result += `\n  🔗 ${todo.url}`;
        }
        subTasks.forEach((sub) => {
          result += `\n  ○ ${sub.text}`;
          if (sub.url) {
            result += `\n    🔗 ${sub.url}`;
          }
        });
        return result;
      })
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${selectedTodos.length} مهمة مع الروابط`);
    setSelectedTodos([]);
  };

  const toggleSelectTodo = (id: string) => {
    setSelectedTodos((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const selectAllTodos = () => {
    const allIds = todos.map((t) => t.id);
    setSelectedTodos(allIds);
    toast.success("تم تحديد جميع المهام");
  };

  const clearSelection = () => {
    setSelectedTodos([]);
    toast.info("تم إلغاء التحديد");
  };

  const addUrlToSelected = () => {
    if (selectedTodos.length === 0) {
      toast.error("لم يتم تحديد أي مهام");
      return;
    }

    const url = prompt("أدخل الرابط للمهام المحددة:");
    if (!url || !url.trim()) {
      toast.error("لم يتم إدخال رابط صحيح");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error("الرابط غير صحيح");
      return;
    }

    setTodos(prevTodos =>
      prevTodos.map(todo =>
        selectedTodos.includes(todo.id)
          ? { ...todo, url: url.trim(), updatedAt: Date.now() }
          : todo
      )
    );

    toast.success(`تم إضافة الرابط لـ ${selectedTodos.length} مهمة`);
    setSelectedTodos([]);
  };

  const toggleProgressCollapse = () => {
    setIsProgressCollapsed(!isProgressCollapsed);
    toast.info(isProgressCollapsed ? "تم إظهار تفاصيل التقدم" : "تم إخفاء تفاصيل التقدم");
  };

  // Keyboard shortcuts & Double-click handler
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c" && !contextMenu) {
        e.preventDefault();
        copyAllTasks();
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only add task if double-clicking outside of task items and input fields
      if (
        !target.closest(".group") &&
        !target.closest("input") &&
        !target.closest("textarea") &&
        !target.closest("button")
      ) {
        addTodo("مهمة جديدة");
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    window.addEventListener("dblclick", handleDoubleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [addTodo, contextMenu, copyAllTasks, todos]);

  const createWorkspace = (workspaceData: Omit<Workspace, "id">) => {
    const workspace: Workspace = {
      ...workspaceData,
      id: Date.now().toString(),
    };
    setWorkspaces([...workspaces, workspace]);
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(workspaces.map(ws => 
      ws.id === id ? { ...ws, ...updates } : ws
    ));
  };

  const saveWorkspace = async () => {
    const { value: name } = await Swal.fire({
      title: "حفظ مساحة العمل",
      input: "text",
      inputLabel: "اسم مساحة العمل",
      inputPlaceholder: "أدخل اسم مساحة العمل",
      showCancelButton: true,
      confirmButtonText: "حفظ",
      cancelButtonText: "إلغاء",
    });

    if (name) {
      const workspace: Workspace = {
        id: Date.now().toString(),
        name,
        todos: [...todos],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setWorkspaces([...workspaces, workspace]);
      toast.success("تم حفظ مساحة العمل");
    }
  };

  const changeWorkspace = (workspaceId: string | null) => {
    if (workspaceId) {
      const workspace = workspaces.find((ws) => ws.id === workspaceId);
      if (workspace) {
        setTodos(workspace.todos);
        setCurrentWorkspace(workspaceId);
        toast.success(`تم التبديل إلى: ${workspace.name}`);
      }
    } else {
      // Switch to default workspace (empty todos)
      setTodos([]);
      setCurrentWorkspace(null);
      toast.info("تم التبديل إلى مساحة العمل الافتراضية");
    }
  };

  const loadWorkspace = async () => {
    if (workspaces.length === 0) {
      toast.error("لا توجد مساحات عمل محفوظة");
      return;
    }

    const options = workspaces.reduce((acc, ws) => {
      acc[ws.id] = ws.name;
      return acc;
    }, {} as Record<string, string>);

    const { value: workspaceId } = await Swal.fire({
      title: "تحميل مساحة عمل",
      input: "select",
      inputOptions: options,
      inputPlaceholder: "اختر مساحة العمل",
      showCancelButton: true,
      confirmButtonText: "تحميل",
      cancelButtonText: "إلغاء",
    });

    if (workspaceId) {
      changeWorkspace(workspaceId);
    }
  };

  const deleteWorkspace = async () => {
    if (workspaces.length === 0) {
      toast.error("لا توجد مساحات عمل محفوظة");
      return;
    }

    const options = workspaces.reduce((acc, ws) => {
      acc[ws.id] = ws.name;
      return acc;
    }, {} as Record<string, string>);

    const { value: workspaceId } = await Swal.fire({
      title: "حذف مساحة عمل",
      input: "select",
      inputOptions: options,
      inputPlaceholder: "اختر مساحة العمل للحذف",
      showCancelButton: true,
      confirmButtonText: "حذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (workspaceId) {
      const workspace = workspaces.find((ws) => ws.id === workspaceId);
      if (workspace) {
        const result = await Swal.fire({
          title: "هل أنت متأكد؟",
          text: `سيتم حذف مساحة العمل "${workspace.name}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "نعم، احذف",
          cancelButtonText: "إلغاء",
          confirmButtonColor: "#ef4444",
        });

        if (result.isConfirmed) {
          setWorkspaces(workspaces.filter((ws) => ws.id !== workspaceId));
          if (currentWorkspace === workspaceId) {
            setCurrentWorkspace(null);
          }
          toast.success("تم حذف مساحة العمل");
        }
      }
    }
  };

  const saveTask = (text: string) => {
    if (!text.trim()) return;

    const existing = savedTasks.find((t) => t.text === text);
    if (existing) {
      toast.info("هذا القالب محفوظ بالفعل");
      return;
    }

    setSavedTasks([
      ...savedTasks,
      { id: Date.now().toString(), text, usageCount: 1 },
    ]);
    toast.success("تم حفظ المهمة كقالب");
  };

  const useSavedTask = (text: string) => {
    setSavedTasks(
      savedTasks.map((t) =>
        t.text === text ? { ...t, usageCount: t.usageCount + 1 } : t
      )
    );
  };

  const deleteSavedTask = (id: string) => {
    setSavedTasks(savedTasks.filter((t) => t.id !== id));
  };

  const generateFullWorkspacePrompt = async () => {
    if (todos.filter((t) => !t.completed).length === 0) {
      toast.error("لا توجد مهام غير مكتملة لإنشاء برومبت");
      return;
    }

    setIsGeneratingPrompt(true);
    setShowWorkspacePrompt(true);

    try {
      // جمع كل المهام غير المكتملة
      const incompleteTasks = todos
        .filter((todo) => !todo.parentId && !todo.completed)
        .map((todo) => {
          const subTasks = todos
            .filter((t) => t.parentId === todo.id && !t.completed)
            .map((sub) => sub.text);
          return {
            main: todo.text,
            subTasks,
          };
        });

      const prompt = await generateWorkspacePrompt(
        incompleteTasks,
        workspacePromptMode,
        workspaceTechnologies
      );

      setGeneratedPrompt(prompt);
      toast.success("تم إنشاء البرومبت الشامل بنجاح");
    } catch (error) {
      toast.error("فشل إنشاء البرومبت");
      setShowWorkspacePrompt(false);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("تم نسخ البرومبت");
  };

  const exportDatabase = () => {
    const data = {
      todos,
      workspaces,
      savedTasks,
      settings: {
        globalPromptMode,
        globalFontSize,
        globalLineHeight,
        showHeader,
        showToolbar,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-todo-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تصدير قاعدة البيانات");
  };

  const importDatabase = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.todos) setTodos(data.todos);
        if (data.workspaces) setWorkspaces(data.workspaces);
        if (data.savedTasks) setSavedTasks(data.savedTasks);
        if (data.settings) {
          if (data.settings.globalPromptMode)
            setGlobalPromptMode(data.settings.globalPromptMode);
          if (data.settings.globalFontSize)
            setGlobalFontSize(data.settings.globalFontSize);
          if (data.settings.globalLineHeight)
            setGlobalLineHeight(data.settings.globalLineHeight);
          if (data.settings.showHeader !== undefined)
            setShowHeader(data.settings.showHeader);
          if (data.settings.showToolbar !== undefined)
            setShowToolbar(data.settings.showToolbar);
        }

        toast.success("تم استيراد قاعدة البيانات بنجاح");
      } catch (error) {
        toast.error("فشل استيراد قاعدة البيانات. تأكد من صحة الملف.");
      }
    };
    input.click();
  };

  const clearAllData = async () => {
    const result = await Swal.fire({
      title: '⚠️ تأكيد مسح جميع البيانات',
      html: `
        <div class="text-right">
          <p class="mb-4 text-lg">هل أنت متأكد من أنك تريد مسح جميع البيانات؟</p>
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p class="text-red-700 dark:text-red-300 font-medium mb-2">سيتم حذف:</p>
            <ul class="text-red-600 dark:text-red-400 text-sm space-y-1">
              <li>• جميع المهام ({todos.length} مهمة)</li>
              <li>• جميع مساحات العمل ({workspaces.length} مساحة)</li>
              <li>• جميع المهام المحفوظة ({savedTasks.length} مهمة)</li>
              <li>• جميع الإعدادات</li>
            </ul>
          </div>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>تحذير:</strong> لا يمكن التراجع عن هذا الإجراء!
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، امسح جميع البيانات',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal2-popup-arabic',
        title: 'swal2-title-arabic',
        htmlContainer: 'swal2-html-container-arabic',
        confirmButton: 'swal2-confirm-button-arabic',
        cancelButton: 'swal2-cancel-button-arabic'
      }
    });

    if (result.isConfirmed) {
      // مسح جميع البيانات
      setTodos([]);
      setWorkspaces([]);
      setSavedTasks([]);
      setSelectedTodos([]);
      setCurrentWorkspace(null);
      setShowSelectedOnly(false);
      
      // مسح localStorage
      localStorage.removeItem('todos');
      localStorage.removeItem('workspaces');
      localStorage.removeItem('savedTasks');
      localStorage.removeItem('currentWorkspace');
      localStorage.removeItem('settings');
      
      // إعادة تعيين الإعدادات
      setGlobalPromptMode("full-code");
      setGlobalFontSize(16);
      setGlobalLineHeight(1.5);
      setShowHeader(true);
      setShowToolbar(true);
      setIsProgressCollapsed(false);
      
      toast.success('تم مسح جميع البيانات بنجاح', {
        description: 'تم إعادة تعيين التطبيق إلى حالته الافتراضية'
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    )
      return;

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    // Only allow reordering within same parent
    if (sourceDroppableId !== destinationDroppableId) {
      toast.error("لا يمكن نقل المهمة إلى مجموعة أخرى");
      return;
    }

    // Get the items being reordered
    const isMainTask = sourceDroppableId === "main-tasks";
    const items = isMainTask
      ? todos.filter((t) => !t.parentId)
      : todos.filter((t) => t.parentId === sourceDroppableId);

    // Reorder the items
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    // Update order property for all reordered items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
      updatedAt: Date.now(),
    }));

    // Merge with other todos
    const otherTodos = isMainTask
      ? todos.filter((t) => t.parentId)
      : todos.filter((t) => !t.parentId || t.parentId !== sourceDroppableId);

    // Replace old items with updated items
    const newTodos = [...otherTodos];
    updatedItems.forEach((item) => {
      const existingIndex = newTodos.findIndex((t) => t.id === item.id);
      if (existingIndex !== -1) {
        newTodos[existingIndex] = item;
      } else {
        newTodos.push(item);
      }
    });

    setTodos(newTodos);
    toast.success("تم إعادة ترتيب المهام");
  };

  const handleContextMenu = (e: React.MouseEvent, todo: Todo) => {
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      todo,
    });
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".group")) return;
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      todo: null,
    });
  };

  const mainTodos = todos
    .filter((todo) => !todo.parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  let visibleMainTodos = hideCompleted
    ? mainTodos.filter((t) => !t.completed)
    : mainTodos;

  // Apply selected filter if enabled
  if (showSelectedOnly && selectedTodos.length > 0) {
    visibleMainTodos = visibleMainTodos.filter((t) =>
      selectedTodos.includes(t.id)
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(visibleMainTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTodos = visibleMainTodos.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [hideCompleted, showSelectedOnly, selectedTodos.length]);

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    mainTasks: mainTodos.length,
    subTasks: todos.filter((t) => t.parentId).length,
  };

  return (
    <div
      className="min-h-screen bg-background"
      onContextMenu={handleGlobalContextMenu}
    >
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        {showHeader && (
          <div className="mb-8 text-center relative">
            <div className="absolute left-4 top-0 flex gap-2">
              <ThemeToggle />
              {selectedTodos.length > 0 && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={copySelectedTasks}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ المحدد ({selectedTodos.length})
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-3 gradient-primary bg-clip-text text-transparent animate-fade-in">
              قائمة المهام الذكية
            </h1>
            <p className="text-lg text-muted-foreground">
              نظم مهامك بكفاءة وسهولة
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar
            total={stats.total}
            completed={stats.completed}
            mainTasks={stats.mainTasks}
            subTasks={stats.subTasks}
            isCollapsed={isProgressCollapsed}
            onToggleCollapse={toggleProgressCollapse}
          />
        </div>

        {/* Checkbox Legend */}
        {selectedTodos.length > 0 && <CheckboxLegend />}

        {/* Workspace Manager */}
        <div className="mb-6">
          <WorkspaceManager
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={changeWorkspace}
            onWorkspaceCreate={createWorkspace}
            onWorkspaceUpdate={updateWorkspace}
            onWorkspaceDelete={deleteWorkspace}
            onWorkspaceSave={saveCurrentWorkspace}
          />
        </div>

        {/* Toolbar */}
        {showToolbar && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {/* Global Settings */}
            <div className="flex gap-2 p-2 bg-secondary/20 rounded-lg">
              <Select
                value={globalPromptMode}
                onValueChange={(v: "full-code" | "code-changes" | "notes") => setGlobalPromptMode(v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-code">الكود كامل</SelectItem>
                  <SelectItem value="code-changes">تغييرات الكود</SelectItem>
                  <SelectItem value="notes">ملاحظات</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-md px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setGlobalFontSize((prev) => Math.max(prev - 2, 10))
                  }
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="text-sm w-12 text-center">
                  {globalFontSize}px
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setGlobalFontSize((prev) => Math.min(prev + 2, 24))
                  }
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setShowWorkspacePrompt(true)}
              variant="gradient"
              className="gap-2 hover:shadow-lg transition-smooth"
            >
              <Sparkles className="w-4 h-4" />
              إنشاء برومبت شامل
            </Button>

            <Button
              onClick={() => setShowTextOnly(!showTextOnly)}
              variant={showTextOnly ? "default" : "outline"}
              className="gap-2 hover:shadow-md transition-smooth"
            >
              <FileText className="w-4 h-4" />
              {showTextOnly ? "إظهار التحرير" : "نص فقط"}
            </Button>

            <Button
              onClick={copyAllTasks}
              variant="outline"
              className="gap-2 hover:shadow-md transition-smooth"
            >
              <Copy className="w-4 h-4" />
              نسخ المهام
            </Button>
            <Button
              onClick={() => setHideCompleted(!hideCompleted)}
              variant={hideCompleted ? "default" : "outline"}
              className="gap-2 hover:shadow-md transition-smooth"
            >
              {hideCompleted ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {hideCompleted ? "إظهار المكتملة" : "إخفاء المكتملة"}
            </Button>

            <Button
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
              variant={showSelectedOnly ? "default" : "outline"}
              className="gap-2 hover:shadow-md transition-smooth"
              disabled={selectedTodos.length === 0}
            >
              <CheckSquare className="w-4 h-4" />
              {showSelectedOnly ? "إظهار الكل" : "إظهار المحدد فقط"}
            </Button>

            <Button
              onClick={toggleProgressCollapse}
              variant={isProgressCollapsed ? "default" : "outline"}
              className="gap-2 hover:shadow-md transition-smooth"
            >
              {isProgressCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isProgressCollapsed ? "إظهار التقدم" : "إخفاء التقدم"}
            </Button>

            <Button
              onClick={clearAllData}
              variant="destructive"
              className="gap-2 hover:shadow-md transition-smooth"
            >
              <Trash2 className="w-4 h-4" />
              مسح جميع البيانات
            </Button>

            <Button
              onClick={selectAllTodos}
              variant="outline"
              className="gap-2 hover:shadow-md transition-smooth"
            >
              <CheckSquare className="w-4 h-4" />
              تحديد الكل
            </Button>

            <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 hover:shadow-md transition-smooth"
                >
                  <Settings className="w-4 h-4" />
                  الإحصائيات والإعدادات
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    الإحصائيات والإعدادات
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <Statistics todos={todos} />

                  {/* UI Settings */}
                  <div className="p-4 bg-secondary/20 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold">إعدادات العرض</h3>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        تباعد السطور في النصوص
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setGlobalLineHeight((prev) =>
                              Math.max(prev - 0.1, 1.0)
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <span className="text-sm w-16 text-center">
                          {globalLineHeight.toFixed(1)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setGlobalLineHeight((prev) =>
                              Math.min(prev + 0.1, 3.0)
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        إظهار الهيدر
                      </label>
                      <Button
                        variant={showHeader ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowHeader(!showHeader)}
                      >
                        {showHeader ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        إظهار شريط الأدوات
                      </label>
                      <Button
                        variant={showToolbar ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowToolbar(!showToolbar)}
                      >
                        {showToolbar ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={exportDatabase}
                        variant="gradient"
                        className="flex-1 gap-2"
                      >
                        <Save className="w-4 h-4" />
                        تصدير قاعدة البيانات
                      </Button>
                      <Button
                        onClick={importDatabase}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        استيراد قاعدة البيانات
                      </Button>
                    </div>
                  </div>

                  <SavedTasksManager
                    savedTasks={savedTasks}
                    onDelete={deleteSavedTask}
                    onUse={(text) => {
                      setNewTaskText(text);
                      setSavedTasks(
                        savedTasks.map((t) =>
                          t.text === text ? { ...t, usageCount: t.usageCount + 1 } : t
                        )
                      );
                      setShowStatistics(false);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Workspace Prompt Dialog */}
        <Dialog
          open={showWorkspacePrompt}
          onOpenChange={setShowWorkspacePrompt}
        >
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                إنشاء برومبت برمجي شامل لجميع المهام
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Settings */}
              <div className="p-4 bg-secondary/20 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    نوع البرومبت:
                  </label>
                  <Select
                    value={workspacePromptMode}
                    onValueChange={(v: "full-code" | "code-changes") => setWorkspacePromptMode(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-code">الكود كامل</SelectItem>
                      <SelectItem value="code-changes">
                        تغييرات الكود
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              {!generatedPrompt && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      التقنيات المطلوبة لكامل النقاط:
                    </label>
                    <TechnologyInput
                      technologies={workspaceTechnologies}
                      onChange={setWorkspaceTechnologies}
                    />
                  </div>
                  <Button
                    onClick={generateFullWorkspacePrompt}
                    disabled={isGeneratingPrompt}
                    variant="gradient"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isGeneratingPrompt
                      ? "جاري إنشاء البرومبت الشامل..."
                      : "إنشاء البرومبت"}
                  </Button>
                </div>
              )}

              {/* Generated Prompt */}
              {generatedPrompt && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">البرومبت المُنشأ:</h3>
                    <Button
                      onClick={copyPromptToClipboard}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      نسخ
                    </Button>
                  </div>
                  <Textarea
                    value={generatedPrompt}
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setGeneratedPrompt("");
                        setShowWorkspacePrompt(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      إغلاق
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedPrompt("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      إنشاء برومبت جديد
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Task */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo(newTaskText)}
              placeholder="أضف مهمة جديدة..."
              className="flex-1 text-lg h-12 rounded-xl border-2 focus:border-primary/50 transition-smooth"
            />
            <Button
              onClick={() => addTodo(newTaskText)}
              variant="gradient"
              size="lg"
              className="gap-2 px-8"
            >
              <Plus className="w-5 h-5" />
              إضافة
            </Button>
          </div>
        </div>

        {/* Tasks */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-3">
            <Droppable droppableId="main-tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {paginatedTodos.map((todo, index) => {
                    const subTodos = todos
                      .filter((t) => t.parentId === todo.id)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    let visibleSubTodos = hideCompleted
                      ? subTodos.filter((t) => !t.completed)
                      : subTodos;

                    // Apply selected filter for sub-todos if enabled
                    if (showSelectedOnly && selectedTodos.length > 0) {
                      visibleSubTodos = visibleSubTodos.filter((t) =>
                        selectedTodos.includes(t.id)
                      );
                    }

                    return (
                      <div key={todo.id} className="space-y-2">
                        <Draggable draggableId={todo.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                            >
                              <TodoItem
                                todo={todo}
                                isSubTask={false}
                                onUpdate={updateTodo}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onContextMenu={handleContextMenu}
                                savedTasks={savedTasks}
                                onSaveTask={saveTask}
                                onUseSavedTask={useSavedTask}
                                onAddTask={() => addTodo("مهمة جديدة")}
                                showTextOnly={showTextOnly}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                                globalPromptMode={globalPromptMode}
                                globalFontSize={globalFontSize}
                                globalLineHeight={globalLineHeight}
                                isSelected={selectedTodos.includes(todo.id)}
                                onToggleSelect={toggleSelectTodo}
                              />
                            </div>
                          )}
                        </Draggable>

                        {visibleSubTodos.length > 0 && (
                          <div className="ml-6 mt-3">
                            {/* Subtasks Header */}
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm font-medium text-primary">
                                المهام الفرعية ({visibleSubTodos.length})
                              </span>
                            </div>
                            
                            <Droppable droppableId={todo.id}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2"
                                >
                                {visibleSubTodos.map((subTodo, subIndex) => (
                                  <Draggable
                                    key={subTodo.id}
                                    draggableId={subTodo.id}
                                    index={subIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={provided.draggableProps.style}
                                      >
                                        <TodoItem
                                          todo={subTodo}
                                          isSubTask={true}
                                          onUpdate={updateTodo}
                                          onToggle={toggleTodo}
                                          onDelete={deleteTodo}
                                          onContextMenu={handleContextMenu}
                                          savedTasks={savedTasks}
                                          onSaveTask={saveTask}
                                          onUseSavedTask={useSavedTask}
                                          onAddTask={() =>
                                            addTodo("مهمة جديدة")
                                          }
                                          showTextOnly={showTextOnly}
                                          dragHandleProps={
                                            provided.dragHandleProps
                                          }
                                          isDragging={snapshot.isDragging}
                                          globalPromptMode={globalPromptMode}
                                          globalFontSize={globalFontSize}
                                          globalLineHeight={globalLineHeight}
                                          isSelected={selectedTodos.includes(
                                            subTodo.id
                                          )}
                                          onToggleSelect={toggleSelectTodo}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        {/* Pagination Controls */}
        {visibleMainTodos.length > itemsPerPage && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg border">
            {/* Page Info */}
            <div className="text-sm text-muted-foreground">
              عرض {startIndex + 1} إلى {Math.min(endIndex, visibleMainTodos.length)} من {visibleMainTodos.length} مهمة
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
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

              {/* Page Numbers */}
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

              {/* Next Button */}
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

            {/* Total Pages Info */}
            <div className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-bold mb-2">لا توجد مهام حالياً</p>
              <p className="text-sm text-muted-foreground">
                انقر بزر الماوس الأيمن لإضافة مهمة جديدة
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onAddTask={() => addTodo("مهمة جديدة")}
          onAddSubTask={
            contextMenu.todo && !contextMenu.todo.parentId
              ? () => addTodo("مهمة فرعية", contextMenu.todo!.id)
              : undefined
          }
          onEdit={() => {}}
          onDelete={() => contextMenu.todo && deleteTodo(contextMenu.todo.id)}
          onCopy={() => contextMenu.todo && copyTodo(contextMenu.todo)}
          onPaste={() => pasteTodo(contextMenu.todo?.id || null)}
          hasCopiedTask={!!copiedTodo}
          isSubTask={!!contextMenu.todo?.parentId}
          onShowStatistics={() => setShowStatistics(true)}
          onCopyAllTasks={copyAllTasks}
          onCopySelectedTasks={copySelectedTasks}
          onSelectAllTasks={selectAllTodos}
          onClearSelection={clearSelection}
          onToggleToolbar={() => setShowToolbar(!showToolbar)}
          onToggleHeader={() => setShowHeader(!showHeader)}
          onToggleProgress={() => setIsProgressCollapsed(!isProgressCollapsed)}
          onToggleSelectedOnly={() => setShowSelectedOnly(!showSelectedOnly)}
          onExportDatabase={exportDatabase}
          onImportDatabase={importDatabase}
          onClearAllData={clearAllData}
          onAddUrlToSelected={addUrlToSelected}
          showToolbar={showToolbar}
          showHeader={showHeader}
          showProgress={!isProgressCollapsed}
          hasSelectedTasks={selectedTodos.length > 0}
          showSelectedOnly={showSelectedOnly}
        />
      )}
    </div>
  );
};

export default TodoList;
