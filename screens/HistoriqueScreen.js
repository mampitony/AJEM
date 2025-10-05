// screens/HistoriqueScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getDatabase } from '../database';

// Fonction pour ajouter une entrée dans l'historique (à appeler depuis RevenuScreen et DepenseScreen)
export const ajouterHistorique = async (typeOperation, operation, details, montant, typeElement, elementId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO historique (typeOperation, operation, details, montant, typeElement, elementId) VALUES (?, ?, ?, ?, ?, ?)',
      [typeOperation, operation, details, montant, typeElement, elementId]
    );
  } catch (error) {
    console.error('Erreur lors de l\'ajout dans l\'historique:', error);
  }
};

const HistoriqueScreen = () => {
  const [sectionActive, setSectionActive] = useState('Revenus');
  const [historiqueRevenus, setHistoriqueRevenus] = useState([]);
  const [historiqueDepenses, setHistoriqueDepenses] = useState([]);
  const [historiqueComplet, setHistoriqueComplet] = useState([]);

  // Charger l'historique depuis la base de données
  useEffect(() => {
    const loadHistorique = async () => {
      try {
        const db = await getDatabase();
        
        // Créer la table d'historique si elle n'existe pas
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS historique (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            typeOperation TEXT NOT NULL, -- 'revenu' ou 'depense'
            operation TEXT NOT NULL, -- 'ajout', 'modification', 'suppression'
            details TEXT NOT NULL,
            montant REAL NOT NULL,
            dateOperation DATETIME DEFAULT CURRENT_TIMESTAMP,
            typeElement TEXT, -- 'Sponsorts', 'Cotisation', 'Activités', 'Déplacement', etc.
            elementId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Charger l'historique des revenus et dépenses
        await loadHistoriqueData();
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    };

    loadHistorique();
  }, []);

  // Charger les données d'historique
  const loadHistoriqueData = async () => {
    try {
      const db = await getDatabase();
      
      // Historique des revenus
      const revenusHistory = await db.getAllAsync(`
        SELECT * FROM historique 
        WHERE typeOperation = 'revenu' 
        ORDER BY dateOperation DESC
      `);
      
      // Historique des dépenses
      const depensesHistory = await db.getAllAsync(`
        SELECT * FROM historique 
        WHERE typeOperation = 'depense' 
        ORDER BY dateOperation DESC
      `);
      
      // Historique complet (pour l'affichage mixte si nécessaire)
      const completHistory = await db.getAllAsync(`
        SELECT * FROM historique 
        ORDER BY dateOperation DESC
      `);

      setHistoriqueRevenus(revenusHistory);
      setHistoriqueDepenses(depensesHistory);
      setHistoriqueComplet(completHistory);
    } catch (error) {
      console.error('Erreur lors du chargement des données historiques:', error);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-MG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône et la couleur selon le type d'opération
  const getOperationStyle = (operation) => {
    switch (operation) {
      case 'ajout':
        return { icon: '➕', color: '#2ecc71', text: 'Ajout' };
      case 'modification':
        return { icon: '✏️', color: '#3498db', text: 'Modification' };
      case 'suppression':
        return { icon: '🗑️', color: '#e74c3c', text: 'Suppression' };
      default:
        return { icon: '📝', color: '#95a5a6', text: 'Opération' };
    }
  };

  // Obtenir l'icône selon le type d'élément
  const getTypeIcon = (typeElement) => {
    switch (typeElement) {
      case 'Sponsorts':
        return '🤝';
      case 'Cotisation':
        return '💰';
      case 'Activités':
        return '🎯';
      case 'Déplacement':
        return '🚗';
      case 'Achat':
        return '🛒';
      case 'Communication':
        return '📱';
      default:
        return '📊';
    }
  };

  // Rendu d'un élément d'historique
  const renderItem = ({ item }) => {
    const operationStyle = getOperationStyle(item.operation);
    const typeIcon = getTypeIcon(item.typeElement);

    return (
      <View style={[styles.item, { borderLeftColor: operationStyle.color }]}>
        <View style={styles.itemHeader}>
          <View style={styles.operationInfo}>
            <Text style={styles.operationIcon}>{operationStyle.icon}</Text>
            <Text style={[styles.operationText, { color: operationStyle.color }]}>
              {operationStyle.text}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.dateOperation)}</Text>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.typeSection}>
            <Text style={styles.typeIcon}>{typeIcon}</Text>
            <Text style={styles.typeText}>{item.typeElement}</Text>
          </View>
          
          <Text style={styles.details}>{item.details}</Text>
          
          <View style={styles.montantSection}>
            <Text style={[
              styles.montant,
              { color: item.typeOperation === 'revenu' ? '#2ecc71' : '#e74c3c' }
            ]}>
              {item.montant.toLocaleString('fr-MG')} Ar
            </Text>
            <Text style={styles.typeOperation}>
              {item.typeOperation === 'revenu' ? 'Revenu' : 'Dépense'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Filtrer les données selon la section active
  const getData = () => {
    return sectionActive === 'Revenus' ? historiqueRevenus : historiqueDepenses;
  };

  return (
    <View style={styles.container}>
      {/* Barre de navigation des sections */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, sectionActive === 'Revenus' && styles.navButtonActive]}
          onPress={() => setSectionActive('Revenus')}
        >
          <Text style={[styles.navText, sectionActive === 'Revenus' && styles.navTextActive]}>
            📈 Revenus
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, sectionActive === 'Dépenses' && styles.navButtonActive]}
          onPress={() => setSectionActive('Dépenses')}
        >
          <Text style={[styles.navText, sectionActive === 'Dépenses' && styles.navTextActive]}>
            📉 Dépenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getData().length}</Text>
          <Text style={styles.statLabel}>Opérations</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {getData().filter(item => item.operation === 'ajout').length}
          </Text>
          <Text style={styles.statLabel}>Ajouts</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {getData().filter(item => item.operation === 'modification').length}
          </Text>
          <Text style={styles.statLabel}>Modifications</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {getData().filter(item => item.operation === 'suppression').length}
          </Text>
          <Text style={styles.statLabel}>Suppressions</Text>
        </View>
      </View>

      {/* Liste de l'historique */}
      <FlatList
        data={getData()}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>
              Aucun historique {sectionActive === 'Revenus' ? 'de revenus' : 'de dépenses'} trouvé
            </Text>
          </View>
        }
        style={styles.list}
      />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 14,
  },
  navTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0163d2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#0163d2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  operationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  operationText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  itemContent: {
    flex: 1,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  montantSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  montant: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeOperation: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HistoriqueScreen;