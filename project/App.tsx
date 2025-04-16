import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* Add other auth screens here */}
        </>
      ) : (
        // App screens
        <>
          {user?.email === 'admin@gmail.com' ? (
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen}
              options={{
                title: 'Admin Dashboard',
                headerShown: false,
              }}
            />
          ) : (
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'Home',
                headerRight: () => null,
              }}
            />
          )}
          {/* Add other app screens here */}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
} 