import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobsScreen from '../screens/JobsScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import ChatScreen from '../screens/ChatScreen';
import { useAuth } from '../contexts/AuthContext';

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main Stack
  Home: undefined;
  Profile: undefined;
  Jobs: undefined;
  JobDetails: { jobId: string };
  Chat: { jobId: string; recipientId: string };
  
  // Admin Stack
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManageJobs: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Jobs" component={JobsScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      {/* Add other admin screens here */}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // You should return a loading screen component here
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.email === 'admin@gmail.com' ? (
        <AdminStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
} 