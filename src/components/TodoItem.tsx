import { useState, useRef, useEffect } from 'react';
import { Check, GripVertical, Sparkles, Mic, MicOff, Wand2, Copy, ZoomIn, ZoomOut, Trash2, Square, CheckSquare, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SavedTask } from '@/types/todo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { improveTextWithGemini, generatePrompt } from '@/utils/geminiService';
import TechnologyInput from './TechnologyInput';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
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

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, editText.trim());
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
      <div className={`bg-card rounded-2xl border-2 border-border p-6 transition-smooth hover:shadow-xl hover:border-primary/50 ${
        todo.completed ? 'opacity-60 bg-success/5 border-success/20' : ''
      } ${isDragging ? 'shadow-2xl scale-105' : ''} ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}>
        <div className="flex items-start gap-3">
          <div {...dragHandleProps}>
            <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth cursor-grab active:cursor-grabbing" />
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
                    >
                      <Copy className="w-4 h-4" />
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
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg transition-all duration-300" style={{ fontSize: `${globalFontSize}px`, lineHeight: globalLineHeight }}>
                    {displayText}
                  </p>
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-smooth text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 mr-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
