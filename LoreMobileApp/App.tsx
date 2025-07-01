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
import { reverseGeocode, getNearbyAttractions } from './utils/locationApi';
import { Audio } from 'expo-av';

const DURATIONS = [3, 5, 10];
const MOODS = ['Adventure', 'History', 'Weird Trivia', 'Nature'];

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locError, setLocError] = useState('');
  const [duration, setDuration] = useState<number>(DURATIONS[0]);
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [placeInfo, setPlaceInfo] = useState<{ city: string; county: string; state: string; displayName: string } | null>(null);
  const [nearby, setNearby] = useState<{ name: string; distance: number }[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  useEffect(() => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingPlace(true);
        try {
          const info = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setPlaceInfo(info);
          try {
            const pois = await getNearbyAttractions(pos.coords.latitude, pos.coords.longitude);
            setNearby(pois);
          } catch (e) {
            setNearby([]);
          }
        } catch (e) {
          setPlaceInfo(null);
        }
        setLoadingPlace(false);
      },
      (error) => setLocError(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Extract location keywords (city, county, state, POIs) and limit to 5
  const locationKeywords = [
    ...(placeInfo ? [placeInfo.city, placeInfo.county, placeInfo.state].filter(Boolean) : []),
    ...nearby.map((poi) => poi.name),
  ].slice(0, 5);

  // Audio player logic with expo-av
  useEffect(() => {
    let isMounted = true;
    let playbackObj: Audio.Sound | null = null;
    async function loadAudio() {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      if (typeof audioUrl === 'string' && audioUrl.length > 0) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: false }
          );
          if (isMounted) setSound(newSound);
        } catch (e) {
          setAudioError('Failed to load audio');
        }
      }
    }
    loadAudio();
    return () => {
      isMounted = false;
      if (playbackObj) playbackObj.unloadAsync();
      if (sound) sound.unloadAsync();
    };
  }, [audioUrl]);

  const playAudio = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch {
        setAudioError('Playback failed');
      }
    }
  };
  const pauseAudio = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
      } catch {}
    }
  };
  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
      } catch {}
    }
  };

  // Submit handler: show tuple and play random open source audio
  const handleSubmit = async () => {
    // Show tuple in UI (location, time, mood)
    let tuple = `Location: ${selectedKeyword || ''}\nDuration: ${duration} min\nMood: ${mood}`;
    setAudioError(tuple); // Show tuple as info
    setAudioLoading(true);
    setAudioUrl(null);
    if (sound) {
      try { await sound.unloadAsync(); } catch {}
      setSound(null);
    }
    // Pick a random open source audio
    const freeAudios = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    ];
    const audioUrl = freeAudios[Math.floor(Math.random() * freeAudios.length)];
    setTimeout(() => {
      setAudioUrl(audioUrl);
      setAudioLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Lore: Audio Storytelling</Text>
      <View style={styles.keywordBlock}>
        <Text style={styles.optionLabel}>Choose a Location Keyword</Text>
        <View style={styles.keywordList}>
          {locationKeywords.map((kw, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.keywordCard, selectedKeyword === kw && styles.keywordCardSelected]}
              onPress={() => setSelectedKeyword(kw)}
            >
              <Text style={styles.keywordText}>{kw}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.optionsRow}>
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>Duration</Text>
          <Picker
            selectedValue={duration.toString()}
            onValueChange={(itemValue) => setDuration(Number(itemValue))}
          >
            {DURATIONS.map((d) => (
              <Picker.Item key={d} label={`${d} min`} value={d.toString()} />
            ))}
          </Picker>
        </View>
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>Mood</Text>
          <Picker
            selectedValue={mood}
            onValueChange={(itemValue) => setMood(itemValue.toString())}
          >
            {MOODS.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
      </View>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={!selectedKeyword || audioLoading}
      >
        <Text style={styles.submitButtonText}>{audioLoading ? 'Loading...' : 'Get Story'}</Text>
      </TouchableOpacity>
      <View style={styles.audioPlayer}>
        <Text style={styles.audioTitle}>{selectedKeyword}</Text>
        {audioLoading ? (
          <ActivityIndicator size="small" color="#888" />
        ) : audioError ? (
          <Text style={styles.errorText}>{audioError}</Text>
        ) : (sound && typeof audioUrl === 'string' && audioUrl.length > 0) ? (
          <View style={styles.audioControls}>
            <TouchableOpacity style={styles.button} onPress={playAudio}>
              <Text style={styles.buttonText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pauseAudio}>
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={stopAudio}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={styles.locationBlock}>
        <Text style={styles.optionLabel}>Location</Text>
        {location ? (
          <>
            <View style={styles.currentLocationCard}>
              <Text style={styles.currentLocationIcon}>📌</Text>
              <View style={{flex: 1}}>
                <Text style={styles.currentLocationCoords}>
                  Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                </Text>
                {/* Show full precision for debugging */}
                <Text style={styles.currentLocationCoords}>
                  (Raw: {location.latitude}, {location.longitude})
                </Text>
                <Text style={styles.locationSource}>
                  (Location may be based on GPS, WiFi, or network)
                </Text>
                {placeInfo && (
                  <>
                    <Text style={styles.currentLocationName}>
                      {placeInfo.city ? `${placeInfo.city}, ` : ''}{placeInfo.county ? `${placeInfo.county}, ` : ''}{placeInfo.state}
                    </Text>
                    <Text style={styles.currentLocationDisplay}>{placeInfo.displayName}</Text>
                  </>
                )}
              </View>
            </View>
            {loadingPlace ? (
              <ActivityIndicator size="small" color="#888" />
            ) : null}
            {placeInfo && nearby.length > 0 && (
              <View style={styles.nearbyContainer}>
                <Text style={styles.nearbyTitle}>Nearby Destinations (25mi):</Text>
                <View style={styles.nearbyList}>
                  {nearby.map((poi, i) => (
                    <View key={i} style={styles.nearbyCard}>
                      <Text style={styles.nearbyIcon}>📍</Text>
                      <View style={{flex: 1}}>
                        <Text style={styles.nearbyName}>{poi.name}</Text>
                        <Text style={styles.nearbyDistance}>{poi.distance} mi away</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
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
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 28, textAlign: 'center', letterSpacing: 0.5 },
  audioPlayer: { backgroundColor: '#f2f2f2', borderRadius: 16, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  audioTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  audioTime: { fontSize: 14, color: '#666', marginBottom: 12, textAlign: 'center' },
  progressBarBg: { height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden', marginBottom: 18 },
  progressBar: { height: 8, backgroundColor: '#4a90e2', borderRadius: 4 },
  audioControls: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  button: { backgroundColor: '#4a90e2', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6, marginHorizontal: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 16 },
  optionBlock: { flex: 1, marginHorizontal: 8 },
  optionLabel: { fontSize: 15, fontWeight: '500', marginBottom: 8, textAlign: 'center' },
  locationBlock: { alignItems: 'center', marginTop: 16, padding: 16, backgroundColor: '#f7f7f7', borderRadius: 10 },
  currentLocationCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0', width: '100%' },
  currentLocationIcon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  currentLocationCoords: { fontSize: 15, color: '#333', fontWeight: '500' },
  currentLocationName: { fontSize: 15, color: '#4a90e2', fontWeight: '600', marginTop: 2 },
  currentLocationDisplay: { fontSize: 13, color: '#666', marginTop: 2 },
  locationSource: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 6, textAlign: 'center' },
  nearbyContainer: { marginTop: 12, width: '100%' },
  nearbyTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#4a90e2', textAlign: 'center' },
  nearbyList: { gap: 8 },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#e0e0e0' },
  nearbyIcon: { fontSize: 22, marginRight: 10 },
  nearbyName: { fontSize: 15, fontWeight: '500', color: '#222' },
  nearbyDistance: { fontSize: 13, color: '#666' },
  errorText: { color: 'red', fontSize: 15, marginTop: 4 },
  keywordBlock: { marginBottom: 18 },
  keywordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  keywordCard: { backgroundColor: '#f2f2f2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, margin: 4, borderWidth: 1, borderColor: '#e0e0e0' },
  keywordCardSelected: { backgroundColor: '#4a90e2', borderColor: '#357ab8' },
  keywordText: { fontSize: 15, color: '#222' },
  submitButton: { backgroundColor: '#4a90e2', borderRadius: 8, paddingVertical: 12, marginVertical: 12, alignItems: 'center', opacity: 1 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});

export default App;
