export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  publisher?: string;
  publishedDate?: string;
  category?: 'fiction' | 'non-fiction';
  language?: 'en' | 'ua';
  bookType?: 'paper' | 'ebook' | 'audiobook';
  readStatus: 'read' | 'unread' | 'dnf';
  dateRead?: string;
  rating?: number;
  favorite: boolean;
  notes?: string;
  dateAdded: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    title: boolean;
    author: boolean;
    publisher: boolean;
    category: boolean;
    language: boolean;
    readStatus: boolean;
    bookType: boolean;
    favorite: boolean;
  };
}

export interface ColumnPreset {
  id: string;
  name: string;
  columns: {
    cover: boolean;
    title: boolean;
    author: boolean;
    publisher: boolean;
    publishedDate: boolean;
    category: boolean;
    language: boolean;
    bookType: boolean;
    readStatus: boolean;
    dateRead: boolean;
    rating: boolean;
    favorite: boolean;
  };
}
