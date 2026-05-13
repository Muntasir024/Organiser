import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activities, addFocusMinutes, toggleActivityToday } = useApp();
  const activity = activities.find((a) => a.id === id);
  const totalSeconds = (activity?.duration || 25) * 60;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const interval = useRef<any>(null);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(interval.current);
            setRunning(false);
            addFocusMinutes(activity?.duration || 25);
            if (activity) toggleActivityToday(activity.id);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [running]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  const progress = remaining / totalSeconds;
  const circumference = 2 * Math.PI * 130;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>{(activity?.title || 'Deep Work').toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.timerArea}>
        <View style={styles.ringOuter}>
          <View style={[styles.ring, { borderColor: progress > 0.5 ? colors.primary : '#22D3EE' }]}>
            <Text style={styles.timeText}>{minutes}:{seconds}</Text>
          </View>
        </View>
        <Text style={styles.subtle}>{running ? 'Stay focused' : remaining === 0 ? 'Session complete!' : 'Paused'}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.stopBtn} onPress={() => router.back()}>
          <View style={styles.stopSquare} />
        </Pressable>
        <Pressable style={styles.playBtn} onPress={() => setRunning((r) => !r)}>
          <Ionicons name={running ? 'pause' : 'play'} size={32} color="#22D3EE" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#9CA3AF', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  timerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringOuter: { width: 280, height: 280, borderRadius: 140, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 260, height: 260, borderRadius: 130, borderWidth: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#22D3EE', shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 } },
  timeText: { color: '#fff', fontSize: 64, fontWeight: '900' },
  subtle: { color: '#6B7280', fontSize: 14, marginTop: 24 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingBottom: 60 },
  stopBtn: { width: 70, height: 70, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
  stopSquare: { width: 22, height: 22, backgroundColor: '#fff', borderRadius: 4 },
  playBtn: { width: 90, height: 90, borderRadius: 22, borderWidth: 2, borderColor: '#22D3EE', alignItems: 'center', justifyContent: 'center' },
});
