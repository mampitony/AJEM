import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { addUser, getUserByEmail, getAllUsers } from '../database';
import { Picker } from '@react-native-picker/picker';

const AdminSignupForm = ({ navigation }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [niveau, setNiveau] = useState('');
  const [mention, setMention] = useState('');
  const [telephone, setTelephone] = useState('');
  const [roleMembre, setRoleMembre] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9+\s()-]{10,}$/;
    return regex.test(phone);
  };

  const handleSubmit = async () => {
    if (!nom || !prenom || !email || !password || !confirmPassword || !etablissement || !niveau || !mention || !telephone || !roleMembre) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Format d\'email invalide. Il doit contenir @ et .');
      return;
    }

    if (!validatePhone(telephone)) {
      Alert.alert('Erreur', 'Format de téléphone invalide');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert('Erreur', 'Cet email est déjà utilisé');
        return;
      }

      const users = await getAllUsers();
      const count = users.filter(u => u.role === roleMembre).length;

      const limitedRoles = {
        "President": 1,
        "Vice President": 1,
        "Tresorier": 1,
        "Commissaire au compte": 2
      };

      if (limitedRoles[roleMembre] && count >= limitedRoles[roleMembre]) {
        Alert.alert('Erreur', `Le rôle ${roleMembre} est limité à ${limitedRoles[roleMembre]} membre(s).`);
        return;
      }

      // Ajout d'un nouvel administrateur avec tous les champs
      await addUser(nom, email, password, roleMembre, prenom, etablissement, niveau, mention, telephone);
      Alert.alert('Succès', 'Administrateur ajouté avec succès');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inscription d'un administrateur</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom *"
        value={nom}
        onChangeText={setNom}
      />

      <TextInput
        style={styles.input}
        placeholder="Prénom *"
        value={prenom}
        onChangeText={setPrenom}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Role du Membre *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={roleMembre}
          onValueChange={(itemValue) => setRoleMembre(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Président" value="President" />
          <Picker.Item label="Vice Président" value="Vice President" />
          <Picker.Item label="Tresorier" value="Tresorier" />
          <Picker.Item label="Commissaire au compte" value="Commissaire au compte" />
          <Picker.Item label="Conseiller" value="Conseiller" />
          <Picker.Item label="Communication" value="Communication" />
          <Picker.Item label="Utilisateur" value="Utilisateur" />

        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Établissement *"
        value={etablissement}
        onChangeText={setEtablissement}
      />

      <TextInput
        style={styles.input}
        placeholder="Niveau *"
        value={niveau}
        onChangeText={setNiveau}
      />

      <TextInput
        style={styles.input}
        placeholder="Mention *"
        value={mention}
        onChangeText={setMention}
      />

      <TextInput
        style={styles.input}
        placeholder="Téléphone *"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.buttons}>
        <Button title="Annuler" onPress={() => navigation.goBack()} color="#999" />
        <Button title="Ajouter" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default AdminSignupForm;