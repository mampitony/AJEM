
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllUsers, getDatabase, initDatabase, addRevenu, updateRevenu, deleteRevenu } from '../database';
import { ajouterHistorique } from './HistoriqueScreen';

const RevenuScreen = () => {
  const [sectionActive, setSectionActive] = useState('Sponsorts');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [membres, setMembres] = useState([]);

  // États pour Sponsorts
  const [nomSponsort, setNomSponsort] = useState('');
  const [prenomSponsort, setPrenomSponsort] = useState('');
  const [dateSponsort, setDateSponsort] = useState('');
  const [montantSponsort, setMontantSponsort] = useState('');
  const [motifSponsort, setMotifSponsort] = useState('');

  // États pour Cotisation
  const [membreSelected, setMembreSelected] = useState('');
  const [dateCotisation, setDateCotisation] = useState('');
  const [montantCotisation, setMontantCotisation] = useState('');
  const [motifCotisation, setMotifCotisation] = useState('Mensuel');

  // États pour Activités
  const [nomActivite, setNomActivite] = useState('');
  const [dateActivite, setDateActivite] = useState('');
  const [montantActivite, setMontantActivite] = useState('');

  // État pour gérer l'affichage du DateTimePicker
  const [showDatePicker, setShowDatePicker] = useState(null); // null, 'dateSponsort', 'dateCotisation', 'dateActivite'

  const [revenus, setRevenus] = useState({
    Sponsorts: [],
    Cotisation: [],
    Activités: []
  });

  useEffect(() => {
    const initRevenus = async () => {
      try {
        await initDatabase();
        await loadRevenusFromDB();
        await loadMembres();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des revenus:', error);
      }
    };
    initRevenus();
  }, []);

  const loadMembres = async () => {
    try {
      const users = await getAllUsers();
      setMembres(users.filter(user => user.role === 'user' || user.role === 'admin'));
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const loadRevenusFromDB = async () => {
    try {
      const db = await getDatabase();
      const revenusFromDB = await db.getAllAsync('SELECT * FROM revenus ORDER BY date DESC');
      const revenusOrganisees = {
        Sponsorts: [],
        Cotisation: [],
        Activités: []
      };
      revenusFromDB.forEach(revenu => {
        if (revenu.type === 'Sponsorts') {
          revenusOrganisees.Sponsorts.push(revenu);
        } else if (revenu.type === 'Cotisation') {
          revenusOrganisees.Cotisation.push(revenu);
        } else if (revenu.type === 'Activités') {
          revenusOrganisees.Activités.push(revenu);
        }
      });
      setRevenus(revenusOrganisees);
    } catch (error) {
      console.error('Erreur lors du chargement des revenus:', error);
    }
  };

  const calculerTotaux = () => {
    const totalSponsorts = revenus.Sponsorts.reduce((sum, item) => sum + item.montant, 0);
    const totalCotisation = revenus.Cotisation.reduce((sum, item) => sum + item.montant, 0);
    const totalActivites = revenus.Activités.reduce((sum, item) => sum + item.montant, 0);
    const totalGeneral = totalSponsorts + totalCotisation + totalActivites;

    return {
      Sponsorts: totalSponsorts,
      Cotisation: totalCotisation,
      Activités: totalActivites,
      General: totalGeneral
    };
  };

  const totaux = calculerTotaux();

  const filteredRevenus = revenus[sectionActive].filter(item => {
    const searchLower = searchQuery.toLowerCase();
    switch (sectionActive) {
      case 'Sponsorts':
        return (item.nom && item.nom.toLowerCase().includes(searchLower)) || 
               (item.prenom && item.prenom.toLowerCase().includes(searchLower)) ||
               (item.motif && item.motif.toLowerCase().includes(searchLower));
      case 'Cotisation':
        return (item.nom && item.nom.toLowerCase().includes(searchLower)) || 
               (item.prenom && item.prenom.toLowerCase().includes(searchLower)) ||
               (item.motif && item.motif.toLowerCase().includes(searchLower));
      case 'Activités':
        return item.nomActivite && item.nomActivite.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const resetForm = () => {
    setNomSponsort('');
    setPrenomSponsort('');
    setDateSponsort('');
    setMontantSponsort('');
    setMotifSponsort('');
    setMembreSelected('');
    setDateCotisation('');
    setMontantCotisation('');
    setMotifCotisation('Mensuel');
    setNomActivite('');
    setDateActivite('');
    setMontantActivite('');
    setEditItem(null);
    setShowDatePicker(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      if (item.type === 'Sponsorts') {
        setNomSponsort(item.nom || '');
        setPrenomSponsort(item.prenom || '');
        setDateSponsort(item.date || '');
        setMontantSponsort(item.montant.toString() || '');
        setMotifSponsort(item.motif || '');
      } else if (item.type === 'Cotisation') {
        setMembreSelected(item.membreId || '');
        setDateCotisation(item.date || '');
        setMontantCotisation(item.montant.toString() || '');
        setMotifCotisation(item.motif || 'Mensuel');
      } else if (item.type === 'Activités') {
        setNomActivite(item.nomActivite || '');
        setDateActivite(item.date || '');
        setMontantActivite(item.montant.toString() || '');
      }
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  // Gestion du sélecteur de date
  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker(null);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('fr-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      if (field === 'dateSponsort') {
        setDateSponsort(formattedDate);
      } else if (field === 'dateCotisation') {
        setDateCotisation(formattedDate);
      } else if (field === 'dateActivite') {
        setDateActivite(formattedDate);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      let nouveauRevenu = {};
      let operation = editItem ? 'modification' : 'ajout';
      let details = '';
      let montant = 0;

      if (sectionActive === 'Sponsorts') {
        if (!nomSponsort || !prenomSponsort || !dateSponsort || !montantSponsort || !motifSponsort) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs');
          return;
        }
        montant = parseFloat(montantSponsort);
        nouveauRevenu = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Sponsorts',
          nom: nomSponsort,
          prenom: prenomSponsort,
          date: dateSponsort,
          montant: montant,
          motif: motifSponsort,
          membreId: null,
          nomActivite: null
        };
        details = `Sponsor: ${nomSponsort} ${prenomSponsort} - Motif: ${motifSponsort}`;
      } else if (sectionActive === 'Cotisation') {
        if (!membreSelected || !dateCotisation || !montantCotisation || !motifCotisation) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs');
          return;
        }
        montant = parseFloat(montantCotisation);
        const membre = membres.find(m => m.id === membreSelected);
        nouveauRevenu = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Cotisation',
          nom: membre ? membre.name : '',
          prenom: membre ? membre.prenom : '',
          date: dateCotisation,
          montant: montant,
          motif: motifCotisation,
          membreId: membreSelected,
          nomActivite: null
        };
        details = `Cotisation de ${membre ? `${membre.name} ${membre.prenom}` : ''} - Type: ${motifCotisation}`;
      } else if (sectionActive === 'Activités') {
        if (!nomActivite || !dateActivite || !montantActivite) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs');
          return;
        }
        montant = parseFloat(montantActivite);
        nouveauRevenu = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Activités',
          nom: null,
          prenom: null,
          date: dateActivite,
          montant: montant,
          motif: null,
          membreId: null,
          nomActivite: nomActivite
        };
        details = `Activité: ${nomActivite}`;
      }

      let savedId;
      if (editItem) {
        await updateRevenu(
          editItem.id,
          nouveauRevenu.type,
          nouveauRevenu.nom,
          nouveauRevenu.prenom,
          nouveauRevenu.date,
          nouveauRevenu.montant,
          nouveauRevenu.motif,
          nouveauRevenu.membreId,
          nouveauRevenu.nomActivite
        );
        savedId = editItem.id;
      } else {
        const result = await addRevenu(
          nouveauRevenu.type,
          nouveauRevenu.nom,
          nouveauRevenu.prenom,
          nouveauRevenu.date,
          nouveauRevenu.montant,
          nouveauRevenu.motif,
          nouveauRevenu.membreId,
          nouveauRevenu.nomActivite
        );
        savedId = result.lastInsertRowId;
      }
      nouveauRevenu.id = savedId;

      await ajouterHistorique(
        'revenu',
        operation,
        details,
        montant,
        sectionActive,
        nouveauRevenu.id
      );

      if (editItem) {
        setRevenus(prev => ({
          ...prev,
          [sectionActive]: prev[sectionActive].map(item => item.id === editItem.id ? nouveauRevenu : item)
        }));
      } else {
        setRevenus(prev => ({
          ...prev,
          [sectionActive]: [...prev[sectionActive], nouveauRevenu]
        }));
      }

      setModalVisible(false);
      resetForm();
      Alert.alert('Succès', editItem ? 'Revenu modifié avec succès' : 'Revenu ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce revenu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              const revenuASupprimer = revenus[sectionActive].find(item => item.id === id);
              let details = '';
              if (revenuASupprimer) {
                if (revenuASupprimer.type === 'Sponsorts') {
                  details = `Sponsor: ${revenuASupprimer.nom} ${revenuASupprimer.prenom} - Motif: ${revenuASupprimer.motif}`;
                } else if (revenuASupprimer.type === 'Cotisation') {
                  details = `Cotisation de ${revenuASupprimer.nom} ${revenuASupprimer.prenom} - Type: ${revenuASupprimer.motif}`;
                } else if (revenuASupprimer.type === 'Activités') {
                  details = `Activité: ${revenuASupprimer.nomActivite}`;
                }
              }
              await deleteRevenu(id);
              await ajouterHistorique(
                'revenu',
                'suppression',
                details,
                revenuASupprimer?.montant || 0,
                sectionActive,
                id
              );
              setRevenus(prev => ({
                ...prev,
                [sectionActive]: prev[sectionActive].filter(item => item.id !== id)
              }));
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le revenu: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        {item.type === 'Sponsorts' && (
          <>
            <Text style={styles.nom}>{item.nom} {item.prenom}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.motif}>{item.motif}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </>
        )}
        {item.type === 'Cotisation' && (
          <>
            <Text style={styles.nom}>{item.nom} {item.prenom}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.motif}>{item.motif}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </>
        )}
        {item.type === 'Activités' && (
          <>
            <Text style={styles.nom}>{item.nomActivite}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.date}>{item.date}</Text>
          </>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
          <Text style={styles.editButton}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
          <Text style={styles.deleteButton}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TotalSection = () => (
    <View style={styles.totauxContainer}>
      <Text style={styles.totauxTitle}>Totaux des Revenus</Text>
      <View style={styles.totauxGrid}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Sponsorts</Text>
          <Text style={styles.totalMontant}>{totaux.Sponsorts.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Cotisations</Text>
          <Text style={styles.totalMontant}>{totaux.Cotisation.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Activités</Text>
          <Text style={styles.totalMontant}>{totaux.Activités.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={[styles.totalItem, styles.totalGeneral]}>
          <Text style={styles.totalLabelGeneral}>Total Général</Text>
          <Text style={styles.totalMontantGeneral}>{totaux.General.toLocaleString('fr-MG')} Ar</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {['Sponsorts', 'Cotisation', 'Activités'].map(section => (
          <TouchableOpacity
            key={section}
            style={[styles.navButton, sectionActive === section && styles.navButtonActive]}
            onPress={() => setSectionActive(section)}
          >
            <Text style={[styles.navText, sectionActive === section && styles.navTextActive]}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TotalSection />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title={`Ajouter ${sectionActive}`} onPress={() => openModal()} />
      <FlatList
        data={filteredRevenus}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun revenu trouvé</Text>
        }
        style={styles.list}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {editItem ? 'Modifier' : 'Ajouter'} {sectionActive}
            </Text>
            {sectionActive === 'Sponsorts' && (
              <>
                <TextInput style={styles.input} placeholder="Nom du sponsor *" value={nomSponsort} onChangeText={setNomSponsort} />
                <TextInput style={styles.input} placeholder="Prénom du sponsor *" value={prenomSponsort} onChangeText={setPrenomSponsort} />
                <Text style={styles.label}>Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ/MM/AAAA"
                    value={dateSponsort}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.calendarIcon}
                    onPress={() => setShowDatePicker('dateSponsort')}
                  >
                    <Text style={styles.iconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker === 'dateSponsort' && (
                  <DateTimePicker
                    value={dateSponsort ? new Date(dateSponsort.split('/').reverse().join('-')) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateSponsort')}
                  />
                )}
                <TextInput style={styles.input} placeholder="Montant en Ariary *" keyboardType="numeric" value={montantSponsort} onChangeText={setMontantSponsort} />
                <TextInput style={styles.input} placeholder="Motif *" value={motifSponsort} onChangeText={setMotifSponsort} />
              </>
            )}
            {sectionActive === 'Cotisation' && (
              <>
                <Text style={styles.label}>Membre *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={membreSelected}
                    onValueChange={(itemValue) => setMembreSelected(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner un membre" value="" />
                    {membres.map(membre => (
                      <Picker.Item 
                        key={membre.id} 
                        value={membre.id} 
                        label={`${membre.name} ${membre.prenom}`} 
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.label}>Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ/MM/AAAA"
                    value={dateCotisation}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.calendarIcon}
                    onPress={() => setShowDatePicker('dateCotisation')}
                  >
                    <Text style={styles.iconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker === 'dateCotisation' && (
                  <DateTimePicker
                    value={dateCotisation ? new Date(dateCotisation.split('/').reverse().join('-')) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateCotisation')}
                  />
                )}
                <TextInput style={styles.input} placeholder="Montant en Ariary *" keyboardType="numeric" value={montantCotisation} onChangeText={setMontantCotisation} />
                <Text style={styles.label}>Type de cotisation *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={motifCotisation}
                    onValueChange={(itemValue) => setMotifCotisation(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Mensuel" value="Mensuel" />
                    <Picker.Item label="Annuel" value="Annuel" />
                    <Picker.Item label="Droits d'adhésion" value="Droits d'adhésion" />
                  </Picker>
                </View>
              </>
            )}
            {sectionActive === 'Activités' && (
              <>
                <TextInput style={styles.input} placeholder="Nom de l'activité *" value={nomActivite} onChangeText={setNomActivite} />
                <Text style={styles.label}>Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ/MM/AAAA"
                    value={dateActivite}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.calendarIcon}
                    onPress={() => setShowDatePicker('dateActivite')}
                  >
                    <Text style={styles.iconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker === 'dateActivite' && (
                  <DateTimePicker
                    value={dateActivite ? new Date(dateActivite.split('/').reverse().join('-')) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateActivite')}
                  />
                )}
                <TextInput style={styles.input} placeholder="Montant reçu en Ariary *" keyboardType="numeric" value={montantActivite} onChangeText={setMontantActivite} />
              </>
            )}
            <View style={styles.modalButtons}>
              <Button title="Annuler" onPress={() => setModalVisible(false)} color="#999" />
              <Button title={editItem ? "Modifier" : "Ajouter"} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
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
  navBar: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  navButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#0163d2',
  },
  navText: {
    color: '#666',
    fontWeight: 'bold',
  },
  navTextActive: {
    color: 'white',
  },
  totauxContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totauxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  totauxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  totalItem: {
    width: '48%',
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  totalGeneral: {
    width: '100%',
    backgroundColor: '#0163d2',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  totalLabelGeneral: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalMontant: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  totalMontantGeneral: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  nom: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  montant: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  motif: {
    color: '#666',
    marginBottom: 5,
    fontSize: 14,
  },
  date: {
    color: '#999',
    fontSize: 12,
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
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendarIcon: {
    padding: 10,
    marginLeft: 10,
  },
  iconText: {
    fontSize: 20,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default RevenuScreen;