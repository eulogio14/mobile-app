import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Chat: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}
