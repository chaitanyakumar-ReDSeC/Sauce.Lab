import React from 'react';
import { RefreshCw, Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReload: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onReload,
  isLoading
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-[#1E1E24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 select-none">
            <img src="https://github.com/chaitanyakumar-ReDSeC/asset-vault/raw/main/repositories/Sauce.Lab/imgs/Sauce.Lab.png" alt="Sauce Lab Logo" className="w-10 h-10" />
            <div>
              <span className="font-heading font-extrabold text-2xl tracking-wider text-white">
                SAUCE <span className="text-[#C20000]">LAB</span>
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search recipes or ingredients..."
                className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-[#27272A] rounded-lg text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#C20000] focus:ring-1 focus:ring-[#C20000] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action: Reload */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReload}
              disabled={isLoading}
              className="p-2 text-[#A1A1AA] hover:text-white bg-[#121216] hover:bg-[#1C1C22] border border-[#27272F] rounded-lg transition-colors disabled:opacity-50"
              title="Refresh recipes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C20000]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-[#27272A] rounded-lg text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#C20000]"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
