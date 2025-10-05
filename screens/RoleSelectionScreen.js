
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir votre rôle</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Administrateur"
          onPress={() => navigation.navigate('LoginScreen', { userType: 'admin' })}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Utilisateur"
          onPress={() => navigation.navigate('LoginScreen', { userType: 'user' })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});

export default RoleSelectionScreen;