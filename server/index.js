import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { stringify } from 'csv-stringify/sync'
import cron from 'node-cron'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, 'backups')
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true })
}

// Initialize data files if they don't exist
const booksFile = path.join(dataDir, 'books.json')
if (!fs.existsSync(booksFile)) {
  fs.writeFileSync(booksFile, JSON.stringify([]))
}

const filterPresetsFile = path.join(dataDir, 'filter-presets.json')
if (!fs.existsSync(filterPresetsFile)) {
  fs.writeFileSync(filterPresetsFile, JSON.stringify([]))
}

const columnPresetsFile = path.join(dataDir, 'column-presets.json')
if (!fs.existsSync(columnPresetsFile)) {
  fs.writeFileSync(columnPresetsFile, JSON.stringify([]))
}

const backupSettingsFile = path.join(dataDir, 'backup-settings.json')
if (!fs.existsSync(backupSettingsFile)) {
  fs.writeFileSync(backupSettingsFile, JSON.stringify({
    frequency: 'daily',
    path: '',
    enabled: true,
    lastBackup: null
  }))
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'cover-' + uniqueSuffix + ext)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

// Helper functions
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error)
    return false
  }
}

function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    const backupFile = path.join(backupsDir, `bookshelf-backup-${timestamp}.json`)
    
    // Read all data
    const books = readJsonFile(booksFile)
    const filterPresets = readJsonFile(filterPresetsFile)
    const columnPresets = readJsonFile(columnPresetsFile)
    
    // Create backup object
    const backupData = {
      books,
      filterPresets,
      columnPresets,
      timestamp
    }
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
    
    // Update last backup timestamp
    const backupSettings = readJsonFile(backupSettingsFile)
    backupSettings.lastBackup = new Date().toISOString()
    writeJsonFile(backupSettingsFile, backupSettings)
    
    console.log(`Backup created: ${backupFile}`)
    
    // Copy to OneDrive path if configured
    if (backupSettings.path) {
      // In a real implementation, this would copy the file to the OneDrive path
      console.log(`Would copy backup to OneDrive path: ${backupSettings.path}`)
    }
    
    return true
  } catch (error) {
    console.error('Error creating backup:', error)
    return false
  }
}

// Set up cron jobs for backups
function setupBackupCron() {
  const backupSettings = readJsonFile(backupSettingsFile)
  
  if (!backupSettings.enabled) {
    console.log('Automatic backups are disabled')
    return
  }
  
  let cronSchedule
  
  switch (backupSettings.frequency) {
    case 'daily':
      cronSchedule = '0 0 * * *' // Every day at midnight
      break
    case 'weekly':
      cronSchedule = '0 0 * * 0' // Every Sunday at midnight
      break
    case 'monthly':
      cronSchedule = '0 0 1 * *' // First day of each month at midnight
      break
    default:
      cronSchedule = '0 0 * * *' // Default to daily
  }
  
  cron.schedule(cronSchedule, () => {
    console.log('Running scheduled backup...')
    createBackup()
  })
  
  console.log(`Backup schedule set to: ${backupSettings.frequency} (${cronSchedule})`)
}

// API Routes
// Get all books with optional filtering
app.get('/books', (req, res) => {
  try {
    let books = readJsonFile(booksFile)
    
    // Apply filters if provided
    if (Object.keys(req.query).length > 0) {
      books = books.filter(book => {
        for (const [key, value] of Object.entries(req.query)) {
          if (key === 'favorite') {
            // Handle boolean conversion
            const boolValue = value === 'true'
            if (book[key] !== boolValue) return false
          } else if (key === 'rating') {
            // Handle number conversion
            const numValue = parseInt(value)
            if (book[key] !== numValue) return false
          } else {
            // Case-insensitive string search
            if (typeof book[key] === 'string' && typeof value === 'string') {
              if (!book[key].toLowerCase().includes(value.toLowerCase())) return false
            } else if (book[key] !== value) {
              return false
            }
          }
        }
        return true
      })
    }
    
    res.json(books)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve books' })
  }
})

// Get a single book by ID
app.get('/books/:id', (req, res) => {
  try {
    const books = readJsonFile(booksFile)
    const book = books.find(b => b.id === parseInt(req.params.id))
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    res.json(book)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve book' })
  }
})

// Create a new book
app.post('/books', upload.single('cover'), (req, res) => {
  try {
    const books = readJsonFile(booksFile)
    
    // Generate new ID
    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1
    
    // Create new book object
    const newBook = {
      id: newId,
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher || '',
      published: req.body.published || '',
      category: req.body.category || 'fiction',
      language: req.body.language || 'en',
      bookType: req.body.bookType || 'paper',
      status: req.body.status || 'unread',
      dateRead: req.body.dateRead || null,
      rating: req.body.rating ? parseInt(req.body.rating) : null,
      favorite: req.body.favorite === 'true',
      cover: req.file ? `/uploads/${req.file.filename}` : '',
      comments: req.body.comments || ''
    }
    
    books.push(newBook)
    writeJsonFile(booksFile, books)
    
    res.status(201).json(newBook)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book' })
  }
})

// Update a book
app.patch('/books/:id', upload.single('cover'), (req, res) => {
  try {
    const books = readJsonFile(booksFile)
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id))
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    const updatedBook = { ...books[bookIndex] }
    
    // Update fields if provided
    if (req.body.title) updatedBook.title = req.body.title
    if (req.body.author) updatedBook.author = req.body.author
    if ('publisher' in req.body) updatedBook.publisher = req.body.publisher
    if ('published' in req.body) updatedBook.published = req.body.published
    if (req.body.category) updatedBook.category = req.body.category
    if (req.body.language) updatedBook.language = req.body.language
    if (req.body.bookType) updatedBook.bookType = req.body.bookType
    if (req.body.status) updatedBook.status = req.body.status
    if ('dateRead' in req.body) updatedBook.dateRead = req.body.dateRead
    if ('rating' in req.body) updatedBook.rating = req.body.rating ? parseInt(req.body.rating) : null
    if ('favorite' in req.body) updatedBook.favorite = req.body.favorite === 'true'
    if ('comments' in req.body) updatedBook.comments = req.body.comments
    
    // Update cover if provided
    if (req.file) {
      // Delete old cover file if it exists
      if (updatedBook.cover && fs.existsSync(path.join(__dirname, '..', updatedBook.cover))) {
        fs.unlinkSync(path.join(__dirname, '..', updatedBook.cover))
      }
      
      updatedBook.cover = `/uploads/${req.file.filename}`
    }
    
    books[bookIndex] = updatedBook
    writeJsonFile(booksFile, books)
    
    res.json(updatedBook)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' })
  }
})

// Delete a book
app.delete('/books/:id', (req, res) => {
  try {
    const books = readJsonFile(booksFile)
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id))
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    // Delete cover file if it exists
    const book = books[bookIndex]
    if (book.cover && fs.existsSync(path.join(__dirname, '..', book.cover))) {
      fs.unlinkSync(path.join(__dirname, '..', book.cover))
    }
    
    books.splice(bookIndex, 1)
    writeJsonFile(booksFile, books)
    
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

// Export books to CSV
app.get('/export', (req, res) => {
  try {
    const books = readJsonFile(booksFile)
    
    // Convert books to CSV
    const csv = stringify(books, {
      header: true,
      columns: [
        'id', 'title', 'author', 'publisher', 'published', 'category', 
        'language', 'bookType', 'status', 'dateRead', 'rating', 'favorite', 'comments'
      ]
    })
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="bookshelf-export-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: 'Failed to export books' })
  }
})

// Filter presets routes
app.get('/filter-presets', (req, res) => {
  try {
    const presets = readJsonFile(filterPresetsFile)
    res.json(presets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve filter presets' })
  }
})

app.post('/filter-presets', (req, res) => {
  try {
    const presets = readJsonFile(filterPresetsFile)
    
    const newPreset = {
      id: Date.now().toString(),
      name: req.body.name,
      filters: req.body.filters
    }
    
    presets.push(newPreset)
    writeJsonFile(filterPresetsFile, presets)
    
    res.status(201).json(newPreset)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create filter preset' })
  }
})

app.delete('/filter-presets/:id', (req, res) => {
  try {
    const presets = readJsonFile(filterPresetsFile)
    const presetIndex = presets.findIndex(p => p.id === req.params.id)
    
    if (presetIndex === -1) {
      return res.status(404).json({ error: 'Preset not found' })
    }
    
    presets.splice(presetIndex, 1)
    writeJsonFile(filterPresetsFile, presets)
    
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete filter preset' })
  }
})

// Column presets routes
app.get('/column-presets', (req, res) => {
  try {
    const presets = readJsonFile(columnPresetsFile)
    res.json(presets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve column presets' })
  }
})

app.post('/column-presets', (req, res) => {
  try {
    const presets = readJsonFile(columnPresetsFile)
    
    const newPreset = {
      id: Date.now().toString(),
      name: req.body.name,
      columns: req.body.columns
    }
    
    presets.push(newPreset)
    writeJsonFile(columnPresetsFile, presets)
    
    res.status(201).json(newPreset)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create column preset' })
  }
})

app.delete('/column-presets/:id', (req, res) => {
  try {
    const presets = readJsonFile(columnPresetsFile)
    const presetIndex = presets.findIndex(p => p.id === req.params.id)
    
    if (presetIndex === -1) {
      return res.status(404).json({ error: 'Preset not found' })
    }
    
    presets.splice(presetIndex, 1)
    writeJsonFile(columnPresetsFile, presets)
    
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete column preset' })
  }
})

// Backup settings routes
app.get('/backup-settings', (req, res) => {
  try {
    const settings = readJsonFile(backupSettingsFile)
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve backup settings' })
  }
})

app.patch('/backup-settings', (req, res) => {
  try {
    const settings = readJsonFile(backupSettingsFile)
    
    // Update settings if provided
    if (req.body.frequency) settings.frequency = req.body.frequency
    if ('path' in req.body) settings.path = req.body.path
    if ('enabled' in req.body) settings.enabled = req.body.enabled
    
    writeJsonFile(backupSettingsFile, settings)
    
    // Reconfigure backup schedule
    setupBackupCron()
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update backup settings' })
  }
})

// Trigger manual backup
app.post('/backup', (req, res) => {
  try {
    const success = createBackup()
    
    if (success) {
      res.json({ success: true, message: 'Backup created successfully' })
    } else {
      res.status(500).json({ success: false, message: 'Failed to create backup' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create backup' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  setupBackupCron()
})
