"use client";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

interface SearchComponentProps {
  onSearch: (searchTerm: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className='bg-card border border-border p-3 rounded-lg my-4'>
      <div className="flex items-center gap-2">
        <Input
          className='flex-grow bg-inherit border-0 focus-visible:ring-0'
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for players..."
        />
        <Button onClick={handleSearch} size="sm">
          <Search size={16} />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchComponent;
