import { Book, FilterPreset, ColumnPreset } from '../types/book';

// API base URL
const API_BASE_URL = 'http://192.168.50.25:3001';

// Get all books
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

// Get a book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    return undefined;
  }
};

// Add a new book
export const addBook = async (bookData: FormData): Promise<Book> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      body: bookData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to add book');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

// Update a book
export const updateBook = async (id: string, bookData: FormData): Promise<Book> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PATCH',
      body: bookData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update book');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating book ${id}:`, error);
    throw error;
  }
};

// Delete a book
export const deleteBook = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error deleting book ${id}:`, error);
    return false;
  }
};

// Export books to CSV
export const exportBooksToCSV = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/export`);
    
    if (!response.ok) {
      throw new Error('Failed to export books');
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error exporting books to CSV:', error);
    throw error;
  }
};

// Import books from CSV
export const importBooksFromCSV = async (csvContent: string): Promise<Book[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: csvContent,
    });
    
    if (!response.ok) {
      throw new Error('Failed to import books from CSV');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing books from CSV:', error);
    throw error;
  }
};

// Filter Presets
export const getFilterPresets = async (): Promise<FilterPreset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter-presets`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch filter presets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching filter presets:', error);
    return [];
  }
};

export const saveFilterPreset = async (preset: Omit<FilterPreset, 'id'>): Promise<FilterPreset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preset),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save filter preset');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving filter preset:', error);
    throw error;
  }
};

export const deleteFilterPreset = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter-presets/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error deleting filter preset ${id}:`, error);
    return false;
  }
};

// Column Presets
export const getColumnPresets = async (): Promise<ColumnPreset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/column-presets`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch column presets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching column presets:', error);
    return [];
  }
};

export const saveColumnPreset = async (preset: Omit<ColumnPreset, 'id'>): Promise<ColumnPreset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/column-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preset),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save column preset');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving column preset:', error);
    throw error;
  }
};

export const deleteColumnPreset = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/column-presets/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error deleting column preset ${id}:`, error);
    return false;
  }
};

// Backup settings
interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  oneDrivePath: string;
  lastBackup?: string;
}

export const getBackupSettings = async (): Promise<BackupSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/backup-settings`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch backup settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching backup settings:', error);
    return {
      enabled: false,
      frequency: 'weekly',
      oneDrivePath: '',
    };
  }
};

export const saveBackupSettings = async (settings: BackupSettings): Promise<BackupSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/backup-settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save backup settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving backup settings:', error);
    throw error;
  }
};

export const performBackup = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/backup`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to perform backup');
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error performing backup:', error);
    return false;
  }
};

// Server configuration
interface ServerConfig {
  host: string;
  port: number;
}

export const getServerConfig = async (): Promise<ServerConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/server-config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch server configuration');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching server configuration:', error);
    return {
      host: '192.168.50.25',
      port: 3001,
    };
  }
};

export const saveServerConfig = async (config: ServerConfig): Promise<ServerConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/server-config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save server configuration');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving server configuration:', error);
    throw error;
  }
};
