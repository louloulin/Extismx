import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function Search({ onSearch, className, ...props }: SearchProps) {
  const [value, setValue] = React.useState('');

  const handleSearch = React.useCallback(() => {
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch, value]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="relative flex w-full max-w-md items-center">
      <Input
        type="text"
        placeholder="Search packages..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pr-10"
        {...props}
      />
      <Button 
        type="button" 
        variant="ghost" 
        size="icon"
        onClick={handleSearch} 
        className="absolute right-0 top-0 h-full"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
} 