import { useState } from 'react';
import { Download, Check, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, isOnline, installApp, requestNotificationPermission } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!isInstallable) return;

    setIsInstalling(true);
    try {
      await installApp();
      toast.success('تم تثبيت التطبيق بنجاح!');
    } catch (error) {
      toast.error('فشل في تثبيت التطبيق');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('تم تفعيل الإشعارات');
    } else {
      toast.error('تم رفض الإشعارات');
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">تم تثبيت التطبيق</span>
      </div>
    );
  }

  if (!isInstallable) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">غير متاح للتثبيت</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        className="gap-2"
        size="sm"
      >
        <Download className="w-4 h-4" />
        {isInstalling ? 'جاري التثبيت...' : 'تثبيت التطبيق'}
      </Button>
      
      <Button
        onClick={handleNotificationPermission}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        الإشعارات
      </Button>
    </div>
  );
};

export default PWAInstallButton;

