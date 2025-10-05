// database.js
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

let database = null;

// Ouvrir ou créer la base de données
export const getDatabase = async () => {
  if (!database) {
    try {
      database = await SQLite.openDatabaseAsync('membres.db');
      
      // Initialiser les tables si nécessaire
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL,
          salt TEXT NOT NULL,
          role TEXT NOT NULL,
          prenom TEXT,
          etablissement TEXT,
          niveau TEXT,
          mention TEXT,
          telephone TEXT,
          profileImage TEXT
        );

        CREATE TABLE IF NOT EXISTS revenus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          nom TEXT,
          prenom TEXT,
          date TEXT NOT NULL,
          montant REAL NOT NULL,
          motif TEXT,
          membreId INTEGER,
          nomActivite TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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

        CREATE TABLE IF NOT EXISTS historique (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          typeOperation TEXT NOT NULL,
          operation TEXT NOT NULL,
          details TEXT NOT NULL,
          montant REAL NOT NULL,
          dateOperation DATETIME DEFAULT CURRENT_TIMESTAMP,
          typeElement TEXT,
          elementId INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Base de données ouverte avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la base de données:', error);
      throw error;
    }
  }
  return database;
};

// Initialiser la base de données
export const initDatabase = async () => {
  try {
    await getDatabase();
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

// Générer un sel pour le hachage
const generateSalt = async () => {
  return await Crypto.randomUUID();
};

// Hasher le mot de passe avec le sel
export const hashPassword = async (password, salt) => {
  const combined = password + salt;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256, 
    combined
  );
};

// Ajouter un utilisateur
export const addUser = async (name, email, password, role, prenom, etablissement, niveau, mention, telephone, profileImage) => {
  try {
    const db = await getDatabase();
    const salt = await generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    const result = await db.runAsync(
      'INSERT INTO users (name, email, passwordHash, salt, role, prenom, etablissement, niveau, mention, telephone, profileImage) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, salt, role, prenom, etablissement, niveau, mention, telephone, profileImage]
    );
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'utilisateur:', error);
    throw error;
  }
};

// Obtenir un utilisateur par email
export const getUserByEmail = async (email) => {
  try {
    const db = await getDatabase();
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// Obtenir tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const db = await getDatabase();
    const users = await db.getAllAsync('SELECT * FROM users');
    return users;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, name, email, password, role, prenom, etablissement, niveau, mention, telephone, profileImage) => {
  try {
    const db = await getDatabase();
    
    if (password) {
      const salt = await generateSalt();
      const passwordHash = await hashPassword(password, salt);
      await db.runAsync(
        'UPDATE users SET name = ?, email = ?, passwordHash = ?, salt = ?, role = ?, prenom = ?, etablissement = ?, niveau = ?, mention = ?, telephone = ?, profileImage= ? WHERE id = ?',
        [name, email, passwordHash, salt, role, prenom, etablissement, niveau, mention, telephone, profileImage || null, id]
      );
    } else {
      await db.runAsync(
        'UPDATE users SET name = ?, email = ?, role = ?, prenom = ?, etablissement = ?, niveau = ?, mention = ?, telephone = ?, profileImage= ? WHERE id = ?',
        [name, email, role, prenom, etablissement, niveau, mention, telephone, profileImage || null, id]
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// === FONCTIONS POUR LES REVENUS ===

// Obtenir le total des revenus
export const getTotalRevenus = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT SUM(montant) as total FROM revenus');
    return result?.total || 0;
  } catch (error) {
    console.error('Erreur lors du calcul du total des revenus:', error);
    return 0;
  }
};

// Obtenir tous les revenus
export const getAllRevenus = async () => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM revenus ORDER BY date DESC');
  } catch (error) {
    console.error('Erreur lors de la récupération des revenus:', error);
    return [];
  }
};

// Ajouter un revenu
export const addRevenu = async (type, nom, prenom, date, montant, motif, membreId, nomActivite) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO revenus (type, nom, prenom, date, montant, motif, membreId, nomActivite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [type, nom, prenom, date, montant, motif, membreId, nomActivite]
    );
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du revenu:', error);
    throw error;
  }
};

// Mettre à jour un revenu
export const updateRevenu = async (id, type, nom, prenom, date, montant, motif, membreId, nomActivite) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE revenus SET type = ?, nom = ?, prenom = ?, date = ?, montant = ?, motif = ?, membreId = ?, nomActivite = ? WHERE id = ?',
      [type, nom, prenom, date, montant, motif, membreId, nomActivite, id]
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du revenu:', error);
    throw error;
  }
};

// Supprimer un revenu
export const deleteRevenu = async (id) => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM revenus WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erreur lors de la suppression du revenu:', error);
    throw error;
  }
};

// === FONCTIONS POUR LES DÉPENSES ===

// Obtenir le total des dépenses
export const getTotalDepenses = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT SUM(montant) as total FROM depenses');
    return result?.total || 0;
  } catch (error) {
    console.error('Erreur lors du calcul du total des dépenses:', error);
    return 0;
  }
};

// Obtenir toutes les dépenses
export const getAllDepenses = async () => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM depenses ORDER BY date DESC');
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    return [];
  }
};

// Ajouter une dépense
export const addDepense = async (type, date, montant, lieu, nombreParticipants, nomProduit, membreAcheteurId, membreAcheteur, typeCommunication, nomActivite, dateDebut, dateFin, lieuActivite, sousType) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO depenses (type, date, montant, lieu, nombreParticipants, nomProduit, membreAcheteurId, membreAcheteur, typeCommunication, nomActivite, dateDebut, dateFin, lieuActivite, sousType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type, date, montant, lieu, nombreParticipants, nomProduit, membreAcheteurId, membreAcheteur, typeCommunication, nomActivite, dateDebut, dateFin, lieuActivite, sousType]
    );
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense:', error);
    throw error;
  }
};

// Mettre à jour une dépense
export const updateDepense = async (id, type, date, montant, lieu, nombreParticipants, nomProduit, membreAcheteurId, membreAcheteur, typeCommunication, nomActivite, dateDebut, dateFin, lieuActivite, sousType) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE depenses SET type = ?, date = ?, montant = ?, lieu = ?, nombreParticipants = ?, nomProduit = ?, membreAcheteurId = ?, membreAcheteur = ?, typeCommunication = ?, nomActivite = ?, dateDebut = ?, dateFin = ?, lieuActivite = ?, sousType = ? WHERE id = ?',
      [type, date, montant, lieu, nombreParticipants, nomProduit, membreAcheteurId, membreAcheteur, typeCommunication, nomActivite, dateDebut, dateFin, lieuActivite, sousType, id]
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    throw error;
  }
};

// Supprimer une dépense
export const deleteDepense = async (id) => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM depenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    throw error;
  }
};

// === FONCTIONS POUR L'HISTORIQUE ===

// Obtenir l'historique
export const getHistorique = async (typeOperation = null) => {
  try {
    const db = await getDatabase();
    let query = 'SELECT * FROM historique';
    let params = [];
    
    if (typeOperation) {
      query += ' WHERE typeOperation = ?';
      params = [typeOperation];
    }
    
    query += ' ORDER BY dateOperation DESC';
    
    return await db.getAllAsync(query, params);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

// Vider l'historique
export const clearHistorique = async () => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM historique');
  } catch (error) {
    console.error('Erreur lors du vidage de l\'historique:', error);
    throw error;
  }
};