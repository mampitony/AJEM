
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllUsers, initDatabase, getDatabase, getTotalRevenus } from '../database';
import { ajouterHistorique } from './HistoriqueScreen';

const DepenseScreen = () => {
  const [sectionActive, setSectionActive] = useState('Déplacement');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [membres, setMembres] = useState([]);
  const [totalRevenus, setTotalRevenus] = useState(0);

  // États pour les champs du formulaire
  const [typeDepense, setTypeDepense] = useState('Déplacement');
  const [dateDepense, setDateDepense] = useState('');
  const [montantDepense, setMontantDepense] = useState('');
  const [lieuDeplacement, setLieuDeplacement] = useState('');
  const [nombreParticipants, setNombreParticipants] = useState('');
  const [nomProduit, setNomProduit] = useState('');
  const [membreAcheteur, setMembreAcheteur] = useState('');
  const [typeCommunication, setTypeCommunication] = useState('Crédit téléphone');
  const [nomActivite, setNomActivite] = useState('');
  const [dateDebutActivite, setDateDebutActivite] = useState('');
  const [dateFinActivite, setDateFinActivite] = useState('');
  const [lieuActivite, setLieuActivite] = useState('');

  // États pour gérer l'affichage du DateTimePicker
  const [showDatePicker, setShowDatePicker] = useState(null); // null, 'dateDepense', 'dateDebutActivite', 'dateFinActivite'

  const [depenses, setDepenses] = useState({
    Déplacement: [],
    Achat: [],
    Communication: [],
    Activités: []
  });

  useEffect(() => {
    const initDepensesTable = async () => {
      try {
        await initDatabase();
        const db = await getDatabase();
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS depenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            montant REAL NOT NULL,
            lieu TEXT,
            nombreParticipants INTEGER,
            nomProduit TEXT,
            membreAcheteurId INTEGER,
            membreAcheteur TEXT,
            typeCommunication TEXT,
            nomActivite TEXT,
            dateDebut TEXT,
            dateFin TEXT,
            lieuActivite TEXT,
            sousType TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await loadDepensesFromDB();
        await loadTotalRevenus();
        await loadMembres();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la table dépenses:', error);
      }
    };
    initDepensesTable();
  }, []);

  const loadMembres = async () => {
    try {
      const users = await getAllUsers();
      setMembres(users.filter(user => user.role === 'user' || user.role === 'admin'));
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const loadTotalRevenus = async () => {
    try {
      const total = await getTotalRevenus();
      setTotalRevenus(total || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du total des revenus:', error);
      setTotalRevenus(0);
    }
  };

  const loadDepensesFromDB = async () => {
    try {
      const db = await getDatabase();
      const depensesFromDB = await db.getAllAsync('SELECT * FROM depenses ORDER BY date DESC');
      const depensesOrganisees = {
        Déplacement: [],
        Achat: [],
        Communication: [],
        Activités: []
      };
      depensesFromDB.forEach(depense => {
        if (depense.type === 'Déplacement') {
          depensesOrganisees.Déplacement.push(depense);
        } else if (depense.type === 'Achat') {
          depensesOrganisees.Achat.push(depense);
        } else if (depense.type === 'Communication') {
          depensesOrganisees.Communication.push(depense);
        } else if (depense.type === 'Activités') {
          depensesOrganisees.Activités.push(depense);
        }
      });
      setDepenses(depensesOrganisees);
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    }
  };

  const saveDepenseToDB = async (depense) => {
    try {
      const db = await getDatabase();
      if (depense.id && depense.id.toString().includes('temp')) {
        const result = await db.runAsync(
          `INSERT INTO depenses (
            type, date, montant, lieu, nombreParticipants, nomProduit, 
            membreAcheteurId, membreAcheteur, typeCommunication, 
            nomActivite, dateDebut, dateFin, lieuActivite, sousType
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            depense.type, depense.date, depense.montant, depense.lieu, 
            depense.nombreParticipants, depense.nomProduit, depense.membreAcheteurId,
            depense.membreAcheteur, depense.typeCommunication, depense.nomActivite,
            depense.dateDebut, depense.dateFin, depense.lieuActivite, depense.sousType
          ]
        );
        return result.lastInsertRowId;
      } else {
        await db.runAsync(
          `UPDATE depenses SET 
            type = ?, date = ?, montant = ?, lieu = ?, nombreParticipants = ?, 
            nomProduit = ?, membreAcheteurId = ?, membreAcheteur = ?, 
            typeCommunication = ?, nomActivite = ?, dateDebut = ?, 
            dateFin = ?, lieuActivite = ?, sousType = ? 
           WHERE id = ?`,
          [
            depense.type, depense.date, depense.montant, depense.lieu, 
            depense.nombreParticipants, depense.nomProduit, depense.membreAcheteurId,
            depense.membreAcheteur, depense.typeCommunication, depense.nomActivite,
            depense.dateDebut, depense.dateFin, depense.lieuActivite, depense.sousType,
            depense.id
          ]
        );
        return depense.id;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la dépense:', error);
      throw error;
    }
  };

  const deleteDepenseFromDB = async (id) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM depenses WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      throw error;
    }
  };

  const calculerTotaux = () => {
    const totalDeplacement = depenses.Déplacement.reduce((sum, item) => sum + item.montant, 0);
    const totalAchat = depenses.Achat.reduce((sum, item) => sum + item.montant, 0);
    const totalCommunication = depenses.Communication.reduce((sum, item) => sum + item.montant, 0);
    const totalActivites = depenses.Activités.reduce((sum, item) => sum + item.montant, 0);
    const totalGeneral = totalDeplacement + totalAchat + totalCommunication + totalActivites;
    const soldeRestant = totalRevenus - totalGeneral;

    return {
      Déplacement: totalDeplacement,
      Achat: totalAchat,
      Communication: totalCommunication,
      Activités: totalActivites,
      General: totalGeneral,
      Solde: soldeRestant
    };
  };

  const totaux = calculerTotaux();

  const peutEffectuerDepense = (montant) => {
    if (totalRevenus === 0) {
      return { possible: false, message: "Vous ne pouvez pas effectuer cette dépense car votre compte est vide" };
    }
    if (montant > totaux.Solde) {
      return { 
        possible: false, 
        message: `Solde insuffisant. Montant disponible: ${totaux.Solde.toLocaleString('fr-MG')} Ar` 
      };
    }
    return { possible: true, message: "" };
  };

  const filteredDepenses = depenses[sectionActive].filter(item => {
    const searchLower = searchQuery.toLowerCase();
    switch (sectionActive) {
      case 'Déplacement':
        return item.lieu && item.lieu.toLowerCase().includes(searchLower);
      case 'Achat':
        return item.nomProduit && item.nomProduit.toLowerCase().includes(searchLower);
      case 'Communication':
        return item.sousType && item.sousType.toLowerCase().includes(searchLower);
      case 'Activités':
        return (item.nomActivite && item.nomActivite.toLowerCase().includes(searchLower)) || 
               (item.lieuActivite && item.lieuActivite.toLowerCase().includes(searchLower));
      default:
        return true;
    }
  });

  const resetForm = () => {
    setDateDepense('');
    setMontantDepense('');
    setLieuDeplacement('');
    setNombreParticipants('');
    setNomProduit('');
    setMembreAcheteur('');
    setTypeCommunication('Crédit téléphone');
    setNomActivite('');
    setDateDebutActivite('');
    setDateFinActivite('');
    setLieuActivite('');
    setEditItem(null);
    setShowDatePicker(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setTypeDepense(item.type);
      setDateDepense(item.date);
      setMontantDepense(item.montant.toString());
      if (item.type === 'Déplacement') {
        setLieuDeplacement(item.lieu || '');
        setNombreParticipants(item.nombreParticipants ? item.nombreParticipants.toString() : '');
      } else if (item.type === 'Achat') {
        setNomProduit(item.nomProduit || '');
        setMembreAcheteur(item.membreAcheteurId || '');
      } else if (item.type === 'Communication') {
        setTypeCommunication(item.typeCommunication || 'Crédit téléphone');
      } else if (item.type === 'Activités') {
        setNomActivite(item.nomActivite || '');
        setDateDebutActivite(item.dateDebut || '');
        setDateFinActivite(item.dateFin || '');
        setLieuActivite(item.lieuActivite || '');
      }
    } else {
      resetForm();
      setTypeDepense(sectionActive);
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
      if (field === 'dateDepense') {
        setDateDepense(formattedDate);
      } else if (field === 'dateDebutActivite') {
        setDateDebutActivite(formattedDate);
      } else if (field === 'dateFinActivite') {
        setDateFinActivite(formattedDate);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const montant = parseFloat(montantDepense);
      const verification = peutEffectuerDepense(montant);
      if (!verification.possible) {
        Alert.alert('Erreur', verification.message);
        return;
      }

      if (!dateDepense || !montantDepense) {
        Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (date et montant)');
        return;
      }

      let nouvelleDepense = {};
      let operation = editItem ? 'modification' : 'ajout';
      let details = '';

      if (typeDepense === 'Déplacement') {
        if (!lieuDeplacement || !nombreParticipants) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs pour le déplacement');
          return;
        }
        nouvelleDepense = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Déplacement',
          date: dateDepense,
          montant: montant,
          lieu: lieuDeplacement,
          nombreParticipants: parseInt(nombreParticipants),
          sousType: 'Déplacement'
        };
        details = `Déplacement à ${lieuDeplacement} - ${nombreParticipants} participants`;
      } else if (typeDepense === 'Achat') {
        if (!nomProduit || !membreAcheteur) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs pour l\'achat');
          return;
        }
        const membre = membres.find(m => m.id === membreAcheteur);
        nouvelleDepense = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Achat',
          date: dateDepense,
          montant: montant,
          nomProduit: nomProduit,
          membreAcheteur: membre ? `${membre.name} ${membre.prenom}` : '',
          membreAcheteurId: membreAcheteur,
          sousType: 'Achat'
        };
        details = `Achat: ${nomProduit} - Acheté par: ${membre ? `${membre.name} ${membre.prenom}` : ''}`;
      } else if (typeDepense === 'Communication') {
        nouvelleDepense = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Communication',
          date: dateDepense,
          montant: montant,
          typeCommunication: typeCommunication,
          sousType: typeCommunication
        };
        details = `Communication: ${typeCommunication}`;
      } else if (typeDepense === 'Activités') {
        if (!nomActivite || !dateDebutActivite || !dateFinActivite || !lieuActivite) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs pour l\'activité');
          return;
        }
        nouvelleDepense = {
          id: editItem ? editItem.id : `temp-${Date.now()}`,
          type: 'Activités',
          date: dateDepense,
          montant: montant,
          nomActivite: nomActivite,
          dateDebut: dateDebutActivite,
          dateFin: dateFinActivite,
          lieuActivite: lieuActivite,
          sousType: 'Activité'
        };
        details = `Activité: ${nomActivite} - Lieu: ${lieuActivite}`;
      }

      const savedId = await saveDepenseToDB(nouvelleDepense);
      nouvelleDepense.id = savedId || nouvelleDepense.id;

      await ajouterHistorique(
        'depense',
        operation,
        details,
        montant,
        typeDepense,
        nouvelleDepense.id
      );

      if (editItem) {
        setDepenses(prev => ({
          ...prev,
          [typeDepense]: prev[typeDepense].map(item => item.id === editItem.id ? nouvelleDepense : item)
        }));
      } else {
        setDepenses(prev => ({
          ...prev,
          [typeDepense]: [...prev[typeDepense], nouvelleDepense]
        }));
      }

      setModalVisible(false);
      resetForm();
      Alert.alert('Succès', editItem ? 'Dépense modifiée avec succès' : 'Dépense ajoutée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              const depenseASupprimer = depenses[sectionActive].find(item => item.id === id);
              let details = '';
              if (depenseASupprimer) {
                if (depenseASupprimer.type === 'Déplacement') {
                  details = `Déplacement à ${depenseASupprimer.lieu} - ${depenseASupprimer.nombreParticipants} participants`;
                } else if (depenseASupprimer.type === 'Achat') {
                  details = `Achat: ${depenseASupprimer.nomProduit} - Acheté par: ${depenseASupprimer.membreAcheteur}`;
                } else if (depenseASupprimer.type === 'Communication') {
                  details = `Communication: ${depenseASupprimer.sousType}`;
                } else if (depenseASupprimer.type === 'Activités') {
                  details = `Activité: ${depenseASupprimer.nomActivite} - Lieu: ${depenseASupprimer.lieuActivite}`;
                }
              }
              await deleteDepenseFromDB(id);
              await ajouterHistorique(
                'depense',
                'suppression',
                details,
                depenseASupprimer?.montant || 0,
                depenseASupprimer?.type || sectionActive,
                id
              );
              setDepenses(prev => ({
                ...prev,
                [sectionActive]: prev[sectionActive].filter(item => item.id !== id)
              }));
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la dépense: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        {item.type === 'Déplacement' && (
          <>
            <Text style={styles.titre}>Déplacement à {item.lieu}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.details}>Date: {item.date}</Text>
            <Text style={styles.details}>Participants: {item.nombreParticipants} personnes</Text>
          </>
        )}
        {item.type === 'Achat' && (
          <>
            <Text style={styles.titre}>Achat: {item.nomProduit}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.details}>Date: {item.date}</Text>
            <Text style={styles.details}>Acheté par: {item.membreAcheteur}</Text>
          </>
        )}
        {item.type === 'Communication' && (
          <>
            <Text style={styles.titre}>Communication: {item.sousType}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.details}>Date: {item.date}</Text>
          </>
        )}
        {item.type === 'Activités' && (
          <>
            <Text style={styles.titre}>Activité: {item.nomActivite}</Text>
            <Text style={styles.montant}>{item.montant.toLocaleString('fr-MG')} Ar</Text>
            <Text style={styles.details}>Lieu: {item.lieuActivite}</Text>
            <Text style={styles.details}>Période: {item.dateDebut} au {item.dateFin}</Text>
            <Text style={styles.details}>Date paiement: {item.date}</Text>
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
      <Text style={styles.totauxTitle}>État des Finances</Text>
      <View style={styles.totauxGrid}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Revenus</Text>
          <Text style={styles.totalMontantPositif}>{totalRevenus.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Dépenses</Text>
          <Text style={styles.totalMontantNegatif}>{totaux.General.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={[styles.totalItem, styles.soldeItem]}>
          <Text style={styles.soldeLabel}>Solde Disponible</Text>
          <Text style={totaux.Solde >= 0 ? styles.soldePositif : styles.soldeNegatif}>
            {totaux.Solde.toLocaleString('fr-MG')} Ar
          </Text>
        </View>
      </View>
      <View style={styles.detailsTotaux}>
        <Text style={styles.detailsTitle}>Détail des Dépenses:</Text>
        <View style={styles.detailLigne}>
          <Text style={styles.detailLabel}>Déplacements:</Text>
          <Text style={styles.detailMontant}>{totaux.Déplacement.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.detailLigne}>
          <Text style={styles.detailLabel}>Achats:</Text>
          <Text style={styles.detailMontant}>{totaux.Achat.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.detailLigne}>
          <Text style={styles.detailLabel}>Communication:</Text>
          <Text style={styles.detailMontant}>{totaux.Communication.toLocaleString('fr-MG')} Ar</Text>
        </View>
        <View style={styles.detailLigne}>
          <Text style={styles.detailLabel}>Activités:</Text>
          <Text style={styles.detailMontant}>{totaux.Activités.toLocaleString('fr-MG')} Ar</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {['Déplacement', 'Achat', 'Communication', 'Activités'].map(section => (
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
        data={filteredDepenses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune dépense trouvée</Text>
        }
        style={styles.list}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {editItem ? 'Modifier' : 'Ajouter'} une dépense
            </Text>
            <Text style={styles.label}>Type de dépense *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={typeDepense}
                onValueChange={(itemValue) => setTypeDepense(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Déplacement" value="Déplacement" />
                <Picker.Item label="Achat" value="Achat" />
                <Picker.Item label="Communication" value="Communication" />
                <Picker.Item label="Activités" value="Activités" />
              </Picker>
            </View>
            <Text style={styles.label}>Date de la dépense *</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="JJ/MM/AAAA"
                value={dateDepense}
                editable={false}
              />
              <TouchableOpacity
                style={styles.calendarIcon}
                onPress={() => setShowDatePicker('dateDepense')}
              >
                <Text style={styles.iconText}>📅</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker === 'dateDepense' && (
              <DateTimePicker
                value={dateDepense ? new Date(dateDepense.split('/').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, 'dateDepense')}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Montant en Ariary *"
              keyboardType="numeric"
              value={montantDepense}
              onChangeText={setMontantDepense}
            />
            {typeDepense === 'Déplacement' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Lieu du déplacement *"
                  value={lieuDeplacement}
                  onChangeText={setLieuDeplacement}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de participants *"
                  keyboardType="numeric"
                  value={nombreParticipants}
                  onChangeText={setNombreParticipants}
                />
              </>
            )}
            {typeDepense === 'Achat' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du produit *"
                  value={nomProduit}
                  onChangeText={setNomProduit}
                />
                <Text style={styles.label}>Membre acheteur *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={membreAcheteur}
                    onValueChange={(itemValue) => setMembreAcheteur(itemValue)}
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
              </>
            )}
            {typeDepense === 'Communication' && (
              <>
                <Text style={styles.label}>Type de communication *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={typeCommunication}
                    onValueChange={(itemValue) => setTypeCommunication(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Crédit téléphone" value="Crédit téléphone" />
                    <Picker.Item label="Internet" value="Internet" />
                    <Picker.Item label="Frais de communication" value="Frais de communication" />
                  </Picker>
                </View>
              </>
            )}
            {typeDepense === 'Activités' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'activité *"
                  value={nomActivite}
                  onChangeText={setNomActivite}
                />
                <Text style={styles.label}>Date de début *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ/MM/AAAA"
                    value={dateDebutActivite}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.calendarIcon}
                    onPress={() => setShowDatePicker('dateDebutActivite')}
                  >
                    <Text style={styles.iconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker === 'dateDebutActivite' && (
                  <DateTimePicker
                    value={dateDebutActivite ? new Date(dateDebutActivite.split('/').reverse().join('-')) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateDebutActivite')}
                  />
                )}
                <Text style={styles.label}>Date de fin *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ/MM/AAAA"
                    value={dateFinActivite}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.calendarIcon}
                    onPress={() => setShowDatePicker('dateFinActivite')}
                  >
                    <Text style={styles.iconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker === 'dateFinActivite' && (
                  <DateTimePicker
                    value={dateFinActivite ? new Date(dateFinActivite.split('/').reverse().join('-')) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateFinActivite')}
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Lieu de l'activité *"
                  value={lieuActivite}
                  onChangeText={setLieuActivite}
                />
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
    padding: 10,
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#0163d2',
  },
  navText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
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
    marginBottom: 10,
  },
  totalItem: {
    width: '48%',
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  soldeItem: {
    width: '100%',
    backgroundColor: '#e8f5e8',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  soldeLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalMontantPositif: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  totalMontantNegatif: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  soldePositif: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  soldeNegatif: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  detailsTotaux: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  detailLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailMontant: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
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
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  titre: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  montant: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  details: {
    color: '#666',
    marginBottom: 3,
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
    fontSize: 12,
  },
  deleteButton: {
    color: 'red',
    fontSize: 12,
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

export default DepenseScreen;