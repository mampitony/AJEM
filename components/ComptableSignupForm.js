import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";


const ComptableSignupForm = ({navigation}) => {

    const [nom, setNom] = useState('');
    const [motifs, setMotifs] = useState('');
    const [montant, setMontant] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = async () => {
        if (!nom || !motifs || !montant || !date) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
    }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cotisation</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom *"
        value={nom}
        onChangeText={setNom}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Cotisation ou droit ou sortie ou ... *"
        value={motifs}
        onChangeText={setMotifs}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Montant *"
        value={montant}
        onChangeText={setMontant}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Date *"
        value={date}
        onChangeText={setDate}
      />

      <View style={styles.buttons}>
        <Button title="Annuler" onPress={() => navigation.goBack()} color="#999" />
        <Button title="Ajouter" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}