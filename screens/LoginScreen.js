import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getUserByEmail, addUser, hashPassword, generateSalt, getAllUsers } from '../database';

const AuthScreen = ({ navigation, route }) => {
  const [isLogin, setIsLogin] = useState(true); // true pour login, false pour signup
  const userType = route.params?.userType || 'user';

  // États pour le formulaire de connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // États pour le formulaire d'inscription
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const user = await getUserByEmail(loginEmail);
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
        return;
      }

      const hash = await hashPassword(loginPassword, user.salt);
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
        navigation.navigate('AdminScreen',
          {
            user: { prenom: user.prenom, profileImage: user.profileImage }
          }
        );
      } else {
        navigation.navigate('UserScreen');
      }

      // Vider les champs après connexion réussie
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  const handleSignup = async () => {
    // Validation des champs
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (userType === 'admin' && !adminKey) {
      Alert.alert('Erreur', 'Veuillez saisir le mot clé administrateur');
      return;
    }

    if (userType === 'admin' && adminKey !== 'ADMIN123') {
      Alert.alert('Erreur', 'Mot clé administrateur incorrect');
      return;
    }

    if (!validateEmail(signupEmail)) {
      Alert.alert('Erreur', 'Format d\'email invalide. Il doit contenir @ et .');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const allUsers = await getAllUsers();
      const emailExists = allUsers.some(user => user.email === signupEmail);
      if (!emailExists) {
        Alert.alert('Erreur', 'Cet email n\'existe pas dans la liste des membres. Inscription impossible.');
        return;
      }

      const existingUserWithPassword = await getUserByEmail(signupEmail);
      if (existingUserWithPassword) {
        Alert.alert('Erreur', 'Un compte existe déjà avec cet email. Utilisez la connexion.');
        return;
      }

      // Ajout d'un nouvel utilisateur avec le mot de passe
      const salt = await generateSalt();
      const passwordHash = await hashPassword(signupPassword, salt);
      await addUser(
        signupEmail, // Nom par défaut = email
        signupEmail,
        passwordHash,
        salt,
        userType === 'admin' ? 'admin' : 'user' // Rôle basé sur userType
      );

      Alert.alert('Succès', `${userType === 'admin' ? 'Administrateur' : 'Utilisateur'} créé avec succès`);

      // Vider les champs après inscription réussie
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setAdminKey('');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userType === 'admin' ? 'Espace Administrateur' : 'Espace Utilisateur'}
      </Text>

      {/* Onglets de navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, isLogin && styles.activeTab]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isLogin && styles.activeTab]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Inscription</Text>
        </TouchableOpacity>
      </View>

      {isLogin ? (
        // Formulaire de CONNEXION
        <View style={styles.formContainer}>
          <Text style={styles.label}>Entrez votre adresse email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={loginEmail}
            onChangeText={setLoginEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Entrez votre mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <Button title="Se connecter" onPress={handleLogin} color="#17813cff" />
          </View>
        </View>
      ) : (
        // Formulaire d'INSCRIPTION
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Votre adresse email </Text>
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={signupEmail}
            onChangeText={setSignupEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {userType === 'admin' && (
            <>
              <Text style={styles.label}>Mot clé d'administrateur </Text>
              <TextInput
                style={styles.input}
                placeholder="Mot clé"
                value={adminKey}
                onChangeText={setAdminKey}
                autoCapitalize="none"
                secureTextEntry
              />
            </>
          )}
          <Text style={styles.label}>Créer un mot de passe </Text>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe *"
            value={signupPassword}
            onChangeText={setSignupPassword}
            secureTextEntry
          />
          <Text style={styles.label}>Confirmer votre mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe *"
            value={signupConfirmPassword}
            onChangeText={setSignupConfirmPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <Button style={styles.butt} title="S'inscrire" onPress={handleSignup} color="#212683ff" />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0d4d4ff',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginBlock: 40,
    marginBottom: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0163d2',
  },
  tabText: {
    color: '#666',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  
  },

});

export default AuthScreen;