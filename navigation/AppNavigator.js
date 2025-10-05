
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import AdminScreen from '../screens/AdminScreen';
import AuthScreen from '../screens/LoginScreen';
import UserScreen from '../screens/UserScreen';
import AdminSignupForm from '../components/AdminSignupForm';
import AcceuilScreen from '../screens/AcceuilScreen';
import UserDrawerNavigator from './UserNavigator';
import RoleSelectionScreen from '../screens/RoleSelectionScreen'; // Ajout de RoleSelectionScreen

// Créer le Stack Navigator pour les écrans d'authentification et d'administration
const Stack = createNativeStackNavigator();

// Créer le Drawer Navigator pour le menu latéral
const Drawer = createDrawerNavigator();

// Stack Navigator pour les écrans principaux
function MainStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0163d2'
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Page de connexion' }}
      />
      <Stack.Screen
        name="AdminScreen"
        component={AdminScreen}
        options={{ title: 'Gestion des Membres' }}
      />
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ title: 'Authentification', headerShown: false }}
      />
      <Stack.Screen
        name="UserScreen"
        component={UserScreen}
        options={{ title: 'Comptable', headerShown: false }}
      />
      <Stack.Screen
        name="AdminSignup"
        component={AdminSignupForm}
        options={{ title: 'Inscription Administrateur' }}
      />

    </Stack.Navigator>
  );
}

// Drawer Navigator pour le menu principal
function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        statusBarColor: '#0163d2',
        headerStyle: {
          backgroundColor: '#0163d2'
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen
        name="Acceuil"
        component={AcceuilScreen}
        options={{ title: 'Accueil' }}
      />
      <Drawer.Screen
        name="Connexion"
        component={MainStackNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

// Navigateur principal de l'application
function AppNavigator() {
  return (
    <NavigationContainer>
      <MainDrawerNavigator />
    </NavigationContainer>
  );
}

export default AppNavigator;
