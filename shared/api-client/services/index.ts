/**
 * API services index file
 * Re-exports all API services and provides factory functions
 */

// Re-export services
export * from './auth-api';
export * from './service-user-api';
export * from './care-plan-api';
export * from './appointment-api';
export * from './staff-api';
export * from './allocation-api';
export * from './ml-models-api';
export * from './feedback-api';
export * from './visit-api';

// Import components
import { ApiClient } from '../core';
import { AuthApi } from './auth-api';
import { ServiceUserApi } from './service-user-api';
import { CarePlanApi } from './care-plan-api';
import { AppointmentApi } from './appointment-api';
import { StaffApi } from './staff-api';
import { AllocationApi } from './allocation-api';
import { MLModelsApiService } from './ml-models-api';
import { FeedbackApi } from './feedback-api';
import { VisitApi } from './visit-api';

/**
 * API services container
 */
export interface ApiServices {
  auth: AuthApi;
  serviceUsers: ServiceUserApi;
  carePlans: CarePlanApi;
  appointments: AppointmentApi;
  staff: StaffApi;
  allocation: AllocationApi;
  mlModels: MLModelsApiService;
  feedback: FeedbackApi;
  visits: VisitApi;
}

/**
 * Create API services
 */
export function createApiServices(client: ApiClient): ApiServices {
  return {
    auth: new AuthApi(client),
    serviceUsers: new ServiceUserApi(client),
    carePlans: new CarePlanApi(client),
    appointments: new AppointmentApi(client),
    staff: new StaffApi(client),
    allocation: new AllocationApi(client),
    mlModels: new MLModelsApiService(client),
    feedback: new FeedbackApi(client),
    visits: new VisitApi(client),
  };
}
