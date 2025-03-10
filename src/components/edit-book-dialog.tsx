import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { updateBook, deleteBook } from '../api/books'
import { Book } from '../types/book'
import { X, Trash2 } from 'lucide-react'

interface EditBookDialogProps {
  isOpen: boolean
  onClose: () => void
  onBookUpdated: (book: Book) => void
  onBookDeleted: (id: string) => void
  book: Book
}

export function EditBookDialog({ isOpen, onClose, onBookUpdated, onBookDeleted, book }: EditBookDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    publishedYear: '',
    category: '',
    language: '',
    bookType: '',
    readStatus: '',
    dateRead: '',
    rating: '',
    favorite: false,
    notes: '',
    cover: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        publishedYear: book.publishedDate || '',
        category: book.category || '',
        language: book.language || '',
        bookType: book.bookType || '',
        readStatus: book.readStatus || 'unread',
        dateRead: book.dateRead || '',
        rating: book.rating ? book.rating.toString() : '',
        favorite: book.favorite || false,
        notes: book.notes || '',
        cover: book.cover || ''
      })
      
      if (book.cover) {
        setCoverPreview(book.cover)
      }
    }
  }, [book])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCoverPreview(result)
        setFormData(prev => ({ ...prev, cover: result }))
      }
      
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Process form data
      const bookData: Partial<Book> = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher || undefined,
        publishedDate: formData.publishedYear || undefined,
        category: formData.category as any || undefined,
        language: formData.language as any || undefined,
        bookType: formData.bookType as any || undefined,
        readStatus: formData.readStatus as any,
        dateRead: formData.dateRead || undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        favorite: formData.favorite,
        notes: formData.notes || undefined,
        cover: formData.cover || undefined
      }
      
      const updatedBook = await updateBook(book.id, bookData)
      if (updatedBook) {
        onBookUpdated(updatedBook)
        onClose()
      } else {
        setError('Failed to update book. Book not found.')
      }
    } catch (err) {
      setError('Failed to update book. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    
    setLoading(true)
    try {
      const success = await deleteBook(book.id)
      if (success) {
        onBookDeleted(book.id)
        onClose()
      } else {
        setError('Failed to delete book. Book not found.')
      }
    } catch (err) {
      setError('Failed to delete book. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setDeleteConfirm(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
      <div className="w-full max-w-md h-full p-6 bg-white shadow-xl dark:bg-gray-800 overflow-y-auto glass-effect">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Book</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            {coverPreview && (
              <div className="mt-2">
                <img src={coverPreview} alt="Cover preview" className="object-cover w-32 h-48 rounded" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Published Year
            </label>
            <input
              type="number"
              name="publishedYear"
              value={formData.publishedYear}
              onChange={handleChange}
              min="1000"
              max={new Date().getFullYear()}
              placeholder="e.g. 2023"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Category</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Language</option>
              <option value="en">English 🇬🇧</option>
              <option value="ua">Ukrainian 🇺🇦</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Book Type
            </label>
            <select
              name="bookType"
              value={formData.bookType}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Book Type</option>
              <option value="paper">Paper</option>
              <option value="ebook">E-Book</option>
              <option value="audiobook">Audiobook</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Read Status <span className="text-red-500">*</span>
            </label>
            <select
              name="readStatus"
              value={formData.readStatus}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="dnf">Did Not Finish</option>
            </select>
          </div>
          
          {formData.readStatus === 'read' && (
            <div>
              <label className="block mb-1 text-sm font-medium">
                Date Read
              </label>
              <input
                type="date"
                name="dateRead"
                value={formData.dateRead}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Rating (1-5)
            </label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Rating</option>
              <option value="1">1 ★</option>
              <option value="2">2 ★★</option>
              <option value="3">3 ★★★</option>
              <option value="4">4 ★★★★</option>
              <option value="5">5 ★★★★★</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="favorite"
              name="favorite"
              checked={formData.favorite}
              onChange={handleChange}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="favorite" className="text-sm font-medium">
              Mark as Favorite
            </label>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            ></textarea>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete'}
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
