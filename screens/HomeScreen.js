import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <Text style={styles.appName}>Veuillez choisir votre profession </Text>
      <View style={styles.section}>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AuthScreen', { userType: 'admin' })}
          >
            <Image
              source={require('../assets/adm.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Administrateur</Text>
          </TouchableOpacity>
        </View>

      </View>

      <View style={styles.section}>

        <View style={styles.buttonContainer}>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AuthScreen', { userType: 'user' })}
          >
            <Image
              source={require('../assets/userr.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.buttonText}>Utilisateur</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',

  },
  appName: {
    fontSize: 25,
    fontWeight: 'italic',
    color: 'black',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    width: '80%',
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,

  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
    color: '#444',
  },
  buttonContainer: {
    marginVertical: 5,
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    justifyContent: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -30,
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 