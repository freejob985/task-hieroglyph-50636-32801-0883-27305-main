import TodoList from '@/components/TodoList';
import PWAInstallButton from '@/components/PWAInstallButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Button - Fixed at top */}
      <div className="fixed top-4 right-4 z-50">
        <PWAInstallButton />
      </div>
      
      {/* Main Content */}
      <TodoList />
    </div>
  );
};

export default Index;
