/**
 * types/navigation.ts
 * React Navigation TypeScript Type Definitions
 */

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type PetStackParamList = {
  PetList: undefined;
  PetDetail: { petId: string };
  AddPet: undefined;
  EditPet: { petId: string };
};

export type VetStackParamList = {
  VetList: undefined;
  VetDetail: { vetId: string };
};

export type AppointmentStackParamList = {
  AppointmentList: undefined;
  BookAppointment: { vetId?: string; petId?: string };
  AppointmentDetail: { appointmentId: string };
};

export type MedicalRecordStackParamList = {
  MedicalRecordList: { petId?: string };
  MedicalRecordDetail: { recordId: string };
  AddMedicalRecord: { petId?: string };
};

export type ServiceStackParamList = {
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
  BookService: { serviceId: string };
  MyBookings: undefined;
  AddReview: { serviceId?: string; vetId?: string; title?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  PetsTab: undefined;
  VetsTab: undefined;
  AppointmentsTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
};

export type ServiceCenterTabParamList = {
  CenterDashboardTab: undefined;
  CenterServicesTab: undefined;
  CenterBookingsTab: undefined;
  CenterProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PetDetail: { petId: string };
  AddPet: undefined;
  EditPet: { petId: string };
  VetDetail: { vetId: string };
  BookAppointment: { vetId?: string; petId?: string };
  AppointmentDetail: { appointmentId: string };
  MedicalRecordList: { petId?: string };
  MedicalRecordDetail: { recordId: string };
  AddMedicalRecord: { petId?: string };
  ServiceDetail: { serviceId: string };
  BookService: { serviceId: string };
  MyBookings: undefined;
  AddReview: { serviceId?: string; vetId?: string; title?: string };
  AdminManagement: undefined;
  ServiceCenterAddEditService: { serviceId?: string };
};
