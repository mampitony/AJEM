import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserByEmail, addUser, hashPassword, getAllUsers } from '../database';

const AuthScreen = ({ navigation, route }) => {
  const [isLogin, setIsLogin] = useState(true);
  const userType = route.params?.userType || 'user';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');

  // États pour afficher/masquer les mots de passe
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

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

      if (userType === 'admin' && user.role !== 'admin') {
        Alert.alert('Erreur', 'Accès administrateur requis');
        return;
      }

      if (userType === 'admin') {
        navigation.navigate('AdminScreen', {
          user: { prenom: user.prenom, profileImage: user.profileImage }
        });
      } else {
        navigation.navigate('UserScreen');
      }

      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
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
      
      if (userType === 'admin') {
        if (!adminKey) {
          Alert.alert('Erreur', 'Veuillez saisir le mot clé administrateur');
          return;
        }

        if (adminKey !== 'ADMIN123') {
          Alert.alert('Erreur', 'Mot clé administrateur incorrect');
          return;
        }

        const existingAdmin = allUsers.find(user => user.role === 'admin');
        if (existingAdmin) {
          Alert.alert('Erreur', 'Un compte administrateur existe déjà. Un seul admin est autorisé.');
          return;
        }

        const emailExists = allUsers.find(user => user.email === signupEmail);
        if (emailExists) {
          Alert.alert('Erreur', 'Cet email est déjà utilisé.');
          return;
        }

        await addUser(
          signupEmail,
          signupEmail,
          signupPassword,
          'admin',
          null, null, null, null, null, null
        );

        Alert.alert('Succès', 'Compte administrateur créé avec succès');
      } else {
        const memberExists = allUsers.find(user => user.email === signupEmail);
        
        if (!memberExists) {
          Alert.alert('Erreur', 'Cet email n\'existe pas dans la liste des membres. Inscription impossible.');
          return;
        }

        if (memberExists.passwordHash && memberExists.passwordHash !== '') {
          Alert.alert('Erreur', 'Un compte existe déjà avec cet email. Utilisez la connexion.');
          return;
        }

        await addUser(
          memberExists.name || signupEmail,
          signupEmail,
          signupPassword,
          'user',
          memberExists.prenom,
          memberExists.etablissement,
          memberExists.niveau,
          memberExists.mention,
          memberExists.telephone,
          memberExists.profileImage
        );

        Alert.alert('Succès', 'Compte utilisateur créé avec succès');
      }

      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setAdminKey('');
      setIsLogin(true);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userType === 'admin' ? 'Espace Administrateur' : 'Espace Utilisateur'}
      </Text>

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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry={!showLoginPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowLoginPassword(!showLoginPassword)}
            >
              <Ionicons
                name={showLoginPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Se connecter" onPress={handleLogin} color="#17813cff" />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Votre adresse email</Text>
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
              <Text style={styles.label}>Mot clé d'administrateur</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mot clé"
                  value={adminKey}
                  onChangeText={setAdminKey}
                  autoCapitalize="none"
                  secureTextEntry={!showAdminKey}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowAdminKey(!showAdminKey)}
                >
                  <Ionicons
                    name={showAdminKey ? 'eye-off' : 'eye'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
          <Text style={styles.label}>Créer un mot de passe</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe *"
              value={signupPassword}
              onChangeText={setSignupPassword}
              secureTextEntry={!showSignupPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowSignupPassword(!showSignupPassword)}
            >
              <Ionicons
                name={showSignupPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirmer votre mot de passe</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirmer le mot de passe *"
              value={signupConfirmPassword}
              onChangeText={setSignupConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="S'inscrire" onPress={handleSignup} color="#212683ff" />
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    height: 40,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  eyeButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 2 },
  },
});

export default AuthScreen;