import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Upload, Save, Clock } from 'lucide-react'

export function Settings() {
  const [backupSettings, setBackupSettings] = useState({
    enabled: false,
    location: '',
    schedule: 'daily',
    time: '00:00',
    lastBackup: null as string | null
  })
  
  const [isConnected, setIsConnected] = useState(false)
  
  const handleBackupSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setBackupSettings(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setBackupSettings(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const handleConnectOneDrive = () => {
    // In a real app, this would initiate OAuth flow with Microsoft
    setIsConnected(true)
    setBackupSettings(prev => ({
      ...prev,
      location: 'OneDrive/BookDatabase'
    }))
  }
  
  const handleDisconnectOneDrive = () => {
    setIsConnected(false)
    setBackupSettings(prev => ({
      ...prev,
      location: ''
    }))
  }
  
  const handleBackupNow = () => {
    // In a real app, this would trigger the backup process
    const now = new Date()
    setBackupSettings(prev => ({
      ...prev,
      lastBackup: now.toISOString()
    }))
    
    alert('Backup completed successfully!')
  }
  
  const handleSaveSettings = () => {
    // In a real app, this would save settings to persistent storage
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">Backup Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="backup-enabled"
              name="enabled"
              checked={backupSettings.enabled}
              onChange={handleBackupSettingChange}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="backup-enabled" className="text-sm font-medium">
              Enable Automatic Backups
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Backup Location
              </label>
              
              {!isConnected ? (
                <Button 
                  onClick={handleConnectOneDrive}
                  className="flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Connect to OneDrive
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center p-2 border rounded">
                    <span className="text-sm">{backupSettings.location}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDisconnectOneDrive}
                    >
                      Disconnect
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBackupNow}
                    >
                      Backup Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {backupSettings.enabled && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Backup Schedule
                  </label>
                  <div className="flex space-x-4">
                    <select
                      name="schedule"
                      value={backupSettings.schedule}
                      onChange={handleBackupSettingChange}
                      className="p-2 border rounded"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    
                    <input
                      type="time"
                      name="time"
                      value={backupSettings.time}
                      onChange={handleBackupSettingChange}
                      className="p-2 border rounded"
                    />
                  </div>
                </div>
                
                {backupSettings.lastBackup && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">Application Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Default Book View
            </label>
            <select
              className="w-full p-2 border rounded"
            >
              <option value="list">List View</option>
              <option value="shelf">Shelf View</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">
              Default Sort Order
            </label>
            <select
              className="w-full p-2 border rounded"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="dateAdded">Date Added</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="pt-4 border-t">
            <Button onClick={() => alert('Settings saved!')}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">About</h3>
        
        <div className="space-y-2">
          <p className="text-sm">BookDatabase v1.0.0</p>
          <p className="text-sm text-gray-500">A personal book collection management application</p>
          <p className="text-sm text-gray-500">© 2025 Atlantis, All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
