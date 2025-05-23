export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
  ForgotPassword: undefined;
  Main: undefined;
  ServiceUserDetail: { id: number };
  CarePlans: { serviceUserId?: number };
  CarePlanDetail: { id: number };
  VisitDetail: { id: number };
  Visits: { serviceUserId?: number };
  Notes: { serviceUserId: number };
  AddNote: { serviceUserId: number };
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  AccessibilitySettings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  ServiceUsers: undefined;
  Visits: undefined;
  Profile: undefined;
};
