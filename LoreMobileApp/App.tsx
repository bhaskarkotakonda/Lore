/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from '@react-native-community/geolocation';

const DURATIONS = [3, 5, 10];
const MOODS = ['Adventure', 'History', 'Weird Trivia', 'Nature'];

const dummyAudio = {
  title: 'The Ghost Town Legend',
  duration: 180, // seconds
};

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locError, setLocError] = useState('');
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [mood, setMood] = useState(MOODS[0]);

  useEffect(() => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (error) => setLocError(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Dummy audio progress simulation
  useEffect(() => {
    let interval: any;
    if (playing && progress < dummyAudio.duration) {
      interval = setInterval(() => {
        setProgress((p) => (p < dummyAudio.duration ? p + 1 : p));
      }, 1000);
    } else if (!playing) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [playing, progress]);

  const togglePlay = () => setPlaying((p) => !p);
  const resetAudio = () => {
    setProgress(0);
    setPlaying(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Lore: Audio Storytelling</Text>
      <View style={styles.audioPlayer}>
        <Text style={styles.audioTitle}>{dummyAudio.title}</Text>
        <Text style={styles.audioTime}>{Math.floor(progress/60)}:{('0'+(progress%60)).slice(-2)} / {Math.floor(dummyAudio.duration/60)}:{('0'+(dummyAudio.duration%60)).slice(-2)}</Text>
        {/* Replace with Slider for real app */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, {width: `${(progress/dummyAudio.duration)*100}%`}]} />
        </View>
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.button} onPress={togglePlay}>
            <Text style={styles.buttonText}>{playing ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={resetAudio}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.optionsRow}>
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>Duration</Text>
          {/* Replace Picker with @react-native-picker/picker for real app */}
          <Picker
            selectedValue={duration}
            style={styles.picker}
            onValueChange={(itemValue) => setDuration(itemValue)}>
            {DURATIONS.map((d) => (
              <Picker.Item key={d} label={`${d} min`} value={d} />
            ))}
          </Picker>
        </View>
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>Mood</Text>
          <Picker
            selectedValue={mood}
            style={styles.picker}
            onValueChange={(itemValue) => setMood(itemValue)}>
            {MOODS.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.locationBlock}>
        <Text style={styles.optionLabel}>Location</Text>
        {location ? (
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
          </Text>
        ) : locError ? (
          <Text style={styles.errorText}>{locError}</Text>
        ) : (
          <ActivityIndicator size="small" color="#888" />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  audioPlayer: { backgroundColor: '#f2f2f2', borderRadius: 12, padding: 20, marginBottom: 24 },
  audioTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  audioTime: { fontSize: 14, color: '#666', marginBottom: 8 },
  progressBarBg: { height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#4a90e2', borderRadius: 4 },
  audioControls: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#4a90e2', padding: 10, borderRadius: 6, marginHorizontal: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  optionBlock: { flex: 1, marginHorizontal: 8 },
  optionLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  picker: { height: 40, width: '100%' },
  locationBlock: { alignItems: 'center', marginTop: 12 },
  locationText: { fontSize: 14, color: '#333' },
  errorText: { color: 'red', fontSize: 14 },
});

export default App;
