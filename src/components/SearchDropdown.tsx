import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BarChart, Database, Layout } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

export function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useSearch(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleResultClick = (result: any) => {
    if (result.url) {
      navigate(result.url);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'widget':
        return <BarChart className="h-4 w-4" />;
      case 'dashboard':
        return <Layout className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-40 sm:w-64"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-3 border-b border-border last:border-b-0"
                >
                  <div className="text-muted-foreground">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-muted-foreground">{result.description}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}