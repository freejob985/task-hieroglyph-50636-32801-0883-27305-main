import { useState, useRef, useEffect } from 'react';
import { Check, GripVertical, Sparkles, Mic, MicOff, Wand2, Copy, ZoomIn, ZoomOut, Trash2, Square, CheckSquare, User, ChevronDown, ChevronUp, ArrowRight, Circle, Dot, Link, ExternalLink, CopyCheck } from 'lucide-react';
import { Todo, TodoLink } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavedTask } from '@/types/todo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { improveTextWithGemini, generatePrompt, generateTaskTitle } from '@/utils/geminiService';
import TechnologyInput from './TechnologyInput';
import LinksManager from './LinksManager';
import { toast } from 'sonner';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface TodoItemProps {
  todo: Todo;
  isSubTask: boolean;
  onUpdate: (id: string, text: string, updates?: Partial<Todo>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, todo: Todo) => void;
  savedTasks: SavedTask[];
  onSaveTask: (text: string) => void;
  onUseSavedTask: (text: string) => void;
  onAddTask: () => void;
  showTextOnly?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
  globalPromptMode?: 'full-code' | 'code-changes' | 'notes';
  globalFontSize?: number;
  globalLineHeight?: number;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const TodoItem = ({
  todo,
  isSubTask,
  onUpdate,
  onToggle,
  onDelete,
  onContextMenu,
  savedTasks,
  onSaveTask,
  onUseSavedTask,
  onAddTask,
  showTextOnly = false,
  dragHandleProps,
  isDragging = false,
  globalPromptMode = 'full-code',
  globalFontSize = 14,
  globalLineHeight = 1.8,
  isSelected = false,
  onToggleSelect,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editUrl, setEditUrl] = useState(todo.url || '');
  const [editTitle, setEditTitle] = useState(todo.title || '');
  const [editLinks, setEditLinks] = useState<TodoLink[]>(todo.links || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, startListening, stopListening } = useSpeechRecognition(
    (text) => {
      setEditText(prev => prev + text);
    },
    'ar-SA'
  );

  // حساب عدد الأسطر في النص
  const calculateLineCount = (text: string) => {
    if (!text) return 0;
    const lines = text.split('\n');
    return lines.length;
  };

  const lineCount = calculateLineCount(todo.text);
  const shouldShowExpandButton = lineCount > 8;
  const maxVisibleLines = 8;

  // قطع النص حسب عدد الأسطر المرئية
  const getDisplayText = (text: string, expanded: boolean) => {
    if (!expanded && shouldShowExpandButton) {
      const lines = text.split('\n');
      return lines.slice(0, maxVisibleLines).join('\n');
    }
    return text;
  };

  const displayText = getDisplayText(todo.text, isExpanded);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // إعادة تعيين حالة التوسع عند تحديث النص
  useEffect(() => {
    setIsExpanded(false);
  }, [todo.text]);

  // إعادة تعيين حالة التحرير عند تحديث المهمة
  useEffect(() => {
    setEditText(todo.text);
    setEditUrl(todo.url || '');
    setEditTitle(todo.title || '');
    setEditLinks(todo.links || []);
  }, [todo.text, todo.url, todo.title, todo.links]);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, editText.trim(), { 
        url: editUrl.trim() || undefined,
        title: editTitle.trim() || undefined,
        links: editLinks.length > 0 ? editLinks : undefined
      });
      setIsEditing(false);
    }
  };

  const handleImproveText = async () => {
    if (!editText.trim()) return;
    
    setIsImproving(true);
    try {
      const improved = await improveTextWithGemini(editText);
      setEditText(improved);
      toast.success('تم تحسين النص بنجاح');
    } catch (error) {
      toast.error('فشل تحسين النص');
    } finally {
      setIsImproving(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!editText.trim() || globalPromptMode === 'notes') return;
    
    setIsImproving(true);
    try {
      const prompt = await generatePrompt(editText, globalPromptMode, []);
      setEditText(prompt);
      toast.success('تم إنشاء البرومبت بنجاح');
    } catch (error) {
      toast.error('فشل إنشاء البرومبت');
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editText);
    toast.success('تم نسخ النص');
  };

  const handleCopyUrl = () => {
    if (todo.url) {
      navigator.clipboard.writeText(todo.url);
      toast.success('تم نسخ الرابط');
    }
  };

  const handleGenerateTitle = async () => {
    if (!editText.trim()) return;
    
    setIsGeneratingTitle(true);
    try {
      const title = await generateTaskTitle(editText, editUrl || undefined);
      setEditTitle(title);
      toast.success('تم إنشاء العنوان بنجاح');
    } catch (error) {
      toast.error('فشل إنشاء العنوان');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

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

  const handleCopyTaskWithTitle = () => {
    let copyText = '';
    
    // إضافة العنوان إذا كان موجوداً
    if (todo.title) {
      copyText += `العنوان: ${todo.title}\n\n`;
    }
    
    // إضافة النص مع حذف علامات المارك داون
    const cleanText = removeMarkdownSyntax(todo.text);
    copyText += `المهمة: ${cleanText}`;
    
    // إضافة الرابط القديم إذا كان موجوداً (للتوافق مع الإصدارات السابقة)
    if (todo.url) {
      copyText += `\n\nالرابط: ${todo.url}`;
    }
    
    // إضافة الروابط الجديدة إذا كانت موجودة
    if (todo.links && todo.links.length > 0) {
      copyText += '\n\nالروابط:';
      todo.links.forEach(link => {
        copyText += `\n• ${link.description}: ${link.url}`;
      });
    }
    
    navigator.clipboard.writeText(copyText);
    toast.success('تم نسخ المهمة مع العنوان والروابط');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        setEditText(filteredSuggestions[selectedSuggestionIndex].text);
        onUseSavedTask(filteredSuggestions[selectedSuggestionIndex].text);
        setShowSuggestions(false);
        return;
      }
    }
    
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditUrl(todo.url || '');
      setEditTitle(todo.title || '');
      setEditLinks(todo.links || []);
      setIsEditing(false);
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = savedTasks
    .filter(task => 
      task.text.toLowerCase().includes(editText.toLowerCase()) && task.text !== editText
    )
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  return (
    <div
      className={`group relative ${isSubTask ? 'mr-8' : ''}`}
      onContextMenu={(e) => onContextMenu(e, todo)}
    >
      {/* Subtask Visual Indicator */}
      {isSubTask && (
        <div className="absolute -left-6 top-6 w-4 h-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
        </div>
      )}
      
      <div className={`bg-card rounded-2xl border-2 border-border p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/50 ${
        todo.completed ? 'opacity-60 bg-success/5 border-success/20' : ''
      } ${isDragging ? 'shadow-2xl scale-105 rotate-2 border-primary' : ''} ${isSelected ? 'ring-2 ring-primary border-primary' : ''} ${
        isSubTask ? 'border-l-4 border-l-primary/30 bg-gradient-to-r from-primary/5 to-transparent' : ''
      }`}>
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-200 group/drag">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors group-hover/drag:text-primary" />
          </div>

          {onToggleSelect && (
            <div className="selection-checkbox">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(todo.id)}
                className="mt-1 border-2 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white focus-visible:ring-blue-500 data-[state=checked]:border-blue-500 hover:border-blue-600 transition-colors"
                title="تحديد للنسخ أو العمليات المجمعة"
              />
            </div>
          )}
          
          <div className="completion-checkbox">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle(todo.id)}
              className="mt-1 border-2 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white focus-visible:ring-green-500 data-[state=checked]:border-green-500 hover:border-green-600 transition-colors"
              title="تمييز كمكتملة"
            />
          </div>

          {isEditing && !showTextOnly ? (
              <div className="flex-1 space-y-3">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  عنوان المهمة (اختياري)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="عنوان مختصر للمهمة..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTitle}
                    disabled={isGeneratingTitle || !editText.trim()}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingTitle ? 'جاري الإنشاء...' : 'توليد تلقائي'}
                  </Button>
                </div>
              </div>

              {/* URL Input (Legacy) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  رابط المشكلة (اختياري - للتوافق مع الإصدارات السابقة)
                </label>
                <Input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com/problem-url"
                  className="w-full"
                />
              </div>

              {/* Links Manager */}
              <div className="space-y-2">
                <LinksManager
                  links={editLinks}
                  onLinksChange={setEditLinks}
                  isEditing={true}
                />
              </div>

              {/* Text Area with Controls */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">
                    {globalPromptMode === 'full-code' ? 'الكود كامل' : 
                     globalPromptMode === 'code-changes' ? 'تغييرات الكود' : 'ملاحظات'} - {globalFontSize}px
                  </span>
                  
                  <div className="mr-auto flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyText}
                      title="نسخ النص فقط"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyTaskWithTitle}
                      title="نسخ المهمة مع العنوان والرابط"
                    >
                      <CopyCheck className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    setShowSuggestions(e.target.value.length > 1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="min-h-[120px] resize-y"
                  style={{ fontSize: `${globalFontSize}px`, lineHeight: globalLineHeight }}
                  placeholder="اكتب مهمتك هنا..."
                />
              </div>
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="bg-popover border border-primary/30 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                  <div className="px-3 py-2 bg-primary/5 border-b border-border flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-primary">اقتراحات (استخدم ↑↓ للتنقل، Enter للاختيار)</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setEditText(suggestion.text);
                          onUseSavedTask(suggestion.text);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-right p-3 transition-smooth border-b border-border last:border-0 ${
                          index === selectedSuggestionIndex 
                            ? 'bg-primary/10 border-r-4 border-r-primary' 
                            : 'hover:bg-secondary'
                        }`}
                      >
                        <p className="text-sm font-medium">{suggestion.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          استخدم {suggestion.usageCount} مرة
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  variant="gradient"
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  حفظ
                </Button>
                <Button
                  onClick={() => {
                    setEditText(todo.text);
                    setEditUrl(todo.url || '');
                    setEditTitle(todo.title || '');
                    setEditLinks(todo.links || []);
                    setIsEditing(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => onSaveTask(editText)}
                  variant="outline"
                  size="sm"
                >
                  حفظ كقالب
                </Button>
                <Button
                  onClick={handleImproveText}
                  variant="outline"
                  size="sm"
                  disabled={isImproving}
                  className="gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  {isImproving ? 'جاري التحسين...' : 'تحسين النص'}
                </Button>
                {globalPromptMode !== 'notes' && (
                  <Button
                    onClick={handleGeneratePrompt}
                    variant="outline"
                    size="sm"
                    disabled={isImproving}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isImproving ? 'جاري الإنشاء...' : 'إنشاء البرومبت'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`flex-1 cursor-pointer ${todo.completed ? 'task-completed' : ''}`}
              onClick={() => setIsEditing(true)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onAddTask();
              }}
            >
              <div className="space-y-2">
                <div className="relative">
                  {/* Subtask Prefix */}
                  {isSubTask && (
                    <div className="flex items-start gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-primary/70 mt-1 flex-shrink-0" />
                      <span className="text-xs text-primary/70 font-medium bg-primary/10 px-2 py-1 rounded-full">
                        مهمة فرعية
                      </span>
                    </div>
                  )}
                  
                  {/* Title Display */}
                  {todo.title && (
                    <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">العنوان:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyTaskWithTitle();
                          }}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                          title="نسخ المهمة كاملة"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground" style={{ fontSize: `${globalFontSize * 1.1}px` }}>
                        {todo.title}
                      </h3>
                    </div>
                  )}
                  
                  <div className="relative group/text">
                    <p className={`text-foreground leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                      isSubTask ? 'text-lg' : 'text-xl'
                    }`} style={{ fontSize: `${globalFontSize}px`, lineHeight: globalLineHeight }}>
                      {displayText}
                    </p>
                    {!todo.title && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTaskWithTitle();
                        }}
                        className="absolute top-0 left-0 opacity-0 group-hover/text:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-primary/10"
                        title="نسخ المهمة كاملة"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Legacy URL Display */}
                  {todo.url && (
                    <div className="mt-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-muted-foreground">رابط المشكلة (قديم):</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl();
                            }}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="نسخ الرابط"
                          >
                            <CopyCheck className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyTaskWithTitle();
                            }}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="نسخ المهمة كاملة"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <a
                        href={todo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-sm">{todo.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Links Display */}
                  {todo.links && todo.links.length > 0 && (
                    <div className="mt-3">
                      <LinksManager
                        links={todo.links}
                        onLinksChange={(links) => onUpdate(todo.id, todo.text, { links })}
                        isEditing={false}
                      />
                    </div>
                  )}
                  {!isExpanded && shouldShowExpandButton && (
                    <div className="absolute bottom-0 right-0 left-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                  )}
                </div>
                {shouldShowExpandButton && (
                  <div className="flex items-center justify-center pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                          إظهار أقل
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                          رؤية المزيد ({lineCount - maxVisibleLines} أسطر إضافية)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mr-auto">
            {/* Subtask Indicator in Toolbar */}
            {isSubTask && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                <Dot className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">فرعية</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-smooth text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
