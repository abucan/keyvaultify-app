'use client'
import { useState } from 'react'
import { Eye, EyeOff, Save, X, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { toast } from 'sonner'

type SecretField = {
  id: string
  key: string
  value: string
}

type InlineSecretRowProps = {
  environments: Array<{ id: string; name: string }>
  onSave: (data: {
    key: string
    value: string
    environmentIds: string[]
  }) => Promise<void>
  onCancel: () => void
  initialData?: {
    key: string
    value: string
    environmentIds: string[]
  }
  isEditing?: boolean
  onMultiplePaste?: (secrets: Array<{ key: string; value: string }>) => void
  importedSecrets?: Array<{ key: string; value: string }>
}

export function InlineSecretRow({
  environments,
  onSave,
  onCancel,
  initialData,
  isEditing = false,
  onMultiplePaste,
  importedSecrets
}: InlineSecretRowProps) {
  const [secretFields, setSecretFields] = useState<SecretField[]>(() => {
    if (importedSecrets && importedSecrets.length > 0) {
      return importedSecrets.map(secret => ({
        id: crypto.randomUUID(),
        key: secret.key,
        value: secret.value
      }))
    }
    if (initialData) {
      return [
        {
          id: crypto.randomUUID(),
          key: initialData.key,
          value: initialData.value
        }
      ]
    }
    return [
      {
        id: crypto.randomUUID(),
        key: '',
        value: ''
      }
    ]
  })
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    initialData?.environmentIds || []
  )
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<
    Record<string, { key?: string; value?: string }>
  >({})

  const handleKeyPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    fieldId: string
  ) => {
    const pastedText = e.clipboardData.getData('text')
    const lines = pastedText.split('\n').filter(line => line.trim())

    if (lines.length > 1) {
      // Multiple lines pasted, create multiple fields
      e.preventDefault()

      const parsedSecrets = lines
        .map(line => {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine.startsWith('#')) return null

          const equalIndex = trimmedLine.indexOf('=')
          if (equalIndex > 0) {
            const key = trimmedLine.substring(0, equalIndex).trim()
            const value = trimmedLine.substring(equalIndex + 1).trim()
            // Remove quotes if present
            const cleanValue = value.replace(/^["']|["']$/g, '')

            if (key && cleanValue) {
              return { key, value: cleanValue }
            }
          }
          return null
        })
        .filter(Boolean) as Array<{ key: string; value: string }>

      if (parsedSecrets.length > 0) {
        // Create new fields for all parsed secrets
        const newFields = parsedSecrets.map(secret => ({
          id: crypto.randomUUID(),
          key: secret.key,
          value: secret.value
        }))

        setSecretFields(prev => {
          // Replace the current field with the first secret, then add the rest
          const updatedFields = prev.map(field =>
            field.id === fieldId
              ? { ...field, key: newFields[0].key, value: newFields[0].value }
              : field
          )

          // Add remaining fields
          return [...updatedFields, ...newFields.slice(1)]
        })

        // Set all environments as selected
        setSelectedEnvironments(environments.map(env => env.id))
      }
    } else if (lines.length === 1) {
      // Single line pasted, check if it's KEY=VALUE format
      const line = lines[0].trim()
      const equalIndex = line.indexOf('=')

      if (equalIndex > 0) {
        e.preventDefault()
        const parsedKey = line.substring(0, equalIndex).trim()
        const parsedValue = line.substring(equalIndex + 1).trim()
        // Remove quotes if present
        const cleanValue = parsedValue.replace(/^["']|["']$/g, '')

        setSecretFields(prev =>
          prev.map(field =>
            field.id === fieldId
              ? { ...field, key: parsedKey, value: cleanValue }
              : field
          )
        )
        setSelectedEnvironments(environments.map(env => env.id))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, { key?: string; value?: string }> = {}
    let isValid = true

    secretFields.forEach(field => {
      const fieldErrors: { key?: string; value?: string } = {}

      if (!field.key.trim()) {
        fieldErrors.key = 'Key is required'
        isValid = false
      }

      if (!field.value.trim()) {
        fieldErrors.value = 'Value is required'
        isValid = false
      }

      if (Object.keys(fieldErrors).length > 0) {
        newErrors[field.id] = fieldErrors
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    if (selectedEnvironments.length === 0) {
      toast.error('Please select at least one environment')
      return
    }

    setIsSaving(true)
    try {
      // Save all secrets
      for (const field of secretFields) {
        await onSave({
          key: field.key.trim(),
          value: field.value.trim(),
          environmentIds: selectedEnvironments
        })
      }
    } catch (error) {
      console.error('Error saving secrets:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const updateField = (
    fieldId: string,
    updates: Partial<Pick<SecretField, 'key' | 'value'>>
  ) => {
    setSecretFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    )
  }

  const removeField = (fieldId: string) => {
    setSecretFields(prev => prev.filter(field => field.id !== fieldId))
  }

  const addField = () => {
    setSecretFields(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        key: '',
        value: ''
      }
    ])
  }

  const toggleShowValue = (fieldId: string) => {
    setShowValues(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }))
  }

  return (
    <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-blue-900">
          {isEditing
            ? 'Edit Secret'
            : `Add ${secretFields.length} Secret${secretFields.length > 1 ? 's' : ''}`}
        </h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving
              ? 'Saving...'
              : `Save ${secretFields.length} Secret${secretFields.length > 1 ? 's' : ''}`}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {secretFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`key-${field.id}`}>
                Key {secretFields.length > 1 && `#${index + 1}`}
              </Label>
              <Input
                id={`key-${field.id}`}
                value={field.key}
                onChange={e => updateField(field.id, { key: e.target.value })}
                onPaste={e => handleKeyPaste(e, field.id)}
                onKeyDown={handleKeyDown}
                placeholder="CLIENT_KEY..."
                className={errors[field.id]?.key ? 'border-red-500' : ''}
              />
              {errors[field.id]?.key && (
                <p className="text-sm text-red-500">{errors[field.id].key}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`value-${field.id}`}>
                Value {secretFields.length > 1 && `#${index + 1}`}
              </Label>
              <div className="relative">
                <Input
                  id={`value-${field.id}`}
                  type={showValues[field.id] ? 'text' : 'password'}
                  value={field.value}
                  onChange={e =>
                    updateField(field.id, { value: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Enter secret value..."
                  className={
                    errors[field.id]?.value ? 'border-red-500 pr-20' : 'pr-20'
                  }
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleShowValue(field.id)}
                  >
                    {showValues[field.id] ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              {errors[field.id]?.value && (
                <p className="text-sm text-red-500">{errors[field.id].value}</p>
              )}
            </div>

            {secretFields.length > 1 && (
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addField}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Secret
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Environments</Label>
        <MultiSelect
          options={environments.map(env => ({
            label: env.name,
            value: env.id
          }))}
          selected={selectedEnvironments}
          onChange={setSelectedEnvironments}
          placeholder="Select environments..."
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Paste KEY=VALUE format in any Key field to auto-populate both
          fields. Paste multiple lines to create multiple secret fields at once.
        </p>
      </div>
    </div>
  )
}
