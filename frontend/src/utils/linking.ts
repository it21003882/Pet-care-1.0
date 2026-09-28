/**
 * utils/linking.ts
 * Deep linking utilities for Phone calls, External Web links,
 * and Google Maps directions.
 */

import { Linking, Alert, Platform } from 'react-native';

export interface LocationDestination {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  name?: string | null;
}

/**
 * Open Google Maps with directions to a destination
 */
export const openGoogleMapsDirections = async (destination: LocationDestination): Promise<void> => {
  const { latitude, longitude, address, name } = destination;

  let url = '';

  if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  } else if (address && address.trim()) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}`;
  } else if (name && name.trim()) {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.trim())}`;
  } else {
    Alert.alert('Location Unavailable', 'No address or GPS coordinates are available for directions.');
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback for devices without direct handler
      await Linking.openURL(url);
    }
  } catch (error) {
    Alert.alert(
      'Unable to Open Maps',
      'Could not launch maps. Please ensure an internet connection and a compatible browser or map application are available.'
    );
  }
};

/**
 * Make a direct phone call
 */
export const makePhoneCall = async (phoneNumber?: string | null): Promise<void> => {
  if (!phoneNumber || !phoneNumber.trim()) {
    Alert.alert('Phone Unavailable', 'No contact phone number is registered for this provider.');
    return;
  }

  // Strip unwanted characters for dialer
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  const telUrl = `tel:${cleanPhone}`;

  try {
    const supported = await Linking.canOpenURL(telUrl);
    if (supported || Platform.OS === 'android' || Platform.OS === 'ios') {
      await Linking.openURL(telUrl);
    } else {
      Alert.alert('Call Not Supported', `Please dial manually: ${phoneNumber}`);
    }
  } catch (error) {
    Alert.alert('Call Failed', `Could not initiate call. Number: ${phoneNumber}`);
  }
};

/**
 * Open an external website URL
 */
export const openWebsite = async (url?: string | null): Promise<void> => {
  if (!url || !url.trim()) {
    Alert.alert('Website Unavailable', 'No website link is provided.');
    return;
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const supported = await Linking.canOpenURL(formattedUrl);
    if (supported) {
      await Linking.openURL(formattedUrl);
    } else {
      Alert.alert('Invalid Link', 'Could not open the provided website URL.');
    }
  } catch (error) {
    Alert.alert('Error', `Could not open website: ${formattedUrl}`);
  }
};
