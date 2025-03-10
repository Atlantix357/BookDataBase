import { Book, FilterPreset, ColumnPreset } from '../types/book';

// In-memory storage for books (in a real app, this would be a database)
let books: Book[] = [];
let filterPresets: FilterPreset[] = [];
let columnPresets: ColumnPreset[] = [];

// Get all books
export const getAllBooks = async (): Promise<Book[]> => {
  return [...books]; // Return a copy to prevent accidental mutations
};

// Get a book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  return books.find(book => book.id === id);
};

// Add a new book
export const addBook = async (book: Omit<Book, 'id' | 'dateAdded'>): Promise<Book> => {
  const newBook: Book = {
    ...book,
    id: Date.now().toString(), // Generate a unique ID
    dateAdded: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  };
  
  // Check if book with same title and author already exists
  const exists = books.some(b => 
    b.title.toLowerCase() === newBook.title.toLowerCase() && 
    b.author.toLowerCase() === newBook.author.toLowerCase()
  );
  
  if (!exists) {
    books.push(newBook);
  }
  
  return newBook;
};

// Update a book
export const updateBook = async (id: string, updates: Partial<Book>): Promise<Book | undefined> => {
  const index = books.findIndex(book => book.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...updates };
    return books[index];
  }
  return undefined;
};

// Delete a book
export const deleteBook = async (id: string): Promise<boolean> => {
  const index = books.findIndex(book => book.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    return true;
  }
  return false;
};

// Import books from CSV
export const importBooksFromCSV = async (csvData: string): Promise<Book[]> => {
  try {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const importedBooks: Book[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const book: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (value) {
          // Handle special fields
          if (header === 'favorite') {
            book[header] = value.toLowerCase() === 'true';
          } else if (header === 'rating') {
            book[header] = parseFloat(value);
          } else {
            book[header] = value;
          }
        }
      });
      
      // Ensure required fields
      if (book.title && book.author && book.readStatus) {
        book.id = book.id || Date.now().toString() + i;
        book.dateAdded = book.dateAdded || new Date().toISOString().split('T')[0];
        book.favorite = book.favorite || false;
        
        // Check if book already exists
        const exists = books.some(existingBook => 
          existingBook.title.toLowerCase() === book.title.toLowerCase() && 
          existingBook.author.toLowerCase() === book.author.toLowerCase()
        );
        
        if (!exists) {
          importedBooks.push(book as Book);
          books.push(book as Book);
        }
      }
    }
    
    return importedBooks;
  } catch (error) {
    console.error('Error importing books from CSV:', error);
    throw new Error('Failed to import books from CSV');
  }
};

// Export books to CSV format
export const exportBooksToCSV = async (): Promise<string> => {
  try {
    const headers = [
      'id', 'title', 'author', 'cover', 'publisher', 'publishedDate', 
      'category', 'language', 'bookType', 'readStatus', 'dateRead', 
      'rating', 'favorite', 'notes', 'dateAdded'
    ];
    
    let csv = headers.join(',') + '\n';
    
    books.forEach(book => {
      const row = headers.map(header => {
        const value = (book as any)[header];
        
        if (value === undefined || value === null) {
          return '';
        }
        
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value;
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  } catch (error) {
    console.error('Error exporting books to CSV:', error);
    throw new Error('Failed to export books to CSV');
  }
};

// Filter Presets
export const getFilterPresets = async (): Promise<FilterPreset[]> => {
  return [...filterPresets]; // Return a copy to prevent accidental mutations
};

export const saveFilterPreset = async (preset: Omit<FilterPreset, 'id'>): Promise<FilterPreset> => {
  const newPreset: FilterPreset = {
    ...preset,
    id: Date.now().toString(),
  };
  
  // Check if preset with same name already exists
  const exists = filterPresets.some(p => 
    p.name.toLowerCase() === newPreset.name.toLowerCase()
  );
  
  if (!exists) {
    filterPresets.push(newPreset);
  }
  
  return newPreset;
};

export const deleteFilterPreset = async (id: string): Promise<boolean> => {
  const index = filterPresets.findIndex(preset => preset.id === id);
  if (index !== -1) {
    filterPresets.splice(index, 1);
    return true;
  }
  return false;
};

// Column Presets
export const getColumnPresets = async (): Promise<ColumnPreset[]> => {
  return [...columnPresets]; // Return a copy to prevent accidental mutations
};

export const saveColumnPreset = async (preset: Omit<ColumnPreset, 'id'>): Promise<ColumnPreset> => {
  const newPreset: ColumnPreset = {
    ...preset,
    id: Date.now().toString(),
  };
  
  // Check if preset with same name already exists
  const exists = columnPresets.some(p => 
    p.name.toLowerCase() === newPreset.name.toLowerCase()
  );
  
  if (!exists) {
    columnPresets.push(newPreset);
  }
  
  return newPreset;
};

export const deleteColumnPreset = async (id: string): Promise<boolean> => {
  const index = columnPresets.findIndex(preset => preset.id === id);
  if (index !== -1) {
    columnPresets.splice(index, 1);
    return true;
  }
  return false;
};

// Backup settings
interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  oneDrivePath: string;
  lastBackup?: string;
}

let backupSettings: BackupSettings = {
  enabled: false,
  frequency: 'weekly',
  oneDrivePath: '',
};

export const getBackupSettings = async (): Promise<BackupSettings> => {
  return backupSettings;
};

export const saveBackupSettings = async (settings: BackupSettings): Promise<BackupSettings> => {
  backupSettings = settings;
  return backupSettings;
};

export const performBackup = async (): Promise<boolean> => {
  try {
    // In a real app, this would create a backup file and save it to the OneDrive path
    backupSettings.lastBackup = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('Error performing backup:', error);
    return false;
  }
};
