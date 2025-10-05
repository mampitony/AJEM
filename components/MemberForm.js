import React, { useState, useEffect } from 'react';
import { View, Text, TextInput,Image, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { addUser, updateUser, getUserByEmail, getAllUsers } from '../database';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const MemberForm = ({ member, onClose, isAdmin = false }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [roleMembre, setRoleMembre] = useState('Utilisateur'); // Valeur par défaut corrigée
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [niveau, setNiveau] = useState('');
  const [mention, setMention] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (member) {
      setNom(member.name);
      setPrenom(member.prenom || '');
      setRoleMembre(member.role || 'Utilisateur'); // Utilisation de 'role' au lieu de 'RoleMembre'
      setEmail(member.email);
      setEtablissement(member.etablissement || '');
      setNiveau(member.niveau || '');
      setMention(member.mention || '');
      setTelephone(member.telephone || '');
      setProfileImage(member.profileImage || null);
    }
  }, [member]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9+\s()-]{10,}$/;
    return regex.test(phone);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing : true,
      aspect: [4, 4],
      quality: 1,

    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nom || !prenom || !email || !etablissement || !niveau || !mention || !telephone || !roleMembre) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
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

    if (isAdmin && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser && (!member || existingUser.id !== member.id)) {
        Alert.alert('Erreur', 'Cet email est déjà utilisé');
        return;
      }

      // Vérification des limites de rôles
      const users = await getAllUsers();
      const count = users.filter(u => u.role === roleMembre && (!member || u.id !== member.id)).length;

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

      if (member) {
        // Mise à jour d'un membre existant
        await updateUser(
          member.id,
          nom,
          email,
          password || null,
          roleMembre,
          prenom,
          etablissement,
          niveau,
          mention,
          telephone,
          profileImage
        );
        Alert.alert('Succès', 'Membre modifié avec succès');
      } else {
        // Ajout d'un nouveau membre
        await addUser(
          nom,
          email,
          password,
          isAdmin ? 'admin' : roleMembre,
          prenom,
          etablissement,
          niveau,
          mention,
          telephone,
          profileImage
        );
        Alert.alert('Succès', `${isAdmin ? 'Administrateur' : 'Membre'} ajouté avec succès`);
      }
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {member ? 'Modifier le membre' : `Ajouter un ${isAdmin ? 'administrateur' : 'membre'}`}
      </Text>
      <Text style={styles.label}>Noms du Membre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom *"
        value={nom}
        onChangeText={setNom}
      />
      <Text style={styles.label}>Prénoms du Membre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Prénom *"
        value={prenom}
        onChangeText={setPrenom}
      />
      <Text style={styles.label}>Email du Membre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Rôle du Membre *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={roleMembre}
          onValueChange={(itemValue) => setRoleMembre(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Président" value="President" />
          <Picker.Item label="Vice Président" value="Vice President" />
          <Picker.Item label="Trésorier" value="Tresorier" />
          <Picker.Item label="Commissaire au compte" value="Commissaire au compte" />
          <Picker.Item label="Conseiller" value="Conseiller" />
          <Picker.Item label="Communication" value="Communication" />
          <Picker.Item label="Utilisateur" value="Utilisateur" />
        </Picker>
      </View>
      <Text style={styles.label}>Nom de l'Etablissement*</Text>
      <TextInput
        style={styles.input}
        placeholder="Établissement *"
        value={etablissement}
        onChangeText={setEtablissement}
      />
      <Text style={styles.label}>Niveau *</Text>
      <TextInput
        style={styles.input}
        placeholder="Niveau *"
        value={niveau}
        onChangeText={setNiveau}
      />
      <Text style={styles.label}>Mention *</Text>
      <TextInput
        style={styles.input}
        placeholder="Mention *"
        value={mention}
        onChangeText={setMention}
      />
      <Text style={styles.label}>Contact*</Text>
      <TextInput
        style={styles.input}
        placeholder="Téléphone *"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      {isAdmin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </>
      )}

      <View style={styles.imageContainer}>
        <Button title="Ajouter une image de profil (facultatif)" onPress={pickImage} />
        {profileImage && <Image source={{ uri: profileImage }} style={styles.imagePreview} />}
      </View>

      <View style={styles.buttons}>
        <Button title="Annuler" onPress={onClose} color="#999" />
        <Button title={member ? "Modifier" : "Ajouter"} onPress={handleSubmit} />
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
    imageContainer: {
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 50,
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
  title: {
    fontSize: 20,
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
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
});

export default MemberForm;