import { useEffect, useState, useRef } from 'react'
import { getAllBooks } from '../api/books'
import { Book } from '../types/book'
import { Button } from '../components/ui/button'
import { AddBookDialog } from '../components/add-book-dialog'
import { EditBookDialog } from '../components/edit-book-dialog'
import { Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react'

export function BookShelf() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const data = await getAllBooks()
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAdded = (book: Book) => {
    setBooks(prevBooks => [...prevBooks, book])
  }
  
  const handleBookUpdated = (updatedBook: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(book => book.id === updatedBook.id ? updatedBook : book)
    )
  }
  
  const handleBookDeleted = (id: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== id))
  }
  
  const handleEditBook = (book: Book) => {
    setSelectedBook(book)
    setEditDialogOpen(true)
  }
  
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Calculate book width based on title length with some randomness
  const calculateBookWidth = (title: string, bookId: string) => {
    // Use the book ID to generate a consistent random value
    const randomFactor = getConsistentRandomValue(bookId, 0.85, 1.15);
    
    // Base width for short titles - INCREASED from 40 to 60
    const baseWidth = 60;
    
    // Calculate additional width based on title length
    let width = baseWidth;
    if (title.length <= 15) {
      width = baseWidth; // Default width for short titles
    } else if (title.length <= 30) {
      width = baseWidth + 15; // Medium titles
    } else if (title.length <= 50) {
      width = baseWidth + 30; // Long titles
    } else {
      width = baseWidth + 45; // Very long titles
    }
    
    // Apply random factor to add natural variation
    return Math.round(width * randomFactor);
  }
  
  // Calculate book height with some randomness
  const calculateBookHeight = (bookId: string, shelfIndex: number) => {
    // Use the book ID to generate a consistent random value
    const randomFactor = getConsistentRandomValue(bookId, 0.9, 1.1);
    
    // Calculate height as percentage of shelf height, but ensure it doesn't exceed shelf height
    // For the top shelf, books can be up to 95% of shelf height
    // For middle and bottom shelves, books can be up to 90% of shelf height
    const maxHeightPercent = shelfIndex === 0 ? 95 : 90;
    
    return `${Math.min(Math.round(maxHeightPercent * randomFactor), maxHeightPercent)}%`;
  }
  
  // Generate a consistent random value based on book ID
  const getConsistentRandomValue = (bookId: string, min: number, max: number) => {
    // Use a simple hash of the book ID to generate a consistent value
    let hash = 0;
    for (let i = 0; i < bookId.length; i++) {
      hash = ((hash << 5) - hash) + bookId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Normalize to a value between 0 and 1
    const normalizedHash = (hash & 0xffff) / 0xffff;
    
    // Scale to the desired range
    return min + normalizedHash * (max - min);
  }
  
  // Generate a book color based on various factors
  const getBookColor = (book: Book) => {
    // Base colors for different categories
    const baseColors = {
      fiction: ['#4f46e5', '#6366f1', '#818cf8', '#3730a3', '#4338ca'],
      nonFiction: ['#f97316', '#fb923c', '#fdba74', '#c2410c', '#ea580c'],
      en: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1', '#0284c7'],
      ua: ['#eab308', '#facc15', '#fde047', '#ca8a04', '#a16207'],
      paper: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857'],
      ebook: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9', '#7c3aed'],
      audiobook: ['#ec4899', '#f472b6', '#f9a8d4', '#be185d', '#db2777'],
      favorite: ['#ef4444', '#f87171', '#fca5a5', '#b91c1c', '#dc2626']
    };
    
    // Choose a color palette based on book properties
    let colorPalette;
    if (book.favorite) {
      // 30% chance to use favorite color for favorite books
      if (getConsistentRandomValue(book.id, 0, 1) < 0.3) {
        colorPalette = baseColors.favorite;
      }
    }
    
    // If no color palette selected yet, choose based on other properties
    if (!colorPalette) {
      if (book.category === 'fiction') {
        colorPalette = baseColors.fiction;
      } else if (book.category === 'non-fiction') {
        colorPalette = baseColors.nonFiction;
      } else if (book.language === 'en') {
        colorPalette = baseColors.en;
      } else if (book.language === 'ua') {
        colorPalette = baseColors.ua;
      } else if (book.bookType === 'paper') {
        colorPalette = baseColors.paper;
      } else if (book.bookType === 'ebook') {
        colorPalette = baseColors.ebook;
      } else if (book.bookType === 'audiobook') {
        colorPalette = baseColors.audiobook;
      } else {
        // Fallback to a random palette
        const allPalettes = Object.values(baseColors);
        colorPalette = allPalettes[Math.floor(getConsistentRandomValue(book.id, 0, allPalettes.length))];
      }
    }
    
    // Select a specific color from the palette based on book ID
    const colorIndex = Math.floor(getConsistentRandomValue(book.id, 0, colorPalette.length));
    return colorPalette[colorIndex];
  }
  
  // Generate a book spine pattern
  const getBookPattern = (book: Book) => {
    const patterns = [
      '', // No pattern
      'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 100%)', // Vertical stripe
      'linear-gradient(0deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 100%)', // Horizontal stripe
      'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', // Radial
      'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)', // Diagonal
    ];
    
    // Use book ID to consistently select a pattern
    const patternIndex = Math.floor(getConsistentRandomValue(book.id + 'pattern', 0, patterns.length));
    return patterns[patternIndex];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading book shelf...</div>
      </div>
    )
  }

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(book => book.readStatus === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Book Shelf</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'read' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Read
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'unread' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Unread
            </button>
            <button 
              onClick={() => setFilter('dnf')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'dnf' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              DNF
            </button>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg glass-effect">
          <p className="mb-4 text-lg">Your book collection is empty</p>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Book
          </Button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg glass-effect">
          <p className="mb-4 text-lg">No books match the selected filter</p>
          <Button variant="outline" onClick={() => setFilter('all')}>
            Show All Books
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-0 z-10 flex items-center h-full">
            <button 
              onClick={scrollLeft}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg dark:bg-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div 
            ref={carouselRef}
            className="flex gap-4 p-6 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-4">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="flex flex-col w-40 transition-transform duration-200 bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:scale-105 glass-effect cursor-pointer"
                  onClick={() => handleEditBook(book)}
                >
                  <div className="relative pb-[150%]">
                    {book.cover ? (
                      <img 
                        src={book.cover} 
                        alt={`${book.title} cover`} 
                        className="absolute object-cover w-full h-full rounded-t-lg"
                      />
                    ) : (
                      <div className="absolute flex items-center justify-center w-full h-full text-center bg-gray-200 rounded-t-lg dark:bg-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">No Cover</span>
                      </div>
                    )}
                    {book.favorite && (
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center justify-center w-6 h-6 text-yellow-500 bg-white rounded-full dark:bg-gray-900">
                          <Star className="w-4 h-4 fill-current" />
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-gradient-to-t from-black to-transparent">
                      <span className={`inline-block px-2 py-0.5 rounded-full ${
                        book.readStatus === 'read' ? 'bg-green-500' :
                        book.readStatus === 'unread' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}>
                        {book.readStatus === 'read' ? 'Read' :
                         book.readStatus === 'unread' ? 'Unread' : 'DNF'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-3">
                    <h3 className="mb-1 text-sm font-medium line-clamp-2" title={book.title}>{book.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
                    {book.rating && (
                      <div className="mt-auto pt-2 text-xs text-yellow-500">
                        {'★'.repeat(book.rating)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute right-0 z-10 flex items-center h-full top-0">
            <button 
              onClick={scrollRight}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg dark:bg-gray-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      
      <div className="p-6 mt-8 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">Book Shelf View</h3>
        
        {/* Increased height from 400px to 500px */}
        <div className="relative h-[500px] bg-gradient-to-b from-amber-800 to-amber-950 rounded-lg p-4 overflow-hidden">
          {/* Shelf background with wood texture */}
          <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IGlkPSJwYXR0ZXJuLWJhY2tncm91bmQiIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJyZ2JhKDEzMywgNzcsIDM4LCAxKSI+PC9yZWN0PjxwYXRoIGZpbGw9InJnYmEoMTIyLCA2OCwgMzIsIDEpIiBkPSJNLTEwIC0xMGgyMHYyMGgtMjB6Ij48L3BhdGg+PHBhdGggZmlsbD0icmdiYSgxMjIsIDY4LCAzMiwgMSkiIGQ9Ik0zMCAzMGgyMHYyMGgtMjB6Ij48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIj48L3JlY3Q+PC9zdmc+')]"></div>
          
          {/* Shelves */}
          <div className="absolute left-0 right-0 h-2 bg-amber-950 shadow-md top-1/3"></div>
          <div className="absolute left-0 right-0 h-2 bg-amber-950 shadow-md top-2/3"></div>
          
          {/* Books on shelves */}
          {filteredBooks.length > 0 && (
            <>
              {/* Top shelf */}
              <div className="absolute top-0 left-0 right-0 flex gap-1 overflow-x-auto h-1/3 p-2">
                {filteredBooks.slice(0, Math.min(15, filteredBooks.length)).map((book) => (
                  <div 
                    key={`shelf1-${book.id}`} 
                    className="flex-shrink-0 cursor-pointer group relative"
                    onClick={() => handleEditBook(book)}
                    style={{ 
                      width: `${calculateBookWidth(book.title, book.id)}px`, 
                      height: calculateBookHeight(book.id, 0),
                      backgroundColor: getBookColor(book),
                      backgroundImage: getBookPattern(book),
                      borderRadius: '0 3px 3px 0',
                      position: 'relative',
                      boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                      // Position at the bottom of the shelf container
                      position: 'absolute',
                      bottom: '2px', // Align to the shelf
                      left: `${10 + 65 * Math.floor(getConsistentRandomValue(book.id, 0, 15))}px`,
                    }}
                  >
                    {book.favorite && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                    )}
                    <div 
                      className="absolute inset-0 flex items-center justify-center p-1"
                      style={{ 
                        transformOrigin: 'center center',
                        transform: 'rotate(90deg)',
                      }}
                    >
                      <div 
                        className="text-white font-bold text-center overflow-hidden"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.2',
                          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.5)',
                          maxHeight: '100%',
                          width: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {book.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Middle shelf */}
              <div className="absolute top-1/3 left-0 right-0 flex gap-1 overflow-x-auto h-1/3 p-2">
                {filteredBooks.slice(15, Math.min(30, filteredBooks.length)).map((book, index) => (
                  <div 
                    key={`shelf2-${book.id}`} 
                    className="flex-shrink-0 cursor-pointer group relative"
                    onClick={() => handleEditBook(book)}
                    style={{ 
                      width: `${calculateBookWidth(book.title, book.id)}px`, 
                      height: calculateBookHeight(book.id, 1),
                      backgroundColor: getBookColor(book),
                      backgroundImage: getBookPattern(book),
                      borderRadius: '0 3px 3px 0',
                      boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                      // Position at the bottom of the shelf container
                      position: 'absolute',
                      bottom: '2px', // Align to the shelf
                      left: `${10 + 65 * Math.floor(getConsistentRandomValue(book.id + 'pos', 0, 15))}px`,
                    }}
                  >
                    {book.favorite && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                    )}
                    <div 
                      className="absolute inset-0 flex items-center justify-center p-1"
                      style={{ 
                        transformOrigin: 'center center',
                        transform: 'rotate(90deg)',
                      }}
                    >
                      <div 
                        className="text-white font-bold text-center overflow-hidden"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.2',
                          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.5)',
                          maxHeight: '100%',
                          width: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {book.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom shelf */}
              <div className="absolute top-2/3 left-0 right-0 flex gap-1 overflow-x-auto h-1/3 p-2">
                {filteredBooks.slice(30, Math.min(45, filteredBooks.length)).map((book, index) => (
                  <div 
                    key={`shelf3-${book.id}`} 
                    className="flex-shrink-0 cursor-pointer group relative"
                    onClick={() => handleEditBook(book)}
                    style={{ 
                      width: `${calculateBookWidth(book.title, book.id)}px`, 
                      height: calculateBookHeight(book.id, 2),
                      backgroundColor: getBookColor(book),
                      backgroundImage: getBookPattern(book),
                      borderRadius: '0 3px 3px 0',
                      boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                      // Position at the bottom of the shelf container
                      position: 'absolute',
                      bottom: '2px', // Align to the shelf
                      left: `${10 + 65 * Math.floor(getConsistentRandomValue(book.id + 'shelf3', 0, 15))}px`,
                    }}
                  >
                    {book.favorite && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                    )}
                    <div 
                      className="absolute inset-0 flex items-center justify-center p-1"
                      style={{ 
                        transformOrigin: 'center center',
                        transform: 'rotate(90deg)',
                      }}
                    >
                      <div 
                        className="text-white font-bold text-center overflow-hidden"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.2',
                          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.5)',
                          maxHeight: '100%',
                          width: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {book.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AddBookDialog 
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onBookAdded={handleBookAdded}
      />
      
      {selectedBook && (
        <EditBookDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedBook(null)
          }}
          onBookUpdated={handleBookUpdated}
          onBookDeleted={handleBookDeleted}
          book={selectedBook}
        />
      )}
    </div>
  )
}
