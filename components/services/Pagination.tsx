// components/services/Pagination.tsx
// components/Pagination.tsx
import React from 'react';

type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;
  
  // Generisanje niza stranica za prikaz
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Ako ima manje stranica nego što želimo prikazati
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Uvek prikazujemo prvu i poslednju stranicu
      // Plus trenutnu stranicu i jednu pre i posle nje
      
      if (currentPage <= 3) {
        // Ako smo na početku
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(null); // Oznaka za "..."
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Ako smo na kraju
        pages.push(1);
        pages.push(null); // Oznaka za "..."
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ako smo negde u sredini
        pages.push(1);
        pages.push(null); // Oznaka za "..."
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(null); // Oznaka za "..."
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="flex items-center justify-center mt-8">
      <nav className="flex space-x-1" aria-label="Pagination">
        {/* Dugme za prethodnu stranicu */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          &laquo; Prethodna
        </button>
        
        {/* Brojevi stranica */}
        {getPageNumbers().map((page, index) => (
          page === null ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        {/* Dugme za sledeću stranicu */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md ${
            currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Sledeća &raquo;
        </button>
      </nav>
    </div>
  );
}