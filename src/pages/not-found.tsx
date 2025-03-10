import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="mt-4 text-2xl font-medium">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}
