import { useEffect, useState } from 'react'
import { getAllBooks, exportBooksToCSV, getFilterPresets, getColumnPresets } from '../api/books'
import { Book, FilterPreset, ColumnPreset } from '../types/book'
import { formatDate, exportToCSV } from '../lib/utils'
import { Button } from '../components/ui/button'
import { AddBookDialog } from '../components/add-book-dialog'
import { EditBookDialog } from '../components/edit-book-dialog'
import { CSVImportDialog } from '../components/csv-import-dialog'
import { FilterPresetDialog } from '../components/filter-preset-dialog'
import { ColumnPresetDialog } from '../components/column-preset-dialog'
import { Download, Filter, Plus, Upload, Save, Trash2, Edit, Star, FileText, X } from 'lucide-react'

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [filterPresetDialogOpen, setFilterPresetDialogOpen] = useState(false)
  const [columnPresetDialogOpen, setColumnPresetDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<{title: string, notes: string} | null>(null)
  
  // Filters
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    publisher: '',
    category: '',
    language: '',
    readStatus: '',
    bookType: '',
    favorite: false
  })
  
  const [activeFilters, setActiveFilters] = useState({
    title: true,
    author: true,
    publisher: true,
    category: true,
    language: true,
    readStatus: true,
    bookType: true,
    favorite: true
  })
  
  // Columns
  const [visibleColumns, setVisibleColumns] = useState({
    cover: true,
    title: true,
    author: true,
    publisher: true,
    publishedDate: true,
    category: true,
    language: true,
    bookType: true,
    readStatus: true,
    dateRead: true,
    rating: true,
    favorite: true
  })
  
  // Presets
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([])
  const [columnPresets, setColumnPresets] = useState<ColumnPreset[]>([])
  
  // UI states
  const [showFilterSection, setShowFilterSection] = useState(false)
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  useEffect(() => {
    fetchBooks()
    fetchPresets()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [books, filters])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const data = await getAllBooks()
      setBooks(data)
      setFilteredBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchPresets = async () => {
    try {
      const filterPresetsData = await getFilterPresets()
      const columnPresetsData = await getColumnPresets()
      setFilterPresets(filterPresetsData)
      setColumnPresets(columnPresetsData)
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }

  const handleBookAdded = (book: Book) => {
    // Use a callback to ensure we're working with the latest state
    setBooks(prevBooks => {
      // Check if the book already exists to prevent duplicates
      const exists = prevBooks.some(b => b.id === book.id)
      if (exists) {
        return prevBooks
      }
      return [...prevBooks, book]
    })
  }
  
  const handleBookUpdated = (updatedBook: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(book => book.id === updatedBook.id ? updatedBook : book)
    )
  }
  
  const handleBookDeleted = (id: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== id))
  }

  const handleBooksImported = (importedBooks: Book[]) => {
    setBooks(prevBooks => {
      // Filter out any books that already exist in the current list
      const newBooks = importedBooks.filter(
        importedBook => !prevBooks.some(existingBook => existingBook.id === importedBook.id)
      )
      return [...prevBooks, ...newBooks]
    })
  }
  
  const handleFilterPresetSaved = (preset: FilterPreset) => {
    setFilterPresets(prevPresets => {
      // Check if preset with same name already exists
      const exists = prevPresets.some(p => p.name.toLowerCase() === preset.name.toLowerCase())
      if (exists) {
        return prevPresets
      }
      return [...prevPresets, preset]
    })
  }
  
  const handleColumnPresetSaved = (preset: ColumnPreset) => {
    setColumnPresets(prevPresets => {
      // Check if preset with same name already exists
      const exists = prevPresets.some(p => p.name.toLowerCase() === preset.name.toLowerCase())
      if (exists) {
        return prevPresets
      }
      return [...prevPresets, preset]
    })
  }
  
  const applyFilterPreset = (preset: FilterPreset) => {
    setActiveFilters(preset.filters)
  }
  
  const applyColumnPreset = (preset: ColumnPreset) => {
    setVisibleColumns(preset.columns)
  }
  
  const deleteFilterPreset = async (id: string) => {
    try {
      await import('../api/books').then(module => module.deleteFilterPreset(id))
      setFilterPresets(prev => prev.filter(preset => preset.id !== id))
    } catch (error) {
      console.error('Error deleting filter preset:', error)
    }
  }
  
  const deleteColumnPreset = async (id: string) => {
    try {
      await import('../api/books').then(module => module.deleteColumnPreset(id))
      setColumnPresets(prev => prev.filter(preset => preset.id !== id))
    } catch (error) {
      console.error('Error deleting column preset:', error)
    }
  }

  const handleExportCSV = async () => {
    try {
      const csvData = await exportBooksToCSV()
      exportToCSV(books, 'book-database-export.csv')
    } catch (error) {
      console.error('Error exporting books:', error)
      alert('Failed to export books. Please try again.')
    }
  }

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFilters(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }))
  }
  
  const applyFilters = () => {
    let result = [...books]
    
    // Apply text filters
    if (filters.title && activeFilters.title) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(filters.title.toLowerCase())
      )
    }
    
    if (filters.author && activeFilters.author) {
      result = result.filter(book => 
        book.author.toLowerCase().includes(filters.author.toLowerCase())
      )
    }
    
    if (filters.publisher && activeFilters.publisher) {
      result = result.filter(book => 
        book.publisher?.toLowerCase().includes(filters.publisher.toLowerCase())
      )
    }
    
    // Apply select filters
    if (filters.category && activeFilters.category) {
      result = result.filter(book => book.category === filters.category)
    }
    
    if (filters.language && activeFilters.language) {
      result = result.filter(book => book.language === filters.language)
    }
    
    if (filters.readStatus && activeFilters.readStatus) {
      result = result.filter(book => book.readStatus === filters.readStatus)
    }
    
    if (filters.bookType && activeFilters.bookType) {
      result = result.filter(book => book.bookType === filters.bookType)
    }
    
    // Apply checkbox filters
    if (filters.favorite && activeFilters.favorite) {
      result = result.filter(book => book.favorite)
    }
    
    setFilteredBooks(result)
  }
  
  const clearFilters = () => {
    setFilters({
      title: '',
      author: '',
      publisher: '',
      category: '',
      language: '',
      readStatus: '',
      bookType: '',
      favorite: false
    })
  }
  
  const handleEditBook = (book: Book) => {
    setSelectedBook(book)
    setEditDialogOpen(true)
  }

  const handleViewNotes = (book: Book) => {
    if (book.notes) {
      setSelectedNotes({
        title: book.title,
        notes: book.notes
      })
      setNotesDialogOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading books...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Book List</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilterSection(!showFilterSection)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowColumnSelector(!showColumnSelector)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Columns
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>
      </div>

      {showFilterSection && (
        <div className="p-4 border rounded-lg bg-background glass-effect">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Filters</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterPresetDialogOpen(true)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save Preset
              </Button>
            </div>
          </div>
          
          {filterPresets.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium">Saved Presets</h4>
              <div className="flex flex-wrap gap-2">
                {filterPresets.map(preset => (
                  <div key={preset.id} className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md">
                    <button 
                      onClick={() => applyFilterPreset(preset)}
                      className="font-medium"
                    >
                      {preset.name}
                    </button>
                    <button 
                      onClick={() => deleteFilterPreset(preset.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <h4 className="mb-2 text-xs font-medium">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, isActive]) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key as keyof typeof activeFilters)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeFilters.title && (
              <div>
                <label className="block mb-1 text-xs font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  placeholder="Filter by title..."
                  className="w-full p-2 text-sm border rounded"
                />
              </div>
            )}
            
            {activeFilters.author && (
              <div>
                <label className="block mb-1 text-xs font-medium">Author</label>
                <input
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  placeholder="Filter by author..."
                  className="w-full p-2 text-sm border rounded"
                />
              </div>
            )}
            
            {activeFilters.publisher && (
              <div>
                <label className="block mb-1 text-xs font-medium">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={filters.publisher}
                  onChange={handleFilterChange}
                  placeholder="Filter by publisher..."
                  className="w-full p-2 text-sm border rounded"
                />
              </div>
            )}
            
            {activeFilters.category && (
              <div>
                <label className="block mb-1 text-xs font-medium">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="">All Categories</option>
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                </select>
              </div>
            )}
            
            {activeFilters.language && (
              <div>
                <label className="block mb-1 text-xs font-medium">Language</label>
                <select
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="">All Languages</option>
                  <option value="en">English 🇬🇧</option>
                  <option value="ua">Ukrainian 🇺🇦</option>
                </select>
              </div>
            )}
            
            {activeFilters.readStatus && (
              <div>
                <label className="block mb-1 text-xs font-medium">Read Status</label>
                <select
                  name="readStatus"
                  value={filters.readStatus}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="">All Statuses</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                  <option value="dnf">Did Not Finish</option>
                </select>
              </div>
            )}
            
            {activeFilters.bookType && (
              <div>
                <label className="block mb-1 text-xs font-medium">Book Type</label>
                <select
                  name="bookType"
                  value={filters.bookType}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="">All Types</option>
                  <option value="paper">Paper</option>
                  <option value="ebook">E-Book</option>
                  <option value="audiobook">Audiobook</option>
                </select>
              </div>
            )}
            
            {activeFilters.favorite && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorite-filter"
                  name="favorite"
                  checked={filters.favorite}
                  onChange={handleFilterChange}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="favorite-filter" className="text-xs font-medium">
                  Favorites Only
                </label>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </div>
      )}

      {showColumnSelector && (
        <div className="p-4 border rounded-lg bg-background glass-effect">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Customize Columns</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setColumnPresetDialogOpen(true)}
            >
              <Save className="w-3 h-3 mr-1" />
              Save Preset
            </Button>
          </div>
          
          {columnPresets.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium">Saved Presets</h4>
              <div className="flex flex-wrap gap-2">
                {columnPresets.map(preset => (
                  <div key={preset.id} className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md">
                    <button 
                      onClick={() => applyColumnPreset(preset)}
                      className="font-medium"
                    >
                      {preset.name}
                    </button>
                    <button 
                      onClick={() => deleteColumnPreset(preset.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Object.entries(visibleColumns).map(([column, isVisible]) => (
              <label key={column} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                  className="w-4 h-4"
                />
                <span className="text-sm capitalize">{column.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

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
          <p className="mb-4 text-lg">No books match your filters</p>
          <Button onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg glass-effect">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {visibleColumns.cover && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Cover
                  </th>
                )}
                {visibleColumns.title && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Title
                  </th>
                )}
                {visibleColumns.author && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Author
                  </th>
                )}
                {visibleColumns.publisher && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Publisher
                  </th>
                )}
                {visibleColumns.publishedDate && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Published
                  </th>
                )}
                {visibleColumns.category && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Category
                  </th>
                )}
                {visibleColumns.language && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Language
                  </th>
                )}
                {visibleColumns.bookType && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Type
                  </th>
                )}
                {visibleColumns.readStatus && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                )}
                {visibleColumns.dateRead && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Date Read
                  </th>
                )}
                {visibleColumns.rating && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Rating
                  </th>
                )}
                {visibleColumns.favorite && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Favorite
                  </th>
                )}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {visibleColumns.cover && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.cover ? (
                        <div className="flex-shrink-0 w-10 h-14">
                          <img className="object-cover w-10 h-14 rounded" src={book.cover} alt={`${book.title} cover`} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-14 bg-gray-200 rounded dark:bg-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">No Cover</span>
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.title && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{book.title}</div>
                    </td>
                  )}
                  {visibleColumns.author && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{book.author}</div>
                    </td>
                  )}
                  {visibleColumns.publisher && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{book.publisher || '-'}</div>
                    </td>
                  )}
                  {visibleColumns.publishedDate && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{book.publishedDate ? formatDate(book.publishedDate, { year: 'numeric' }) : '-'}</div>
                    </td>
                  )}
                  {visibleColumns.category && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.category === 'fiction' ? 'Fiction' : 
                         book.category === 'non-fiction' ? 'Non-Fiction' : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.language && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.language === 'en' ? '🇬🇧 English' : 
                         book.language === 'ua' ? '🇺🇦 Ukrainian' : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.bookType && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.bookType === 'paper' ? 'Paper' : 
                         book.bookType === 'ebook' ? 'E-Book' : 
                         book.bookType === 'audiobook' ? 'Audiobook' : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.readStatus && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.readStatus === 'read' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        book.readStatus === 'unread' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {book.readStatus === 'read' ? 'Read' :
                         book.readStatus === 'unread' ? 'Unread' : 'DNF'}
                      </span>
                    </td>
                  )}
                  {visibleColumns.dateRead && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{book.dateRead ? formatDate(book.dateRead, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</div>
                    </td>
                  )}
                  {visibleColumns.rating && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.rating ? (
                          <div className="flex text-yellow-500">
                            {Array.from({ length: book.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        ) : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.favorite && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.favorite ? (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ) : '-'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {book.notes && (
                        <button 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleViewNotes(book)}
                          title="View Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={() => handleEditBook(book)}
                        title="Edit Book"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      <CSVImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onBooksImported={handleBooksImported}
      />
      
      <FilterPresetDialog
        isOpen={filterPresetDialogOpen}
        onClose={() => setFilterPresetDialogOpen(false)}
        onPresetSaved={handleFilterPresetSaved}
        currentFilters={activeFilters}
      />
      
      <ColumnPresetDialog
        isOpen={columnPresetDialogOpen}
        onClose={() => setColumnPresetDialogOpen(false)}
        onPresetSaved={handleColumnPresetSaved}
        currentColumns={visibleColumns}
      />

      {/* Notes Dialog */}
      {notesDialogOpen && selectedNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800 glass-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{selectedNotes.title} - Notes</h3>
              <button 
                onClick={() => {
                  setNotesDialogOpen(false)
                  setSelectedNotes(null)
                }}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto border rounded-md max-h-96 dark:border-gray-700">
              <p className="whitespace-pre-wrap">{selectedNotes.notes}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => {
                  setNotesDialogOpen(false)
                  setSelectedNotes(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
