import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { Card } from '../components/Card';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HomeScreen() {
  const { tasks, toggleTask, streak, activities } = useApp();
  const router = useRouter();
  const [today, setToday] = useState('day');
  const [todayISO, setTodayISO] = useState('');

  useEffect(() => {
    const now = new Date();
    setToday(DAYS[now.getDay()]);
    setTodayISO(now.toISOString().slice(0, 10));
  }, []);

  const focusTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed).slice(0, 3);
  }, [tasks]);

  const completedToday = tasks.filter((t) => t.completed).length;
  const totalToday = tasks.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Happy {today}!</Text>
            <Text style={styles.subGreeting}>You have {totalToday - completedToday} tasks left today</Text>
          </View>
          <Image source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/69033c662132e9313f3d65b8_1777614097420_582563ae.png' }} style={styles.avatar} />
        </View>

        {/* Today's Focus */}
        <Card color={colors.mint} style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <Text style={styles.focusTitle}>Today's Focus</Text>
            <Ionicons name="flag-outline" size={22} color="#0B3B22" />
          </View>
          {focusTasks.length === 0 ? (
            <Text style={styles.emptyFocus}>All caught up! Add a new task to keep going.</Text>
          ) : (
            focusTasks.map((t) => (
              <Pressable key={t.id} style={styles.focusItem} onPress={() => toggleTask(t.id)}>
                <View style={[styles.checkCircle, t.completed && styles.checkCircleDone]}>
                  {t.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={[styles.focusItemText, t.completed && styles.strikethrough]}>{t.title}</Text>
              </Pressable>
            ))
          )}
        </Card>

        {/* Quick widgets */}
        <View style={styles.row2}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/timer/quick')}>
            <Card color={colors.coral} style={styles.widget}>
              <Ionicons name="timer-outline" size={32} color="#fff" />
              <Text style={styles.widgetBig}>25:00</Text>
              <Text style={styles.widgetLabel}>Deep Work</Text>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/note/new')}>
            <Card color={colors.golden} style={styles.widget}>
              <View style={styles.plusCircle}>
                <Ionicons name="add" size={28} color="#111" />
              </View>
              <Text style={styles.widgetLabelDark}>Quick Note</Text>
            </Card>
          </Pressable>
        </View>

        {/* Weekly Streak */}
        <Card color={colors.lavender} style={styles.streakCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>Weekly Streak</Text>
            <Text style={styles.streakSub}>Keep it up!</Text>
          </View>
          <View style={styles.streakRight}>
            <Ionicons name="flame" size={22} color="#111" />
            <Text style={styles.streakNum}>{streak}</Text>
          </View>
        </Card>

        {/* Today's Activities */}
        <Text style={styles.sectionTitle}>Today's Activities</Text>
        {activities.slice(0, 4).map((a) => {
          const done = !!todayISO && a.completedDates.includes(todayISO);
          return (
            <Pressable key={a.id} onPress={() => router.push(`/timer/${a.id}`)}>
              <Card style={styles.activityRow}>
                <View style={[styles.activityDot, { backgroundColor: a.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activitySub}>{a.preferredTime} · {a.duration}m</Text>
                </View>
                <View style={[styles.playBtn, done && { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name={done ? 'checkmark' : 'play'} size={16} color={done ? '#059669' : colors.primary} />
                </View>
              </Card>
            </Pressable>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 32, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 14, color: colors.subtext, marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  focusCard: { padding: 24, marginBottom: 16 },
  focusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  focusTitle: { fontSize: 22, fontWeight: '800', color: '#0B3B22' },
  focusItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#0B3B22', marginRight: 14, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: '#0B3B22' },
  focusItemText: { fontSize: 17, fontWeight: '600', color: '#0B3B22', flex: 1 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  emptyFocus: { color: '#0B3B22', opacity: 0.7, fontSize: 15 },
  row2: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  widget: { padding: 24, minHeight: 160, justifyContent: 'space-between' },
  widgetBig: { fontSize: 36, fontWeight: '900', color: '#fff' },
  widgetLabel: { fontSize: 16, color: '#fff', fontWeight: '700' },
  widgetLabelDark: { fontSize: 18, color: '#111', fontWeight: '800' },
  plusCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  streakCard: { flexDirection: 'row', alignItems: 'center', padding: 22, marginBottom: 16 },
  streakTitle: { fontSize: 20, fontWeight: '800', color: '#1E1B4B' },
  streakSub: { fontSize: 14, color: '#1E1B4B', opacity: 0.7, marginTop: 4 },
  streakRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakNum: { fontSize: 20, fontWeight: '800', color: '#111' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10 },
  activityDot: { width: 10, height: 40, borderRadius: 5, marginRight: 14 },
  activityTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  activitySub: { fontSize: 13, color: colors.subtext, marginTop: 2 },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
