import { CheckSquare, Check } from 'lucide-react';

const CheckboxLegend = () => {
  return (
    <div className="flex items-center gap-6 p-3 bg-secondary/20 rounded-lg mb-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 rounded bg-blue-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-blue-600 font-medium">تحديد للعمليات المجمعة</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-green-500 rounded bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-green-600 font-medium">تمييز كمكتملة</span>
      </div>
    </div>
  );
};

export default CheckboxLegend;