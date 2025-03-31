"use client";
import React, { useState } from 'react';

interface SearchComponentProps {
  onSearch: (searchTerm: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className='bg-surface border border-border p-3 rounded-lg my-4'>
      <div className="flex items-center gap-2">
        <input
          className='flex-grow bg-inherit text-primary-text placeholder:text-secondary-text focus:outline-none'
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for players..."
        />
        <button 
          onClick={handleSearch}
          className="px-4 py-1 bg-accent text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchComponent;