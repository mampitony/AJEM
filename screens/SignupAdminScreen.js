import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { getUserByEmail, hashPassword } from '../database';

const SignupScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const userType = route.params?.userType || 'user';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const user = await getUserByEmail(email);
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
        return;
      }

      const hash = await hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        Alert.alert('Erreur', 'Mot de passe incorrect');
        return;
      }

      // Vérifier le rôle de l'utilisateur
      if (userType === 'admin' && user.role !== 'admin') {
        Alert.alert('Erreur', 'Accès administrateur requis');
        return;
      }

      // Redirection selon le type d'utilisateur
      if (userType === 'admin') {
        navigation.navigate('AdminScreen');
      } else {
        navigation.navigate('UserScreen');
      }
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Connexion {userType === 'admin' ? 'Administrateur' : 'Utilisateur'}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={{ marginBottom: 5 }}>Mot clé d'administrateur</Text>
      <TextInput 
      style={styles.input}
        placeholder="Mot clé"
        value={motcle}
        onChangeText={setMotcle}
        autoCapitalize="none"
      />   
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
          
      <TextInput
        style={styles.input}
        placeholder="Confirmé le mot de passe"
        value={confirmpassword}
        onChangeText={setConfirmpassword}
        secureTextEntry
      />

      
      <View style={styles.buttonContainer}>
        <Button title="Se connecter" onPress={handleLogin} />
      </View>
      
      {userType === 'admin' && (
        <TouchableOpacity onPress={() => navigation.navigate('AdminSignup')}>
          <Text style={styles.link}>Créer un compte administrateur</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  link: {
    color: 'blue',
    marginTop: 15,
  },
});

export default SignupScreen;