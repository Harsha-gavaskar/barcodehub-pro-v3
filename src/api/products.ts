import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export interface APIProduct {
  id: string
  name: string
  sku: string
  barcode: string
  barcode_format: string
  price: string | number | null
  category: string | null
  category_name?: string
  description?: string
  status: 'active' | 'inactive' | 'discontinued'
  weight?: string
  dimensions?: string
  manufacturer?: string
  supplier?: string
  country_of_origin?: string
  stock: number
  reserved_stock: number
  available_stock?: number
  low_stock_threshold: number
  location?: string
  expiry_date?: string | null
  manufacture_date?: string | null
  batch_number?: string
  tags?: string[]
  custom_fields?: Record<string, any>
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface APICategory {
  id: string
  name: string
  parent: string | null
  description?: string
  created_at: string
}

export interface ProductsResponse {
  count: number
  next: string | null
  previous: string | null
  results: APIProduct[]
}

// Fetch categories
export function useCategories() {
  return useQuery<APICategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/')
      return res.data
    },
  })
}

// Fetch products with filters
export function useProducts(params: {
  search?: string
  category_name?: string
  ordering?: string
  page?: number
  page_size?: number
}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      // Map category 'All' to empty
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        page_size: params.page_size ?? 12,
      }
      if (params.search) queryParams.search = params.search
      if (params.category_name && params.category_name !== 'All') {
        queryParams.category_name = params.category_name
      }
      if (params.ordering) {
        queryParams.ordering = params.ordering
      }
      
      const res = await apiClient.get('/products/', { params: queryParams })
      return res.data
    },
  })
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation<APIProduct, any, Partial<APIProduct>>({
    mutationFn: async (newProduct) => {
      const res = await apiClient.post('/products/', newProduct)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation<APIProduct, any, { id: string; data: Partial<APIProduct> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.patch(`/products/${id}/`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation<void, any, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/products/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Trigger Google Sheets Sync
export function useSyncGoogleSheets() {
  return useMutation<any, any, void>({
    mutationFn: async () => {
      const res = await apiClient.post('/google-sheets/sync/')
      return res.data
    },
  })
}
