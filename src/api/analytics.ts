import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'

export interface DashboardAnalyticsResponse {
  kpis: {
    totalProducts: number
    totalPrinted: number
    pendingPrints: number
    lowStock: number
    outOfStock: number
  }
  chartData: {
    date: string
    generated: number
    printed: number
    failed: number
  }[]
  topProducts: {
    name: string
    count: number
  }[]
  barcodeDistribution: {
    format: string
    value: number
  }[]
}

export function useDashboardAnalytics() {
  return useQuery<DashboardAnalyticsResponse>({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/dashboard/')
      return res.data
    },
  })
}
