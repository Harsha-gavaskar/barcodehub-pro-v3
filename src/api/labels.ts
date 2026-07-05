import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface LabelTemplate {
  id: string
  name: string
  description: string
  canvas_json: any
  thumbnail: string | null
  thumbnail_url: string | null
  width: number
  height: number
  background_color: string
  is_default: boolean
  is_public: boolean
  category: string
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export function useLabelTemplates() {
  return useQuery<LabelTemplate[]>({
    queryKey: ['label-templates'],
    queryFn: async () => {
      const res = await apiClient.get('/labels/templates/')
      return res.data.results || res.data
    },
  })
}

export function useCreateLabelTemplate() {
  const queryClient = useQueryClient()
  return useMutation<LabelTemplate, Error, Partial<LabelTemplate>>({
    mutationFn: async (data) => {
      const res = await apiClient.post('/labels/templates/', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-templates'] })
    },
  })
}

export function useUpdateLabelTemplate() {
  const queryClient = useQueryClient()
  return useMutation<LabelTemplate, Error, { id: string; data: Partial<LabelTemplate> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.put(`/labels/templates/${id}/`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-templates'] })
    },
  })
}

export function useDeleteLabelTemplate() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/labels/templates/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-templates'] })
    },
  })
}
