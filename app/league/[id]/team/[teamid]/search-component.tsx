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
    <div className='bg-gray-800 text-white p-2 rounded-md my-4'>
      <input
        className='bg-inherit'
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter search term"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchComponent;