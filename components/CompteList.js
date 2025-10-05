import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

const CompteList = ({ comptes, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComptes = comptes.filter(compte =>
    compte.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    compte.motifs.toLowerCase().includes(searchQuery.toLowerCase()) ||
    compte.date.toLowerCase().includes(searchQuery.toLowerCase) ||
    compte.montant.toLowerCase().includes(searchQuery.toLowerCase)
  );

  const renderItem = ({ item }) => (
    <View style={styles.compteItem}>
      <View style={styles.compteInfo}>
        <Text style={styles.compteName}>{item.name} {item.prenom}</Text>
        <Text style={styles.compteMotifs}>{item.motifs}</Text>
        <Text style={styles.compteDetails}>{item.motifs} - {item.nom} - {item.montant}</Text>
        <Text style={styles.compteDetails}>{item.date}</Text>
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
        placeholder="Rechercher un le nom ..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredComptes}
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

export default CompteList;