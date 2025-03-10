import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Upload, Save, Clock, Server, FolderOpen } from 'lucide-react'
import { getBackupSettings, saveBackupSettings, performBackup } from '../api/books'

export function Settings() {
  const [backupSettings, setBackupSettings] = useState({
    enabled: false,
    frequency: 'daily',
    oneDrivePath: '',
    lastBackup: null as string | null
  })
  
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [hostIP, setHostIP] = useState('192.168.50.25')
  const [port, setPort] = useState('3001')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  useEffect(() => {
    // Fetch backup settings when component mounts
    fetchBackupSettings()
  }, [])
  
  const fetchBackupSettings = async () => {
    try {
      const settings = await getBackupSettings()
      setBackupSettings({
        enabled: settings.enabled,
        frequency: settings.frequency,
        oneDrivePath: settings.oneDrivePath || '',
        lastBackup: settings.lastBackup || null
      })
      
      // If OneDrive path is set, consider it connected
      setIsConnected(!!settings.oneDrivePath)
    } catch (error) {
      console.error('Error fetching backup settings:', error)
    }
  }
  
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
    
    // Don't override the path if it's already set
    if (!backupSettings.oneDrivePath) {
      setBackupSettings(prev => ({
        ...prev,
        oneDrivePath: 'OneDrive/BookDatabase'
      }))
    }
  }
  
  const handleDisconnectOneDrive = () => {
    setIsConnected(false)
    setBackupSettings(prev => ({
      ...prev,
      oneDrivePath: ''
    }))
  }
  
  const handleBackupNow = async () => {
    setIsBackingUp(true)
    try {
      // Call the API to perform a backup
      const success = await performBackup()
      
      if (success) {
        // Update last backup time
        const now = new Date()
        setBackupSettings(prev => ({
          ...prev,
          lastBackup: now.toISOString()
        }))
        
        alert('Backup completed successfully!')
      } else {
        alert('Backup failed. Please check the server logs.')
      }
    } catch (error) {
      console.error('Error performing backup:', error)
      alert('Backup failed. Please check the server logs.')
    } finally {
      setIsBackingUp(false)
    }
  }
  
  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // Save backup settings
      await saveBackupSettings({
        enabled: backupSettings.enabled,
        frequency: backupSettings.frequency as 'daily' | 'weekly' | 'monthly',
        oneDrivePath: backupSettings.oneDrivePath,
        lastBackup: backupSettings.lastBackup
      })
      
      // In a real app, you would also save the host IP and port to server config
      // For now, we'll just simulate success
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">Server Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="host-ip" className="block mb-2 text-sm font-medium">
                Host IP Address
              </label>
              <div className="flex items-center">
                <Server className="w-4 h-4 mr-2 text-gray-500" />
                <input
                  type="text"
                  id="host-ip"
                  value={hostIP}
                  onChange={(e) => setHostIP(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="192.168.50.25"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                The IP address where the server will be accessible on your local network
              </p>
            </div>
            
            <div>
              <label htmlFor="port" className="block mb-2 text-sm font-medium">
                Port
              </label>
              <input
                type="text"
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="3001"
              />
              <p className="mt-1 text-xs text-gray-500">
                The port number for the server (default: 3001)
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="onedrive-path" className="text-sm font-medium">
                      OneDrive Path
                    </label>
                    <div className="flex items-center">
                      <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                      <input
                        type="text"
                        id="onedrive-path"
                        name="oneDrivePath"
                        value={backupSettings.oneDrivePath}
                        onChange={handleBackupSettingChange}
                        className="flex-1 p-2 border rounded"
                        placeholder="OneDrive/BookDatabase"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Specify the folder path in your OneDrive where backups will be stored
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
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
                      disabled={isBackingUp}
                    >
                      {isBackingUp ? 'Backing Up...' : 'Backup Now'}
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
                  <select
                    name="frequency"
                    value={backupSettings.frequency}
                    onChange={handleBackupSettingChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
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
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save All Settings'}
        </Button>
      </div>
      
      <div className="p-6 rounded-lg shadow glass-effect">
        <h3 className="mb-6 text-xl font-medium">About</h3>
        
        <div className="space-y-2">
          <p className="text-sm">BookDatabase v1.0.0</p>
          <p className="text-sm text-gray-500">A personal book collection management application</p>
          <p className="text-sm text-gray-500">© 2023 All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
