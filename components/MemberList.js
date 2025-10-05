import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';

const MemberList = ({ members, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.prenom && member.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (member.telephone && member.telephone.includes(searchQuery))
  );

  const renderItem = ({ item }) => (
    <View style={styles.memberItem}>
      {item.profileImage && (
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name} {item.prenom} ({item.role})</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberDetails}>{item.etablissement} - {item.niveau} - {item.mention}</Text>
        <Text style={styles.memberDetails}>{item.telephone}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
          <Text style={styles.editButton}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
          <Text style={styles.deleteButton}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un membre..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredMembers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun membre trouvé</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Cercle parfait (50% du width/height)
    marginRight: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  memberEmail: {
    color: '#666',
    marginBottom: 2,
  },
  memberDetails: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default MemberList;