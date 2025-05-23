/**
 * Allocation API client
 */

import { api } from '@/lib/api';
import { useAllocationApi } from '@/hooks/use-allocation-api';

// Re-export the allocation API
export const allocationApi = api.allocation;

// Export the allocation API hook
export { useAllocationApi };
