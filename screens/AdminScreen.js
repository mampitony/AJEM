
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal } from 'react-native';
import { getAllUsers, deleteUser } from '../database';
import MemberList from '../components/MemberList';
import MemberForm from '../components/MemberForm';
import { Image } from 'react-native';

const AdminScreen = ({ navigation, route }) => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isAdminForm, setIsAdminForm] = useState(false);
  const { user } = route.params || {}; // Récupérer les données de l'utilisateur connecté

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const users = await getAllUsers();
      setMembers(users);
    } catch (error) {
      console.error('Erreur lors du chargement des membres: ', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsAdminForm(false);
    setShowForm(true);
  };

  const handleAddAdmin = () => {
    setEditingMember(null);
    setIsAdminForm(true);
    setShowForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAdminForm(member.role === 'admin');
    setShowForm(true);
  };

  const handleDeleteMember = async (id) => {
    try {
      Alert.alert(
        'Confirmation',
        'Êtes-vous sûr de vouloir supprimer ce membre ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
              await deleteUser(id);
              await loadMembers();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la suppression: ', error);
      Alert.alert('Erreur', 'Impossible de supprimer le membre');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(null);
    loadMembers();
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec prénom et photo de profil */}
      <View style={styles.header}>
        {user?.profileImage && (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
        )}
        <Text style={styles.title}>{user?.prenom || 'Gestion des Membres'}</Text>
      </View>
      
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button title="Ajouter un membre" onPress={handleAddMember} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Ajouter un admin" onPress={handleAddAdmin} color="#ff5722" />
        </View>
      </View>
      
      <MemberList 
        members={members} 
        onEdit={handleEditMember} 
        onDelete={handleDeleteMember} 
      />
      
      <Modal
        visible={showForm}
        animationType="slide"
        onRequestClose={handleFormClose}
      >
        <MemberForm 
          member={editingMember} 
          onClose={handleFormClose}
          isAdmin={isAdminForm}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default AdminScreen;