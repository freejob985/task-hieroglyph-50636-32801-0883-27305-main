import { useEffect } from 'react';

const BoltBadgeRemover = () => {
  useEffect(() => {
    const removeBoltBadge = () => {
      // البحث عن عنصر "Made in Bolt" وإزالته
      const boltBadges = document.querySelectorAll('[class*="badge"]');
      boltBadges.forEach(badge => {
        const badgeText = badge.textContent || '';
        if (badgeText.includes('Made in Bolt') || badgeText.includes('Bolt')) {
          const parentElement = badge.closest('div[style*="position: fixed"]');
          if (parentElement) {
            parentElement.style.display = 'none';
            parentElement.id = 'bolt-badge-hidden';
          }
        }
      });

      // البحث عن العناصر التي تحتوي على نص "Made in Bolt"
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const text = element.textContent || '';
        if (text.includes('Made in Bolt') && element.tagName !== 'SCRIPT') {
          const parentDiv = element.closest('div[style*="position: fixed"]');
          if (parentDiv) {
            parentDiv.style.display = 'none';
            parentDiv.id = 'bolt-badge-hidden';
          }
        }
      });

      // البحث عن العناصر بناءً على الخصائص المحددة
      const fixedElements = document.querySelectorAll('div[style*="position: fixed"][style*="bottom: 1rem"][style*="right: 1rem"]');
      fixedElements.forEach(element => {
        const shadowRoot = element.shadowRoot;
        if (shadowRoot) {
          const badgeInShadow = shadowRoot.querySelector('.badge');
          if (badgeInShadow && badgeInShadow.textContent?.includes('Made in Bolt')) {
            element.style.display = 'none';
            element.id = 'bolt-badge-hidden';
          }
        }
        
        // فحص المحتوى العادي أيضاً
        if (element.textContent?.includes('Made in Bolt')) {
          element.style.display = 'none';
          element.id = 'bolt-badge-hidden';
        }
      });
    };

    // تشغيل الوظيفة فور التحميل
    removeBoltBadge();

    // تشغيل الوظيفة كل ثانية للتأكد من الإزالة المستمرة
    const interval = setInterval(removeBoltBadge, 1000);

    // مراقب للتغييرات في DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // فحص العنصر الجديد
              if (element.textContent?.includes('Made in Bolt')) {
                const parentDiv = element.closest('div[style*="position: fixed"]');
                if (parentDiv) {
                  parentDiv.style.display = 'none';
                  parentDiv.id = 'bolt-badge-hidden';
                }
              }
            }
          });
        }
      });
    });

    // بدء مراقبة التغييرات
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // تنظيف الموارد عند إلغاء التحميل
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null; // هذا المكون لا يعرض أي شيء
};

export default BoltBadgeRemover;