import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from "react-native";

const AcceuilScreen = ({ navigation }) => {
    return (
        <ImageBackground 
            source={require('../assets/comptabilite.jpg')} // Changed to comptabilite.jpg as per your request
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <Text style={styles.appName}>ASSOCIATIONS DES JEUNES ETUDIANTS DE MAHASOABE</Text>

                </View>
                
                <View style={styles.content}>
                    <Text style={styles.welcomeTitle}>Bienvenue</Text>
                    <Text style={styles.welcomeTitle}>Tongasoa</Text>
                  
                    <Image 
                        source={require('../assets/logo.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />                 
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => navigation.navigate('Connexion')}
                    >
                        <Text style={styles.buttonText}>Commencer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    image: {
        height: 147,
        width: 162,
        borderRadius: 1000,
        marginLeft: 100,
        marginBlock: 100,
        marginTop: 50,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'blue',
        textAlign: 'center',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        opacity: 0.9,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.9,
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
    },
});

export default AcceuilScreen;