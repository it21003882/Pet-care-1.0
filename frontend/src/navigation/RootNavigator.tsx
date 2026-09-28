/**
 * navigation/RootNavigator.tsx
 * Root Stack Navigator with conditional auth routing & all modal/detail screens
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

import AuthNavigator from './AuthNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';
import VeterinarianTabNavigator from './VeterinarianTabNavigator';
import ServiceCenterTabNavigator from './ServiceCenterTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import Loading from '../components/common/Loading';

// Service Center Screens
import ServiceCenterAddEditServiceScreen from '../screens/serviceCenter/ServiceCenterAddEditServiceScreen';

// Function 1 Screens
import PetDetailScreen from '../functions/function1-pets/screens/PetDetailScreen';
import AddPetScreen from '../functions/function1-pets/screens/AddPetScreen';
import EditPetScreen from '../functions/function1-pets/screens/EditPetScreen';

// Function 2 Screens
import VetDetailScreen from '../functions/function2-veterinarians/screens/VetDetailScreen';

// Function 3 Screens
import BookAppointmentScreen from '../functions/function3-appointments/screens/BookAppointmentScreen';
import AppointmentDetailScreen from '../functions/function3-appointments/screens/AppointmentDetailScreen';

// Function 4 Screens
import MedicalRecordListScreen from '../functions/function4-medical-records/screens/MedicalRecordListScreen';
import MedicalRecordDetailScreen from '../functions/function4-medical-records/screens/MedicalRecordDetailScreen';
import AddMedicalRecordScreen from '../functions/function4-medical-records/screens/AddMedicalRecordScreen';

// Function 5 Screens
import ServiceDetailScreen from '../functions/function5-services/screens/ServiceDetailScreen';

// Function 6 Screens
import BookServiceScreen from '../functions/function6-bookings-reviews/screens/BookServiceScreen';
import MyBookingsScreen from '../functions/function6-bookings-reviews/screens/MyBookingsScreen';
import AddReviewScreen from '../functions/function6-bookings-reviews/screens/AddReviewScreen';

// Admin Screens
import AdminManagementScreen from '../screens/admin/AdminManagementScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Starting PetCare..." />;
  }

  // Strictly select dedicated role portal
  const normalizedRole = user?.role ? (user.role as string).toLowerCase() : '';
  const isDoctorUnverified = normalizedRole === 'veterinarian' && user?.isVerified === false;
  const isAllowedAuth = isAuthenticated && !isDoctorUnverified;

  const RolePortalComponent =
    normalizedRole === 'veterinarian'
      ? VeterinarianTabNavigator
      : normalizedRole === 'service_center'
      ? ServiceCenterTabNavigator
      : normalizedRole === 'admin'
      ? AdminTabNavigator
      : OwnerTabNavigator;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 17,
          },
        }}
      >
        {!isAllowedAuth ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={RolePortalComponent}
              options={{ headerShown: false }}
            />

            {/* Function 1 Screens */}
            <Stack.Screen
              name="PetDetail"
              component={PetDetailScreen}
              options={{ title: 'Pet Profile' }}
            />
            <Stack.Screen
              name="AddPet"
              component={AddPetScreen}
              options={{ title: 'Add New Pet' }}
            />
            <Stack.Screen
              name="EditPet"
              component={EditPetScreen}
              options={{ title: 'Edit Pet Profile' }}
            />

            {/* Function 2 Screens */}
            <Stack.Screen
              name="VetDetail"
              component={VetDetailScreen}
              options={{ title: 'Veterinarian Profile' }}
            />

            {/* Function 3 Screens */}
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
              options={{ title: 'Book Consultation' }}
            />
            <Stack.Screen
              name="AppointmentDetail"
              component={AppointmentDetailScreen}
              options={{ title: 'Appointment Details' }}
            />

            {/* Function 4 Screens */}
            <Stack.Screen
              name="MedicalRecordList"
              component={MedicalRecordListScreen}
              options={{ title: 'Medical Timeline' }}
            />
            <Stack.Screen
              name="MedicalRecordDetail"
              component={MedicalRecordDetailScreen}
              options={{ title: 'Clinical Record' }}
            />
            <Stack.Screen
              name="AddMedicalRecord"
              component={AddMedicalRecordScreen}
              options={{ title: 'Add Clinical Entry' }}
            />

            {/* Function 5 Screens */}
            <Stack.Screen
              name="ServiceDetail"
              component={ServiceDetailScreen}
              options={{ title: 'Service Details' }}
            />

            {/* Function 6 Screens */}
            <Stack.Screen
              name="BookService"
              component={BookServiceScreen}
              options={{ title: 'Book Pet Service' }}
            />
            <Stack.Screen
              name="MyBookings"
              component={MyBookingsScreen}
              options={{ title: 'Service Bookings' }}
            />
            <Stack.Screen
              name="AddReview"
              component={AddReviewScreen}
              options={{ title: 'Leave Feedback' }}
            />
            <Stack.Screen
              name="AdminManagement"
              component={AdminManagementScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ServiceCenterAddEditService"
              component={ServiceCenterAddEditServiceScreen}
              options={{ title: 'Manage Pet Service' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
