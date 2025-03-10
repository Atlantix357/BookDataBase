import { useState } from 'react'
import { Button } from './ui/button'
import { saveColumnPreset } from '../api/books'
import { ColumnPreset } from '../types/book'
import { X } from 'lucide-react'

interface ColumnPresetDialogProps {
  isOpen: boolean
  onClose: () => void
  onPresetSaved: (preset: ColumnPreset) => void
  currentColumns: {
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
  }
}

export function ColumnPresetDialog({ isOpen, onClose, onPresetSaved, currentColumns }: ColumnPresetDialogProps) {
  const [presetName, setPresetName] = useState('')
  const [columns, setColumns] = useState(currentColumns)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleColumn = (column: keyof typeof columns) => {
    setColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (isSubmitting) return
    
    if (!presetName.trim()) {
      setError('Please enter a preset name')
      return
    }
    
    setLoading(true)
    setError(null)
    setIsSubmitting(true)
    
    try {
      const newPreset = await saveColumnPreset({
        name: presetName,
        columns
      })
      
      // Reset form
      setPresetName('')
      setColumns(currentColumns)
      
      onPresetSaved(newPreset)
      onClose()
    } catch (err) {
      setError('Failed to save preset. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 glass-effect">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Save Column Preset</h2>
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
            <label className="block mb-2 text-sm font-medium">
              Preset Name
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="My Column Preset"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <h3 className="mb-2 text-sm font-medium">Select Columns to Display</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(columns).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleToggleColumn(key as keyof typeof columns)}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading || isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading ? 'Saving...' : 'Save Preset'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
