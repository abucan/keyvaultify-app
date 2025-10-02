'use client'
import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type ImportEnvDialogProps = {
  onImport: (secrets: Array<{ key: string; value: string }>) => void
  children: React.ReactNode
}

export function ImportEnvDialog({ onImport, children }: ImportEnvDialogProps) {
  const [open, setOpen] = useState(false)
  const [envContent, setEnvContent] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const parseEnvContent = (content: string) => {
    const lines = content.split('\n')
    const secrets: Array<{ key: string; value: string }> = []

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue
      }

      const equalIndex = trimmedLine.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim()
        const value = trimmedLine.substring(equalIndex + 1).trim()

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')

        if (key && cleanValue) {
          secrets.push({ key, value: cleanValue })
        }
      }
    }

    return secrets
  }

  const handleImport = async () => {
    if (!envContent.trim()) {
      toast.error('Please paste some .env content')
      return
    }

    setIsImporting(true)
    try {
      const secrets = parseEnvContent(envContent)

      if (secrets.length === 0) {
        toast.error('No valid environment variables found in the content')
        return
      }

      onImport(secrets)
      setEnvContent('')
      setOpen(false)
      toast.success(`Imported ${secrets.length} environment variables`)
    } catch (error) {
      console.error('Error importing .env content:', error)
      toast.error('Failed to import environment variables')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.env')) {
      toast.error('Please select a .env file')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      setEnvContent(content)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Environment Variables
          </DialogTitle>
          <DialogDescription>
            Paste your .env file content or upload a .env file to create
            multiple secrets at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-content">Environment Variables</Label>
            <Textarea
              id="env-content"
              value={envContent}
              onChange={e => setEnvContent(e.target.value)}
              placeholder={`# Paste your .env file content here
CLIENT_KEY=your_client_key_here
API_SECRET=your_api_secret_here
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NODE_ENV=production`}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Each line should be in the format KEY=VALUE. Comments (lines
              starting with #) will be ignored.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".env"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload .env File
                </Button>
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !envContent.trim()}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Variables'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
