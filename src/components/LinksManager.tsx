import { useState } from 'react';
import { Plus, Trash2, Edit2, Copy, ExternalLink, Link, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { TodoLink } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface LinksManagerProps {
  links: TodoLink[];
  onLinksChange: (links: TodoLink[]) => void;
  isEditing?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  soundEnabled?: boolean;
}

const LinksManager = ({ links, onLinksChange, isEditing = false, isCollapsed = true, onToggleCollapse, soundEnabled = true }: LinksManagerProps) => {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ url: '', description: '' });
  const [editingLink, setEditingLink] = useState({ url: '', description: '' });

  // دالة لإنشاء أصوات مختلفة للأحداث
  const playSound = (type: 'copy-all' | 'copy-selected' | 'copy-single' | 'copy-link' | 'completion') => {
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
  };

  const addLink = () => {
    if (!newLink.url.trim() || !newLink.description.trim()) {
      toast.error('يرجى إدخال الرابط والوصف');
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch {
      toast.error('الرابط غير صحيح');
      return;
    }

    const link: TodoLink = {
      id: Date.now().toString(),
      url: newLink.url.trim(),
      description: newLink.description.trim(),
      createdAt: Date.now(),
    };

    onLinksChange([...links, link]);
    setNewLink({ url: '', description: '' });
    toast.success('تم إضافة الرابط بنجاح');
  };

  const updateLink = (id: string) => {
    if (!editingLink.url.trim() || !editingLink.description.trim()) {
      toast.error('يرجى إدخال الرابط والوصف');
      return;
    }

    // Validate URL
    try {
      new URL(editingLink.url);
    } catch {
      toast.error('الرابط غير صحيح');
      return;
    }

    onLinksChange(
      links.map(link =>
        link.id === id
          ? { ...link, url: editingLink.url.trim(), description: editingLink.description.trim() }
          : link
      )
    );
    setEditingLinkId(null);
    setEditingLink({ url: '', description: '' });
    toast.success('تم تحديث الرابط بنجاح');
  };

  const deleteLink = (id: string) => {
    onLinksChange(links.filter(link => link.id !== id));
    toast.success('تم حذف الرابط');
  };

  const startEditing = (link: TodoLink) => {
    setEditingLinkId(link.id);
    setEditingLink({ url: link.url, description: link.description });
  };

  const cancelEditing = () => {
    setEditingLinkId(null);
    setEditingLink({ url: '', description: '' });
  };

  const copyLink = (link: TodoLink) => {
    navigator.clipboard.writeText(link.url);
    playSound('copy-link');
    toast.success('تم نسخ الرابط');
  };

  const copyLinkWithDescription = (link: TodoLink) => {
    const text = `${link.description}: ${link.url}`;
    navigator.clipboard.writeText(text);
    playSound('copy-link');
    toast.success('تم نسخ الرابط مع الوصف');
  };

  const copyAllLinks = () => {
    if (links.length === 0) {
      toast.error('لا توجد روابط للنسخ');
      return;
    }

    const text = links
      .map(link => `${link.description}: ${link.url}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    playSound('copy-all');
    toast.success(`تم نسخ ${links.length} رابط`);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            الروابط المرافقة ({links.length})
          </span>
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
        {isEditing && !isCollapsed && (
          <div className="flex gap-2">
            {links.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllLinks}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                نسخ الكل
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={addLink}
              disabled={!newLink.url.trim() || !newLink.description.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة رابط
            </Button>
          </div>
        )}
      </div>

      {/* Add New Link Form */}
      {isEditing && !isCollapsed && (
        <div className="p-4 bg-secondary/20 rounded-lg border border-dashed border-border">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                رابط جديد
              </label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                وصف الرابط
              </label>
              <Input
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف مختصر للرابط..."
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addLink}
                disabled={!newLink.url.trim() || !newLink.description.trim()}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
              <Button
                onClick={() => setNewLink({ url: '', description: '' })}
                variant="outline"
                size="sm"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      {!isCollapsed && (
        <div className="space-y-2">
          {links.map((link) => (
          <div
            key={link.id}
            className="p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            {editingLinkId === link.id ? (
              // Editing Mode
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    الرابط
                  </label>
                  <Input
                    value={editingLink.url}
                    onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    الوصف
                  </label>
                  <Input
                    value={editingLink.description}
                    onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للرابط..."
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateLink(link.id)}
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    حفظ
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {link.description}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(link)}
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                      title="نسخ الرابط"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLinkWithDescription(link)}
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                      title="نسخ الرابط مع الوصف"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    {isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(link)}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                          title="تعديل"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          ))}
        </div>
      )}

      {links.length === 0 && !isEditing && !isCollapsed && (
        <div className="text-center py-8 text-muted-foreground">
          <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">لا توجد روابط مضافة</p>
        </div>
      )}
    </div>
  );
};

export default LinksManager;
