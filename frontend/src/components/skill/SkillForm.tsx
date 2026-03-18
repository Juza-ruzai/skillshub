import { useState, useCallback } from 'react'
import type { SkillCreate } from '@/types/skill'
import { X, Loader2 } from 'lucide-react'

export interface SkillFormProps {
  initialData?: Partial<SkillCreate>
  mode: 'create' | 'edit'
  onSubmit: (data: SkillCreate) => void | Promise<void>
  loading?: boolean
}

interface FormErrors {
  name?: string
  description?: string
  usageScenario?: string
  usageMethod?: string
}

export function SkillForm({ initialData, mode, onSubmit, loading }: SkillFormProps): JSX.Element {
  const [formData, setFormData] = useState<SkillCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    usageScenario: initialData?.usageScenario || '',
    usageMethod: initialData?.usageMethod || '',
    tags: initialData?.tags || [],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [tagInput, setTagInput] = useState('')

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.usageScenario.trim()) {
      newErrors.usageScenario = 'Usage scenario is required'
    }

    if (!formData.usageMethod.trim()) {
      newErrors.usageMethod = 'Usage method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate()) return

      await onSubmit(formData)

      // Reset form after successful submit (only for create mode)
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          usageScenario: '',
          usageMethod: '',
          tags: [],
        })
      }
    },
    [formData, mode, onSubmit, validate]
  )

  const handleChange = useCallback(
    (field: keyof SkillCreate) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
      },
    [errors]
  )

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
      setTagInput('')
    }
  }, [tagInput, formData.tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddTag()
      }
    },
    [handleAddTag]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Skill name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange('description')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Brief description of the skill"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Usage Scenario */}
      <div>
        <label htmlFor="usageScenario" className="block text-sm font-medium text-gray-700">
          Usage Scenario
        </label>
        <textarea
          id="usageScenario"
          rows={2}
          value={formData.usageScenario}
          onChange={handleChange('usageScenario')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="When and how to use this skill"
        />
        {errors.usageScenario && (
          <p className="mt-1 text-sm text-red-600">{errors.usageScenario}</p>
        )}
      </div>

      {/* Usage Method */}
      <div>
        <label htmlFor="usageMethod" className="block text-sm font-medium text-gray-700">
          Usage Method
        </label>
        <textarea
          id="usageMethod"
          rows={4}
          value={formData.usageMethod}
          onChange={handleChange('usageMethod')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Detailed instructions on how to use"
        />
        {errors.usageMethod && <p className="mt-1 text-sm text-red-600">{errors.usageMethod}</p>}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Add a tag and press Enter"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Submitting...
          </>
        ) : mode === 'create' ? (
          'Create Skill'
        ) : (
          'Update Skill'
        )}
      </button>
    </form>
  )
}
