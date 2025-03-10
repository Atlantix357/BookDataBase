import { useEffect, useState } from 'react'
import { getAllBooks } from '../api/books'
import { Book } from '../types/book'
import { formatDate } from '../lib/utils'
import { PieChart, BarChart, LineChart } from 'lucide-react'

export function Dashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getAllBooks()
        setBooks(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching books:', error)
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  // Calculate statistics
  const totalBooks = books.length
  const readBooks = books.filter(book => book.readStatus === 'read').length
  const unreadBooks = books.filter(book => book.readStatus === 'unread').length
  const dnfBooks = books.filter(book => book.readStatus === 'dnf').length
  const favoriteBooks = books.filter(book => book.favorite).length
  
  // Calculate average rating
  const ratedBooks = books.filter(book => book.rating !== undefined)
  const averageRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length
    : 0
  
  // Book types distribution
  const paperBooks = books.filter(book => book.bookType === 'paper').length
  const ebookBooks = books.filter(book => book.bookType === 'ebook').length
  const audiobookBooks = books.filter(book => book.bookType === 'audiobook').length
  
  // Language distribution
  const enBooks = books.filter(book => book.language === 'en').length
  const uaBooks = books.filter(book => book.language === 'ua').length
  
  // Category distribution
  const fictionBooks = books.filter(book => book.category === 'fiction').length
  const nonFictionBooks = books.filter(book => book.category === 'non-fiction').length
  
  // Top authors
  const authorCounts = books.reduce((acc, book) => {
    acc[book.author] = (acc[book.author] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  // Top publishers
  const publisherCounts = books.reduce((acc, book) => {
    if (book.publisher) {
      acc[book.publisher] = (acc[book.publisher] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const topPublishers = Object.entries(publisherCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  // Get recently added books
  const recentlyAdded = [...books]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg shadow glass-effect">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Books</h3>
          <p className="text-3xl font-bold">{totalBooks}</p>
        </div>
        <div className="p-4 rounded-lg shadow glass-effect">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Read Books</h3>
          <p className="text-3xl font-bold">{readBooks}</p>
        </div>
        <div className="p-4 rounded-lg shadow glass-effect">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Favorite Books</h3>
          <p className="text-3xl font-bold">{favoriteBooks}</p>
        </div>
        <div className="p-4 rounded-lg shadow glass-effect">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Average Rating</h3>
          <p className="flex items-center text-3xl font-bold">
            {averageRating.toFixed(1)}
            <span className="ml-2 text-yellow-500">{'★'.repeat(Math.round(averageRating))}</span>
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Book Types</h3>
          </div>
          
          {totalBooks > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Paper</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(paperBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{paperBooks} ({Math.round((paperBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>E-Book</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${(ebookBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{ebookBooks} ({Math.round((ebookBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Audiobook</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-purple-500 rounded-full" 
                    style={{ width: `${(audiobookBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{audiobookBooks} ({Math.round((audiobookBooks / totalBooks) * 100)}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see statistics</p>
          )}
        </div>
        
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Reading Status</h3>
          </div>
          
          {totalBooks > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Read</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${(readBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{readBooks} ({Math.round((readBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unread</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(unreadBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{unreadBooks} ({Math.round((unreadBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Did Not Finish</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-red-500 rounded-full" 
                    style={{ width: `${(dnfBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{dnfBooks} ({Math.round((dnfBooks / totalBooks) * 100)}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see statistics</p>
          )}
        </div>
        
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <BarChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Languages</h3>
          </div>
          
          {totalBooks > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>🇬🇧 English</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(enBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{enBooks} ({Math.round((enBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🇺🇦 Ukrainian</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full" 
                    style={{ width: `${(uaBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{uaBooks} ({Math.round((uaBooks / totalBooks) * 100)}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see statistics</p>
          )}
        </div>
        
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Categories</h3>
          </div>
          
          {totalBooks > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Fiction</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-indigo-500 rounded-full" 
                    style={{ width: `${(fictionBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{fictionBooks} ({Math.round((fictionBooks / totalBooks) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Non-Fiction</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-orange-500 rounded-full" 
                    style={{ width: `${(nonFictionBooks / totalBooks) * 100}%` }}
                  ></div>
                </div>
                <span>{nonFictionBooks} ({Math.round((nonFictionBooks / totalBooks) * 100)}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see statistics</p>
          )}
        </div>
        
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <LineChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Top Authors</h3>
          </div>
          
          {topAuthors.length > 0 ? (
            <div className="space-y-4">
              {topAuthors.map(([author, count]) => (
                <div key={author} className="flex items-center justify-between">
                  <span className="truncate">{author}</span>
                  <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${(count / books.length) * 100}%` }}
                    ></div>
                  </div>
                  <span>{count} books</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see top authors</p>
          )}
        </div>
        
        <div className="p-6 rounded-lg shadow glass-effect">
          <div className="flex items-center mb-4">
            <LineChart className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">Top Publishers</h3>
          </div>
          
          {topPublishers.length > 0 ? (
            <div className="space-y-4">
              {topPublishers.map(([publisher, count]) => (
                <div key={publisher} className="flex items-center justify-between">
                  <span className="truncate">{publisher}</span>
                  <div className="w-2/3 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${(count / books.length) * 100}%` }}
                    ></div>
                  </div>
                  <span>{count} books</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Add books to see top publishers</p>
          )}
        </div>
      </div>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-4 text-lg font-medium">Recently Added</h3>
        {recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {recentlyAdded.map(book => (
              <div key={book.id} className="flex flex-col overflow-hidden transition-transform duration-200 rounded-lg shadow-md hover:shadow-lg hover:scale-105">
                <div className="relative pb-[140%]">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="absolute object-cover w-full h-full" />
                  ) : (
                    <div className="absolute flex items-center justify-center w-full h-full text-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">No Cover</span>
                    </div>
                  )}
                  {book.favorite && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center justify-center w-6 h-6 text-yellow-500 bg-white rounded-full dark:bg-gray-900">
                        ★
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-3">
                  <h4 className="font-medium line-clamp-1">{book.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{book.author}</p>
                  <p className="mt-auto pt-2 text-xs text-gray-400 dark:text-gray-500">
                    Added {formatDate(book.dateAdded, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No books added yet</p>
        )}
      </div>
    </div>
  )
}
