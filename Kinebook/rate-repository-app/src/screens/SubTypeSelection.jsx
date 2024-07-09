import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

const background = require('../img/BackgroundLobby.jpeg');

const SubTypeSelection = ({ navigation, route }) => {
  const { kinesiologoId, pacienteId, type } = route.params;

  const handleSelect = (subType) => {
    navigation.navigate('Evaluaciones', { type, subType, kinesiologoId, pacienteId });
  };

  return (
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleSelect('Incapacidad')}>
            <Text style={styles.buttonText}>Incapacidad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleSelect('Psicologia')}>
            <Text style={styles.buttonText}>Psicología</Text>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#77CFAF',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SubTypeSelection;
