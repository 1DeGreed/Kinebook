import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const dermatomas = require('../img/Dermatomas.jpg');
const background = require('../img/BackgroundLobby.jpeg');

const Evaluation = ({ route, navigation }) => {
  const { type, kinesiologoId, pacienteId } = route.params;
  const [answers, setAnswers] = useState({});
  const [irradiation, setIrradiation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [subType, setSubType] = useState('');

  const questions = {
    NeuroMuscular: [
      { segment: 'L2', mrc: '', description: '' },
      { segment: 'L3', mrc: '', description: '' },
      { segment: 'L4', mrc: '', description: '' },
      { segment: 'L5', mrc: '', description: '' },
      { segment: 'S1', mrc: '', description: '' },
    ],
    MusculoEsqueletico: [
      'Flexión columna:',
      'Extensión columna:',
      'Rotación derecha columna:',
      'Rotación izquierda columna:',
      'Inclinación izquierda columna:',
      'Inclinación derecha columna:',
      'Flexión cadera izquierda:',
      'Extensión cadera izquierda:',
      'Rotación interna cadera izquierda:',
      'Rotación externa cadera izquierda:',
      'Flexión cadera derecha:',
      'Extensión cadera derecha:',
      'Rotación interna cadera derecha:',
      'Rotación externa cadera derecha:',
    ],
    SensorioPerceptivo: [
      'Antigüedad del dolor:',
      'Localización:',
      'Intensidad (0-10):',
      'Características:',
      'Irradiación:',
      'Atenuantes y agravantes:',
      '¿Por dónde le duele?',
    ],
    Incapacidad: [
      "Me quedo en casa la mayor parte del tiempo por mi dolor de espalda",
      "Cambio de postura con frecuencia para intentar aliviar la espalda",
      "Debido a mi espalda, camino más lentamente de lo normal",
      "Debido a mi espalda, no puedo hacer ninguna de las faenas que habitualmente hago en casa",
      "Por mi espalda, uso el pasamanos para subir escaleras",
      "A causa de mi espalda, debo acostarme más a menudo para descansar",
      "Debido a mi espalda, necesito agarrarme a algo para levantarme de los sillones o sofás",
      "Por culpa de mi espalda, pido a los demás que me hagan las cosas",
      "Me visto más lentamente de lo normal a causa de mi espalda",
      "A causa de mi espalda, sólo me quedo de pie durante cortos períodos de tiempo",
      "A causa de mi espalda, procuro evitar inclinarme o arrodillarme",
      "Me cuesta levantarme de una silla por culpa de mi espalda",
      "Me duele la espalda casi siempre",
      "Me cuesta darme la vuelta en la cama por culpa de mi espalda",
      "Debido a mi dolor de espalda, no tengo mucho apetito",
      "Me cuesta ponerme los calcetines - o medias - por mi dolor de espalda",
      "Debido a mi dolor de espalda, tan solo ando distancias cortas",
      "Duermo peor debido a mi espalda",
      "Por mi dolor de espalda, deben ayudarme a vestirme",
      "Estoy casi todo el día sentado a causa de mi espalda",
      "Evito hacer trabajos pesados en casa, por culpa de mi espalda",
      "Por mi dolor de espalda, estoy más irritable y de peor humor de lo normal",
      "A causa de mi espalda, subo las escaleras más lentamente de lo normal",
      "Me quedo casi constantemente en la cama por mi espalda",
    ],
    Psicologia: [
      "La actividad física fue la causa de mi lumbalgia",
      "La actividad física hace que mi lumbalgia se agrave",
      "La actividad física podría lesionar mi columna lumbar",
      "No debería realizar actividades físicas que podrían agravar mi dolor",
      "No puedo realizar actividades físicas que podrían empeorar mi lumbalgia",
      "Mi lumbalgia fue causada por el trabajo o por un accidente de trabajo",
      "El trabajo agrava mi lumbalgia",
      "Tengo una demanda de indemnización por mi lumbalgia",
      "El trabajo es muy pesado para mí",
      "El trabajo hace o haría que mi lumbalgia empeore",
      "El trabajo puede dañar mi columna lumbar",
      "No debería hacer mi trabajo con mi dolor actual",
      "No puedo hacer mi trabajo con mi dolor actual",
      "No puedo hacer mi trabajo hasta que mi lumbalgia sea tratada",
      "No creo reintegrarme a mi trabajo antes de 3 meses",
      "No creo que sea capaz de integrarme a ese trabajo",
    ],
  };

  const setSubTypeAndResetAnswers = (itemValue) => {
    setSubType(itemValue);
    const newAnswers = {};
    setAnswers(newAnswers);
    setIsAnswered(false);
  };

  const validateNumberInput = (text) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 0 && num <= 6) {
      return text;
    }
    return '';
  };

  const handleChange = (text, key, field) => {
    const newAnswers = { ...answers };
    newAnswers[key] = newAnswers[key] || {};
    newAnswers[key][field] = text;
    setAnswers(newAnswers);

    const answered = Object.values(newAnswers).some(
      (question) => Object.values(question).some((value) => value.trim().length > 0)
    );
    setIsAnswered(answered);
  };

  const handleSubmit = () => {
    if (!isAnswered) {
      Alert.alert('Error', 'Debe responder al menos una pregunta antes de guardar la evaluación.');
      return;
    }

    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas guardar esta evaluación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: () => {
            const formattedAnswers = {
              ...answers,
              ...questions.NeuroMuscular.reduce((acc, question) => {
                if (answers[question.segment]) {
                  acc[question.segment] = {
                    mrc: answers[question.segment].mrc,
                    description: answers[question.segment].description,
                  };
                }
                return acc;
              }, {}),
            };

            fetch('http://192.168.100.45:3000/api/evaluaciones', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type,
                subType,
                answers: formattedAnswers,
                kinesiologoId,
                pacienteId,
                fecha: new Date(),
              }),
            })
              .then(response => response.json())
              .then(data => {
                if (data.message === 'Evaluacion agregada exitosamente') {
                  Alert.alert(
                    'Evaluación guardada',
                    '¿Quieres crear otra evaluación?',
                    [
                      {
                        text: 'No',
                        onPress: () => navigation.navigate('Lobby', { kinesiologoId }),
                      },
                      {
                        text: 'Sí',
                        onPress: () => navigation.navigate('SelectEvaluation', { kinesiologoId, pacienteId }),
                      },
                    ]
                  );
                } else {
                  console.error('Error en la respuesta del servidor:', data);
                }
              })
              .catch(error => console.error('Error al realizar la solicitud:', error));
          },
        },
      ]
    );
  };

  const renderNeuroMuscular = () => {
    const mrcOptions = ['Seleccione','M0', 'M1', 'M2', 'M3', 'M3+', 'M4-', 'M4', 'M4+', 'M5'];
    return questions[type].map((question, index) => (
      <View key={index} style={styles.segmentContainer}>
        <Text style={styles.segmentText}>{`Segmento ${question.segment}`}</Text>
        <Picker
          selectedValue={answers[question.segment]?.mrc || ''}
          style={styles.picker}
          onValueChange={(itemValue) => handleChange(itemValue, question.segment, 'mrc')}
        >
          {mrcOptions.map((option, i) => (
            <Picker.Item key={i} label={option} value={option} />
          ))}
        </Picker>
        <Text style={styles.descriptionLabel}>Descripción</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          onChangeText={(text) => handleChange(text, question.segment, 'description')}
          value={answers[question.segment]?.description || ''}
        />
      </View>
    ));
  };

  const renderSensorioPerceptivo = () => (
    <>
      <Text style={styles.questionText}>Antigüedad del dolor:</Text>
      <Picker
        selectedValue={answers['antiguedad'] || ''}
        onValueChange={(value) => handleChange(value, 'antiguedad', 'antiguedad')}
        style={styles.input}
      >
        <Picker.Item label="Seleccione" value="" />
        <Picker.Item label="Agudo" value="Agudo" />
        <Picker.Item label="Subagudo" value="Subagudo" />
        <Picker.Item label="Crónico" value="Crónico" />
      </Picker>

      <Text style={styles.questionText}>Localización:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleChange(text, 'localizacion', 'localizacion')}
        value={answers['localizacion'] || ''}
      />

      <Text style={styles.questionText}>Intensidad (0-10):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => handleChange(text, 'intensidad', 'intensidad')}
        value={answers['intensidad'] || ''}
      />

      <Text style={styles.questionText}>Características:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleChange(text, 'caracteristicas', 'caracteristicas')}
        value={answers['caracteristicas'] || ''}
      />

      <View style={styles.checkboxContainer}>
        <Text style={styles.checkboxLabel}>Irradiación</Text>
        <Switch
          value={irradiation}
          onValueChange={(newValue) => setIrradiation(newValue)}
        />
      </View>

      {irradiation && (
        <>
          <Text style={styles.questionText}>Zona de Irradiación:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange(text, 'zonaIrradiacion', 'zonaIrradiacion')}
            value={answers['zonaIrradiacion'] || ''}
          />
        </>
      )}

      <Text style={styles.questionText}>Atenuantes y agravantes:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleChange(text, 'atenuantesAgravantes', 'atenuantesAgravantes')}
        value={answers['atenuantesAgravantes'] || ''}
      />

      <Text style={styles.questionText}>¿Por dónde le duele?</Text>
      <Image source={dermatomas} style={styles.image} />
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleChange(text, 'seccionDolor', 'seccionDolor')}
        value={answers['seccionDolor'] || ''}
      />
    </>
  );

  const renderIncapacidad = () => (
    <>
      {questions.Incapacidad.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question}</Text>
          <Picker
            selectedValue={answers[question]?.response || ''}
            onValueChange={(value) => handleChange(value, question, 'response')}
            style={styles.input}
          >
            <Picker.Item label="Seleccione" value="" />
            <Picker.Item label="Sí" value="sí" />
            <Picker.Item label="No" value="no" />
          </Picker>
        </View>
      ))}
      <View style={styles.observationsContainer}>
        <Text style={styles.observationsLabel}>Observaciones:</Text>
        <TextInput
          style={styles.observationsInput}
          multiline
          onChangeText={(text) => handleChange(text, 'incapacidadObservaciones', 'observaciones')}
          value={answers['incapacidadObservaciones']?.observaciones || ''}
        />
      </View>
    </>
  );
  const renderPsicologia = () => (
    <>
      {questions.Psicologia.map((question, index) => (
        <View key={index} style={styles.psicologiaContainer}>
          <Text style={styles.IncapacidadLabel}>Responda de 0 a 6</Text>
          <Text style={styles.questionText}>{question}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            multiline
            maxLength={1}
            onChangeText={(text) => handleChange(validateNumberInput(text), question, 'answer')}
            value={answers[question]?.answer || ''}
          />
        </View>
      ))}
      <View style={styles.observationsContainer}>
        <Text style={styles.observationsLabel}>Observaciones:</Text>
        <TextInput
          style={styles.observationsInput}
          multiline
          onChangeText={(text) => handleChange(text, 'psicologiaObservaciones', 'observaciones')}
          value={answers['psicologiaObservaciones']?.observaciones || ''}
        />
      </View>
    </>
  );

  const renderMusculoEsqueletico = () => {
    return questions[type].map((question, index) => (
      <View key={index} style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
        <TextInput
          style={styles.input}
          value={answers[index]?.response || ''}
          onChangeText={(text) => handleChange(text, index, 'response')}
          multiline
        />
      </View>
    ));
  };
  
  const renderQuestions = () => {
    switch (type) {
      case 'NeuroMuscular':
        return renderNeuroMuscular();
      case 'MusculoEsqueletico':
        return questions[type].map((question, index) => (
          <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question}</Text>
          <Text style={styles.infoText}>(Rellene con grados de movilidad)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => handleChange(text, index, 'answer')}
            value={answers[index]?.answer || ''}
          />
        </View>
        ));
      case 'SensorioPerceptivo':
        return renderSensorioPerceptivo();
        case 'Cognitivo/Conductual':
          return (
            <>
              <Picker
                selectedValue={subType}
                style={styles.picker}
                onValueChange={setSubTypeAndResetAnswers}

              >
                <Picker.Item label="Seleccione" value="" />
                <Picker.Item label="Incapacidad" value="Incapacidad" />
                <Picker.Item label="Psicología" value="Psicología" />
              </Picker>
              {subType === 'Incapacidad' && renderIncapacidad()}
              {subType === 'Psicología' && renderPsicologia()}
              
            </>
          );
      default:
        return null;
    }
  };

  return (
    <ImageBackground source={background} style={styles.container}>
      <View style={styles.overlay}>
      <ScrollView>
        <Text style={styles.title}>{type}</Text>
        {renderQuestions()}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: isAnswered ? '#77CFAF' : '#CCCCCC' }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  IncapacidadLabel:{
    marginTop: 15,
    color: '#A6A0A0',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo blanco semi-transparente
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco semitransparente
    padding: 20,
  },  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C4C4C',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  segmentContainer: {
    marginBottom: 20,
  },
  segmentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C4C4C',
  },
  picker: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C4C4C',
    marginTop: 10,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 18,
    color: '#4C4C4C',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
  observationsContainer: {
    marginTop: 20,
  },
  observationsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C4C4C',
  },
  observationsInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    height: 80,
    textAlignVertical: 'top',
  },
});

export default Evaluation;
