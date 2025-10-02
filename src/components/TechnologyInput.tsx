import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const COMMON_TECHNOLOGIES = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Bootstrap',
  'Vue.js',
  'Angular',
  'Next.js',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Google Cloud',
  'Git',
  'GitHub',
  'GitLab',
  'REST API',
  'GraphQL',
  'WebSocket',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'PHP',
  'Laravel',
  'Ruby',
  'Ruby on Rails',
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Flutter',
  'React Native',
];

interface TechnologyInputProps {
  technologies: string[];
  onChange: (technologies: string[]) => void;
}

const TechnologyInput = ({ technologies, onChange }: TechnologyInputProps) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length > 0) {
      const filtered = COMMON_TECHNOLOGIES.filter(
        tech =>
          tech.toLowerCase().includes(input.toLowerCase()) &&
          !technologies.includes(tech)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, technologies]);

  const addTechnology = (tech: string) => {
    if (!technologies.includes(tech)) {
      onChange([...technologies, tech]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTechnology = (tech: string) => {
    onChange(technologies.filter(t => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTechnology(suggestions[0]);
      } else {
        addTechnology(input.trim());
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {technologies.map(tech => (
          <Badge key={tech} variant="secondary" className="gap-1">
            {tech}
            <X
              className="w-3 h-3 cursor-pointer hover:text-destructive"
              onClick={() => removeTechnology(tech)}
            />
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="أضف تقنية..."
          className="w-full"
        />
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map(tech => (
              <button
                key={tech}
                onClick={() => addTechnology(tech)}
                className="w-full text-right px-3 py-2 hover:bg-accent transition-smooth border-b border-border last:border-0"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnologyInput;
