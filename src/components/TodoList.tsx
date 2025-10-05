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
import { Todo, ContextMenuPosition, Workspace, SavedTask, ArchivedTask, Section } from "@/types/todo";
import TodoItem from "./TodoItem";
import ContextMenu from "./ContextMenu";
import ProgressBar from "./ProgressBar";
import Statistics from "./Statistics";
import SavedTasksManager from "./SavedTasksManager";
import ThemeToggle from "./ThemeToggle";
import CheckboxLegend from "./CheckboxLegend";
import WorkspaceManager from "./WorkspaceManager";
import ArchiveManager from "./ArchiveManager";
import SectionManager from "./SectionManager";
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

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition;
    todo: Todo | null;
  } | null>(null);
  const [copiedTodo, setCopiedTodo] = useState<Todo | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>(() => {
    try {
      const saved = localStorage.getItem("sections");
      return saved ? JSON.parse(saved) : [
        {
          id: "default-1",
          name: "مهام العمل",
          description: "المهام المتعلقة بالعمل",
          color: "blue",
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "default-2", 
          name: "مهام شخصية",
          description: "المهام الشخصية واليومية",
          color: "green",
          order: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      ];
    } catch (error) {
      console.warn("Error reading sections from localStorage:", error);
      return [];
    }
  });
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  const [savedTasks, setSavedTasks] = useState<SavedTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem("hideCompleted");
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn("Error reading hideCompleted from localStorage:", error);
      return false;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("soundEnabled");
      return saved ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn("Error reading soundEnabled from localStorage:", error);
      return true;
    }
  });
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
  >(() => {
    const saved = localStorage.getItem("globalPromptMode");
    return (saved as "full-code" | "code-changes" | "notes") || "full-code";
  });
  const [globalFontSize, setGlobalFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem("globalFontSize");
      return saved ? JSON.parse(saved) : 14;
    } catch (error) {
      console.warn("Error reading globalFontSize from localStorage:", error);
      return 14;
    }
  });
  const [globalLineHeight, setGlobalLineHeight] = useState(() => {
    try {
      const saved = localStorage.getItem("globalLineHeight");
      return saved ? JSON.parse(saved) : 1.8;
    } catch (error) {
      console.warn("Error reading globalLineHeight from localStorage:", error);
      return 1.8;
    }
  });
  const [showHeader, setShowHeader] = useState(() => {
    try {
      const saved = localStorage.getItem("showHeader");
      return saved ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn("Error reading showHeader from localStorage:", error);
      return true;
    }
  });
  const [showToolbar, setShowToolbar] = useState(() => {
    try {
      const saved = localStorage.getItem("showToolbar");
      return saved ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn("Error reading showToolbar from localStorage:", error);
      return true;
    }
  });
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("isProgressCollapsed");
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn("Error reading isProgressCollapsed from localStorage:", error);
      return false;
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);

  const saveCurrentWorkspace = useCallback((workspaceId: string, todos: Todo[]) => {
    setWorkspaces(workspaces.map(ws => 
      ws.id === workspaceId 
        ? { ...ws, todos: [...todos], sections: [...sections], updatedAt: Date.now() }
        : ws
    ));
  }, [workspaces, sections]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    const savedWorkspaces = localStorage.getItem("workspaces");
    const savedCurrentWorkspace = localStorage.getItem("currentWorkspace");
    const savedTasksData = localStorage.getItem("savedTasks");
    const savedArchivedTasks = localStorage.getItem("archivedTasks");
    const savedSections = localStorage.getItem("sections");
    const savedCurrentSection = localStorage.getItem("currentSection");
    const savedSectionsCollapsed = localStorage.getItem("sectionsCollapsed");

    if (saved) setTodos(JSON.parse(saved));
    if (savedWorkspaces) setWorkspaces(JSON.parse(savedWorkspaces));
    if (savedCurrentWorkspace) setCurrentWorkspace(savedCurrentWorkspace);
    if (savedTasksData) setSavedTasks(JSON.parse(savedTasksData));
    if (savedArchivedTasks) setArchivedTasks(JSON.parse(savedArchivedTasks));
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedCurrentSection) setCurrentSection(savedCurrentSection || null);
    if (savedSectionsCollapsed) setSectionsCollapsed(JSON.parse(savedSectionsCollapsed));
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
    localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  useEffect(() => {
    localStorage.setItem("sections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("currentSection", currentSection || "");
  }, [currentSection]);

  useEffect(() => {
    localStorage.setItem("sectionsCollapsed", JSON.stringify(sectionsCollapsed));
  }, [sectionsCollapsed]);

  useEffect(() => {
    localStorage.setItem("globalPromptMode", globalPromptMode);
  }, [globalPromptMode]);

  useEffect(() => {
    try {
      localStorage.setItem("globalFontSize", JSON.stringify(globalFontSize));
    } catch (error) {
      console.warn("Error saving globalFontSize to localStorage:", error);
    }
  }, [globalFontSize]);

  useEffect(() => {
    try {
      localStorage.setItem("globalLineHeight", JSON.stringify(globalLineHeight));
    } catch (error) {
      console.warn("Error saving globalLineHeight to localStorage:", error);
    }
  }, [globalLineHeight]);

  useEffect(() => {
    try {
      localStorage.setItem("showHeader", JSON.stringify(showHeader));
    } catch (error) {
      console.warn("Error saving showHeader to localStorage:", error);
    }
  }, [showHeader]);

  useEffect(() => {
    try {
      localStorage.setItem("showToolbar", JSON.stringify(showToolbar));
    } catch (error) {
      console.warn("Error saving showToolbar to localStorage:", error);
    }
  }, [showToolbar]);

  useEffect(() => {
    try {
      localStorage.setItem("isProgressCollapsed", JSON.stringify(isProgressCollapsed));
    } catch (error) {
      console.warn("Error saving isProgressCollapsed to localStorage:", error);
    }
  }, [isProgressCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));
    } catch (error) {
      console.warn("Error saving hideCompleted to localStorage:", error);
    }
  }, [hideCompleted]);

  useEffect(() => {
    try {
      localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
    } catch (error) {
      console.warn("Error saving soundEnabled to localStorage:", error);
    }
  }, [soundEnabled]);

  const addTodo = useCallback((text: string, parentId: string | null = null, sectionId: string | null = null) => {
    if (!text.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      parentId,
      sectionId: sectionId || currentSection,
      order: todos.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTodos([...todos, newTodo]);
    toast.success("تمت إضافة المهمة بنجاح");
    setNewTaskText("");
  }, [todos, currentSection]);

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

  const playCompletionSound = () => {
    if (soundEnabled) {
      // Create a simple completion sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant completion sound (ascending notes)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // دالة لإنشاء أصوات مختلفة للأحداث
  const playSound = useCallback((type: 'copy-all' | 'copy-selected' | 'copy-single' | 'copy-link' | 'completion') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const currentTime = audioContext.currentTime;
    
    switch (type) {
      case 'copy-all':
        // صوت نسخ جميع المهام - نغمة منخفضة متدرجة
        oscillator.frequency.setValueAtTime(220, currentTime); // A3
        oscillator.frequency.setValueAtTime(246.94, currentTime + 0.1); // B3
        oscillator.frequency.setValueAtTime(261.63, currentTime + 0.2); // C4
        oscillator.frequency.setValueAtTime(293.66, currentTime + 0.3); // D4
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        break;
        
      case 'copy-selected':
        // صوت نسخ المهام المحددة - نغمة متوسطة
        oscillator.frequency.setValueAtTime(329.63, currentTime); // E4
        oscillator.frequency.setValueAtTime(349.23, currentTime + 0.1); // F4
        oscillator.frequency.setValueAtTime(392.00, currentTime + 0.2); // G4
        gainNode.gain.setValueAtTime(0.35, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.4);
        break;
        
      case 'copy-single':
        // صوت نسخ مهمة واحدة - نغمة قصيرة
        oscillator.frequency.setValueAtTime(440, currentTime); // A4
        oscillator.frequency.setValueAtTime(523.25, currentTime + 0.05); // C5
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.2);
        break;
        
      case 'copy-link':
        // صوت نسخ رابط - نغمة خفيفة
        oscillator.frequency.setValueAtTime(659.25, currentTime); // E5
        oscillator.frequency.setValueAtTime(783.99, currentTime + 0.05); // G5
        gainNode.gain.setValueAtTime(0.25, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'completion':
        // صوت إكمال المهمة - النغمة الأصلية
        oscillator.frequency.setValueAtTime(523.25, currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
        break;
    }
  }, [soundEnabled]);

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    const wasCompleted = todo?.completed;
    const willBeCompleted = !wasCompleted;
    
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // Play sound when completing a task (not when uncompleting)
    if (todo && !wasCompleted && willBeCompleted) {
      playSound('completion');
    }
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
        
        let result = '';
        
        // إضافة العنوان إذا كان موجوداً
        if (todo.title) {
          result += `العنوان: ${todo.title}\n\n`;
        }
        
        // إضافة النص مع حذف علامات المارك داون
        const cleanText = removeMarkdownSyntax(todo.text);
        result += `المهمة: ${cleanText}`;
        
        // إضافة الرابط القديم إذا كان موجوداً (للتوافق مع الإصدارات السابقة)
        if (todo.url) {
          result += `\n\nالرابط: ${todo.url}`;
        }
        
        // إضافة الروابط الجديدة إذا كانت موجودة
        if (todo.links && todo.links.length > 0) {
          result += '\n\nالروابط المرافقة:';
          todo.links.forEach(link => {
            result += `\n• ${link.description}: ${link.url}`;
          });
        }

        // إضافة الملفات المرفقة إذا كانت موجودة
        if (todo.attachments && todo.attachments.length > 0) {
          result += '\n\nالملفات المرافقة:';
          todo.attachments.forEach(attachment => {
            result += `\n• ${attachment.url}`;
          });
        }
        
        // إضافة المهام الفرعية
        if (subTasks.length > 0) {
          result += '\n\nالمهام الفرعية:';
          subTasks.forEach((sub) => {
            const cleanSubText = removeMarkdownSyntax(sub.text);
            result += `\n• ${cleanSubText}`;
            if (sub.url) {
              result += `\n  🔗 ${sub.url}`;
            }
                   if (sub.links && sub.links.length > 0) {
                     sub.links.forEach(link => {
                       result += `\n  🔗 ${link.description}: ${link.url}`;
                     });
                   }
                   if (sub.attachments && sub.attachments.length > 0) {
                     sub.attachments.forEach(attachment => {
                       result += `\n  📎 ${attachment.url}`;
                     });
                   }
          });
        }
        
        return result;
      })
      .join("\n\n" + "=".repeat(50) + "\n\n");

    navigator.clipboard.writeText(text);
    playSound('copy-all');
    toast.success("تم نسخ المهام غير المكتملة مع العناوين والروابط");
  }, [todos, playSound]);

  // دالة لحذف علامات المارك داون
  const removeMarkdownSyntax = (text: string): string => {
    return text
      // حذف العناوين
      .replace(/^#{1,6}\s+/gm, '')
      // حذف النص المائل والغامق
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // حذف الروابط
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // حذف الكود المضمن
      .replace(/`([^`]+)`/g, '$1')
      // حذف الكود المحدد
      .replace(/```[\s\S]*?```/g, '')
      // حذف القوائم
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // حذف الاقتباسات
      .replace(/^>\s*/gm, '')
      // حذف الخطوط الأفقية
      .replace(/^[-*_]{3,}$/gm, '')
      // تنظيف المسافات الزائدة
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

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
        
        let result = '';
        
        // إضافة العنوان إذا كان موجوداً
        if (todo.title) {
          result += `العنوان: ${todo.title}\n\n`;
        }
        
        // إضافة النص مع حذف علامات المارك داون
        const cleanText = removeMarkdownSyntax(todo.text);
        result += `المهمة: ${cleanText}`;
        
        // إضافة الرابط القديم إذا كان موجوداً (للتوافق مع الإصدارات السابقة)
        if (todo.url) {
          result += `\n\nالرابط: ${todo.url}`;
        }
        
        // إضافة الروابط الجديدة إذا كانت موجودة
        if (todo.links && todo.links.length > 0) {
          result += '\n\nالروابط المرافقة:';
          todo.links.forEach(link => {
            result += `\n• ${link.description}: ${link.url}`;
          });
        }

        // إضافة الملفات المرفقة إذا كانت موجودة
        if (todo.attachments && todo.attachments.length > 0) {
          result += '\n\nالملفات المرافقة:';
          todo.attachments.forEach(attachment => {
            result += `\n• ${attachment.url}`;
          });
        }
        
        // إضافة المهام الفرعية
        if (subTasks.length > 0) {
          result += '\n\nالمهام الفرعية:';
          subTasks.forEach((sub) => {
            const cleanSubText = removeMarkdownSyntax(sub.text);
            result += `\n• ${cleanSubText}`;
            if (sub.url) {
              result += `\n  🔗 ${sub.url}`;
            }
                   if (sub.links && sub.links.length > 0) {
                     sub.links.forEach(link => {
                       result += `\n  🔗 ${link.description}: ${link.url}`;
                     });
                   }
                   if (sub.attachments && sub.attachments.length > 0) {
                     sub.attachments.forEach(attachment => {
                       result += `\n  📎 ${attachment.url}`;
                     });
                   }
          });
        }
        
        return result;
      })
      .join("\n\n" + "=".repeat(50) + "\n\n");

    navigator.clipboard.writeText(text);
    playSound('copy-selected');
    toast.success(`تم نسخ ${selectedTodos.length} مهمة مع العناوين والروابط`);
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

    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 0) {
          navigator.clipboard.writeText(selectedText).then(() => {
            toast.success(`تم نسخ النص: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`);
          }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = selectedText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success(`تم نسخ النص: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`);
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    window.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("mouseup", handleTextSelection);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("mouseup", handleTextSelection);
    };
  }, [addTodo, contextMenu, copyAllTasks, todos]);

  const createWorkspace = (workspaceData: Omit<Workspace, "id">) => {
    const workspace: Workspace = {
      ...workspaceData,
      id: Date.now().toString(),
      sections: workspaceData.sections || [],
    };
    setWorkspaces([...workspaces, workspace]);
  };

  // Section management functions
  const createSection = (sectionData: Omit<Section, "id">) => {
    const section: Section = {
      ...sectionData,
      id: Date.now().toString(),
    };
    setSections([...sections, section]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const deleteSection = (id: string) => {
    // Move tasks from deleted section to no section
    setTodos(todos.map(todo => 
      todo.sectionId === id ? { ...todo, sectionId: null } : todo
    ));
    setSections(sections.filter(s => s.id !== id));
    if (currentSection === id) {
      setCurrentSection(null);
    }
  };

  const copySectionTasks = (sectionId: string) => {
    let tasksToCopy: Todo[];
    
    if (sectionId === "all") {
      tasksToCopy = todos.filter(todo => !todo.parentId);
    } else {
      tasksToCopy = todos.filter(todo => todo.sectionId === sectionId && !todo.parentId);
    }

    if (tasksToCopy.length === 0) {
      toast.error("لا توجد مهام في هذا القسم");
      return;
    }

    const text = tasksToCopy
      .map((todo) => {
        const subTasks = todos.filter(
          (t) => t.parentId === todo.id
        );
        
        let result = '';
        
        if (todo.title) {
          result += `العنوان: ${todo.title}\n\n`;
        }
        
        const cleanText = removeMarkdownSyntax(todo.text);
        result += `المهمة: ${cleanText}`;
        
        if (todo.url) {
          result += `\n\nالرابط: ${todo.url}`;
        }
        
        if (todo.links && todo.links.length > 0) {
          result += '\n\nالروابط المرافقة:';
          todo.links.forEach(link => {
            result += `\n• ${link.description}: ${link.url}`;
          });
        }

        if (todo.attachments && todo.attachments.length > 0) {
          result += '\n\nالملفات المرافقة:';
          todo.attachments.forEach(attachment => {
            result += `\n• ${attachment.url}`;
          });
        }
        
        if (subTasks.length > 0) {
          result += '\n\nالمهام الفرعية:';
          subTasks.forEach((sub) => {
            const cleanSubText = removeMarkdownSyntax(sub.text);
            result += `\n• ${cleanSubText}`;
            if (sub.url) {
              result += `\n  🔗 ${sub.url}`;
            }
            if (sub.links && sub.links.length > 0) {
              sub.links.forEach(link => {
                result += `\n  🔗 ${link.description}: ${link.url}`;
              });
            }
            if (sub.attachments && sub.attachments.length > 0) {
              sub.attachments.forEach(attachment => {
                result += `\n  📎 ${attachment.url}`;
              });
            }
          });
        }
        
        return result;
      })
      .join("\n\n" + "=".repeat(50) + "\n\n");

    navigator.clipboard.writeText(text);
    playSound('copy-selected');
    toast.success(`تم نسخ ${tasksToCopy.length} مهمة من القسم`);
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
        sections: [...sections],
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
        setSections(workspace.sections || []);
        setCurrentWorkspace(workspaceId);
        setCurrentSection(null); // Reset section when changing workspace
        toast.success(`تم التبديل إلى: ${workspace.name}`);
      }
    } else {
      // Switch to default workspace (empty todos)
      setTodos([]);
      setSections([]);
      setCurrentWorkspace(null);
      setCurrentSection(null);
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
        hideCompleted,
        soundEnabled,
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
          if (data.settings.hideCompleted !== undefined)
            setHideCompleted(data.settings.hideCompleted);
          if (data.settings.soundEnabled !== undefined)
            setSoundEnabled(data.settings.soundEnabled);
        }

        toast.success("تم استيراد قاعدة البيانات بنجاح");
      } catch (error) {
        toast.error("فشل استيراد قاعدة البيانات. تأكد من صحة الملف.");
      }
    };
    input.click();
  };

  // وظائف الأرشفة
  const archiveTask = (mainTaskId: string, reason?: string) => {
    const mainTask = todos.find(t => t.id === mainTaskId && !t.parentId);
    if (!mainTask) {
      toast.error('المهمة الرئيسية غير موجودة');
      return;
    }

    const subTasks = todos.filter(t => t.parentId === mainTaskId);
    
    const archivedTask: ArchivedTask = {
      id: Date.now().toString(),
      mainTask: { ...mainTask },
      subTasks: [...subTasks],
      archivedAt: Date.now(),
      archivedBy: 'المستخدم', // يمكن تحسين هذا لاحقاً
      reason: reason
    };

    setArchivedTasks(prev => [archivedTask, ...prev]);
    
    // حذف المهمة الرئيسية والمهام الفرعية من القائمة الحالية
    const idsToRemove = [mainTaskId, ...subTasks.map(t => t.id)];
    setTodos(prev => prev.filter(t => !idsToRemove.includes(t.id)));
    
    toast.success('تم أرشفة المهمة بنجاح');
  };

  const restoreTask = (archivedTask: ArchivedTask) => {
    // إضافة المهمة الرئيسية
    const restoredMainTask = {
      ...archivedTask.mainTask,
      id: Date.now().toString(), // إنشاء معرف جديد
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // إضافة المهام الفرعية مع تحديث parentId
    const restoredSubTasks = archivedTask.subTasks.map(subTask => ({
      ...subTask,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // إنشاء معرف فريد
      parentId: restoredMainTask.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    setTodos(prev => [...prev, restoredMainTask, ...restoredSubTasks]);
    
    // حذف المهمة من الأرشيف
    setArchivedTasks(prev => prev.filter(t => t.id !== archivedTask.id));
    
    toast.success('تم استعادة المهمة بنجاح');
  };

  const deleteArchivedTask = (archivedTaskId: string) => {
    setArchivedTasks(prev => prev.filter(t => t.id !== archivedTaskId));
    toast.success('تم حذف المهمة نهائياً من الأرشيف');
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
              <li>• جميع المهام المؤرشفة ({archivedTasks.length} مهمة)</li>
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
      setArchivedTasks([]);
      setSelectedTodos([]);
      setCurrentWorkspace(null);
      setShowSelectedOnly(false);
      
      // مسح localStorage
      localStorage.removeItem('todos');
      localStorage.removeItem('workspaces');
      localStorage.removeItem('savedTasks');
      localStorage.removeItem('archivedTasks');
      localStorage.removeItem('currentWorkspace');
      localStorage.removeItem('settings');
      
      // إعادة تعيين الإعدادات
      setGlobalPromptMode("full-code");
      setGlobalFontSize(16);
      setGlobalLineHeight(1.5);
      setShowHeader(true);
      setShowToolbar(true);
      setIsProgressCollapsed(false);
      setHideCompleted(false);
      setSoundEnabled(true);
      
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

    // Handle cross-section movement
    if (sourceDroppableId.startsWith("section-") && destinationDroppableId.startsWith("section-")) {
      const sourceSectionId = sourceDroppableId.replace("section-", "");
      const destSectionId = destinationDroppableId.replace("section-", "");
      
      if (sourceSectionId !== destSectionId) {
        // Move task to different section
        const taskToMove = todos.find(t => t.id === result.draggableId);
        if (taskToMove) {
          setTodos(todos.map(todo => 
            todo.id === result.draggableId 
              ? { ...todo, sectionId: destSectionId, updatedAt: Date.now() }
              : todo
          ));
          toast.success("تم نقل المهمة إلى القسم الجديد");
        }
        return;
      }
    }

    // Handle section to main tasks movement
    if (sourceDroppableId.startsWith("section-") && destinationDroppableId === "main-tasks") {
      const sourceSectionId = sourceDroppableId.replace("section-", "");
      const taskToMove = todos.find(t => t.id === result.draggableId);
      if (taskToMove) {
        setTodos(todos.map(todo => 
          todo.id === result.draggableId 
            ? { ...todo, sectionId: null, updatedAt: Date.now() }
            : todo
        ));
        toast.success("تم نقل المهمة إلى المهام العامة");
      }
      return;
    }

    // Handle main tasks to section movement
    if (sourceDroppableId === "main-tasks" && destinationDroppableId.startsWith("section-")) {
      const destSectionId = destinationDroppableId.replace("section-", "");
      const taskToMove = todos.find(t => t.id === result.draggableId);
      if (taskToMove) {
        setTodos(todos.map(todo => 
          todo.id === result.draggableId 
            ? { ...todo, sectionId: destSectionId, updatedAt: Date.now() }
            : todo
        ));
        toast.success("تم نقل المهمة إلى القسم");
      }
      return;
    }

    // Only allow reordering within same parent for subtasks
    if (sourceDroppableId !== destinationDroppableId && !sourceDroppableId.startsWith("section-")) {
      toast.error("لا يمكن نقل المهمة إلى مجموعة أخرى");
      return;
    }

    // Get the items being reordered
    const isMainTask = sourceDroppableId === "main-tasks";
    const isSectionTask = sourceDroppableId.startsWith("section-");
    
    let items: Todo[];
    if (isMainTask) {
      items = todos.filter((t) => !t.parentId && t.sectionId === null);
    } else if (isSectionTask) {
      const sectionId = sourceDroppableId.replace("section-", "");
      items = todos.filter((t) => !t.parentId && t.sectionId === sectionId);
    } else {
      items = todos.filter((t) => t.parentId === sourceDroppableId);
    }

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
    let otherTodos: Todo[];
    if (isMainTask) {
      otherTodos = todos.filter((t) => t.parentId || t.sectionId !== null);
    } else if (isSectionTask) {
      const sectionId = sourceDroppableId.replace("section-", "");
      otherTodos = todos.filter((t) => !t.parentId && t.sectionId !== sectionId);
    } else {
      otherTodos = todos.filter((t) => !t.parentId || t.parentId !== sourceDroppableId);
    }

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

  const handleArchiveTaskFromContext = () => {
    if (contextMenu?.todo && !contextMenu.todo.parentId) {
      archiveTask(contextMenu.todo.id);
      setContextMenu(null);
    }
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".group")) return;
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      todo: null,
    });
  };

  // Filter todos based on current section
  const getFilteredTodos = () => {
    let filteredTodos = todos.filter((todo) => !todo.parentId);
    
    if (currentSection === null) {
      // Show all tasks not in any section
      filteredTodos = filteredTodos.filter(todo => todo.sectionId === null);
    } else {
      // Show tasks in current section
      filteredTodos = filteredTodos.filter(todo => todo.sectionId === currentSection);
    }
    
    return filteredTodos.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const mainTodos = getFilteredTodos();
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
            <h1 
              className="font-bold mb-3 gradient-primary bg-clip-text text-transparent animate-fade-in"
              style={{ fontSize: `${globalFontSize * 2.5}px` }}
            >
              قائمة المهام الذكية
            </h1>
            <p 
              className="text-muted-foreground"
              style={{ fontSize: `${globalFontSize * 1.2}px` }}
            >
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

        {/* Section Manager */}
        <div className="mb-6">
          <SectionManager
            sections={sections}
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            onSectionCreate={createSection}
            onSectionUpdate={updateSection}
            onSectionDelete={deleteSection}
            onSectionReorder={() => {}} // TODO: Implement section reordering
            onCopySectionTasks={copySectionTasks}
            todos={todos}
            isCollapsed={sectionsCollapsed}
            onToggleCollapse={() => setSectionsCollapsed(!sectionsCollapsed)}
          />
        </div>

        {/* Toolbar */}
        {showToolbar && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center" style={{ fontSize: `${globalFontSize}px` }}>
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
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant={soundEnabled ? "default" : "outline"}
              className="gap-2 hover:shadow-md transition-smooth"
            >
              {soundEnabled ? (
                <span className="text-lg">♪</span>
              ) : (
                <span className="text-lg">♫</span>
              )}
              {soundEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
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

            <ArchiveManager
              archivedTasks={archivedTasks}
              onRestoreTask={restoreTask}
              onDeleteArchivedTask={deleteArchivedTask}
              onArchiveTask={archiveTask}
              todos={todos}
            />

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
                  <Statistics todos={todos} archivedTasks={archivedTasks} />

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

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        تشغيل صوت إكمال المهام
                      </label>
                      <Button
                        variant={soundEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                      >
                        {soundEnabled ? (
                          <span className="text-lg">♪</span>
                        ) : (
                          <span className="text-lg">♫</span>
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
          <div className="space-y-6">
            {/* Show all sections or just current section */}
            {currentSection === null ? (
              // Show all sections
              <div className="space-y-6">
                {/* General Tasks (no section) */}
                {(() => {
                  const generalTodos = todos
                    .filter(todo => !todo.parentId && todo.sectionId === null)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                  
                  let visibleGeneralTodos = hideCompleted
                    ? generalTodos.filter(t => !t.completed)
                    : generalTodos;

                  if (showSelectedOnly && selectedTodos.length > 0) {
                    visibleGeneralTodos = visibleGeneralTodos.filter(t =>
                      selectedTodos.includes(t.id)
                    );
                  }

                  if (visibleGeneralTodos.length === 0) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <h3 className="font-semibold text-lg">المهام العامة</h3>
                        <span className="text-sm text-muted-foreground">
                          ({visibleGeneralTodos.length} مهمة)
                        </span>
                      </div>
                      
                      <Droppable droppableId="main-tasks">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3"
                          >
                            {visibleGeneralTodos.map((todo, index) => {
                              const subTodos = todos
                                .filter((t) => t.parentId === todo.id)
                                .sort((a, b) => (a.order || 0) - (b.order || 0));
                              let visibleSubTodos = hideCompleted
                                ? subTodos.filter((t) => !t.completed)
                                : subTodos;

                              if (showSelectedOnly && selectedTodos.length > 0) {
                                visibleSubTodos = visibleSubTodos.filter(t =>
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
                                          soundEnabled={soundEnabled}
                                        />
                                      </div>
                                    )}
                                  </Draggable>

                                  {visibleSubTodos.length > 0 && (
                                    <div className="ml-6 mt-3">
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
                                                      onAddTask={() => addTodo("مهمة جديدة")}
                                                      showTextOnly={showTextOnly}
                                                      dragHandleProps={provided.dragHandleProps}
                                                      isDragging={snapshot.isDragging}
                                                      globalPromptMode={globalPromptMode}
                                                      globalFontSize={globalFontSize}
                                                      globalLineHeight={globalLineHeight}
                                                      isSelected={selectedTodos.includes(subTodo.id)}
                                                      onToggleSelect={toggleSelectTodo}
                                                      soundEnabled={soundEnabled}
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
                  );
                })()}

                {/* Section Tasks */}
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const sectionTodos = todos
                      .filter(todo => !todo.parentId && todo.sectionId === section.id)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    
                    let visibleSectionTodos = hideCompleted
                      ? sectionTodos.filter(t => !t.completed)
                      : sectionTodos;

                    if (showSelectedOnly && selectedTodos.length > 0) {
                      visibleSectionTodos = visibleSectionTodos.filter(t =>
                        selectedTodos.includes(t.id)
                      );
                    }

                    if (visibleSectionTodos.length === 0) return null;

                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              SECTION_COLORS.find(c => c.value === section.color)?.class || "bg-blue-500"
                            }`}
                          />
                          <h3 className="font-semibold text-lg">{section.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            ({visibleSectionTodos.length} مهمة)
                          </span>
                          {section.description && (
                            <span className="text-sm text-muted-foreground">
                              - {section.description}
                            </span>
                          )}
                        </div>
                        
                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-3"
                            >
                              {visibleSectionTodos.map((todo, index) => {
                                const subTodos = todos
                                  .filter((t) => t.parentId === todo.id)
                                  .sort((a, b) => (a.order || 0) - (b.order || 0));
                                let visibleSubTodos = hideCompleted
                                  ? subTodos.filter((t) => !t.completed)
                                  : subTodos;

                                if (showSelectedOnly && selectedTodos.length > 0) {
                                  visibleSubTodos = visibleSubTodos.filter(t =>
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
                                            soundEnabled={soundEnabled}
                                          />
                                        </div>
                                      )}
                                    </Draggable>

                                    {visibleSubTodos.length > 0 && (
                                      <div className="ml-6 mt-3">
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
                                                        onAddTask={() => addTodo("مهمة جديدة")}
                                                        showTextOnly={showTextOnly}
                                                        dragHandleProps={provided.dragHandleProps}
                                                        isDragging={snapshot.isDragging}
                                                        globalPromptMode={globalPromptMode}
                                                        globalFontSize={globalFontSize}
                                                        globalLineHeight={globalLineHeight}
                                                        isSelected={selectedTodos.includes(subTodo.id)}
                                                        onToggleSelect={toggleSelectTodo}
                                                        soundEnabled={soundEnabled}
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
                    );
                  })}
              </div>
            ) : (
              // Show only current section
              <div className="space-y-3">
                <Droppable droppableId={`section-${currentSection}`}>
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
                          visibleSubTodos = visibleSubTodos.filter(t =>
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
                                    soundEnabled={soundEnabled}
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
                                                onAddTask={() => addTodo("مهمة جديدة")}
                                                showTextOnly={showTextOnly}
                                                dragHandleProps={provided.dragHandleProps}
                                                isDragging={snapshot.isDragging}
                                                globalPromptMode={globalPromptMode}
                                                globalFontSize={globalFontSize}
                                                globalLineHeight={globalLineHeight}
                                                isSelected={selectedTodos.includes(subTodo.id)}
                                                onToggleSelect={toggleSelectTodo}
                                                soundEnabled={soundEnabled}
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
            )}
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
              <p className="font-bold mb-2" style={{ fontSize: `${globalFontSize * 1.5}px` }}>لا توجد مهام حالياً</p>
              <p className="text-muted-foreground" style={{ fontSize: `${globalFontSize * 0.9}px` }}>
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
          onArchiveTask={handleArchiveTaskFromContext}
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
