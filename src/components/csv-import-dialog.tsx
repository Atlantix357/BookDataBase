import { useState } from 'react'
import { Button } from './ui/button'
import { importBooksFromCSV } from '../api/books'
import { Book } from '../types/book'
import { X, Upload } from 'lucide-react'

interface CSVImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onBooksImported: (books: Book[]) => void
}

export function CSVImportDialog({ isOpen, onClose, onBooksImported }: CSVImportDialogProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string[][]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setCsvFile(file)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCsvContent(content)
        
        // Generate preview
        const lines = content.split('\n').slice(0, 6) // Header + 5 rows
        const previewData = lines.map(line => line.split(','))
        setPreview(previewData)
      }
      
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!csvContent) {
      setError('Please select a CSV file first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const importedBooks = await importBooksFromCSV(csvContent)
      onBooksImported(importedBooks)
      onClose()
    } catch (err) {
      setError('Failed to import CSV. Please check the file format and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 glass-effect">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Import Books from CSV</h2>
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
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The CSV file should have headers matching the book fields (title, author, etc.)
            </p>
          </div>
          
          {preview.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Preview</h3>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {preview[0].map((header, index) => (
                        <th 
                          key={index}
                          className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {preview.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-3 py-2 text-xs whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Showing first 5 rows of data
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={loading || !csvContent}
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Importing...' : 'Import Books'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
