import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Switch, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { Card } from '../components/Card';
import { WeeklyBarChart, ConsistencyHeatmap } from '../components/Chart';
import { AuthModal } from '../components/AuthModal';

export default function ProfileScreen() {
  const { user, tasks, notes, focusMinutes, streak, settings, updateSettings, resetData, activities, authUser, signOut, syncing } = useApp();
  const [tab, setTab] = useState<'stats' | 'consistency'>('stats');
  const [authVisible, setAuthVisible] = useState(false);


  const tasksDone = tasks.filter((t) => t.completed).length + 1241;
  const totalNotes = notes.length;
  const focusHours = (focusMinutes / 60).toFixed(1);

  // Random-ish weekly data for chart
  const weeklyData = [3, 5, 8, 4, 6, 2, 4];

  const handleExport = () => {
    const data = { tasks, notes, activities, settings, exportedAt: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'daily-organizer-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Export', 'Data prepared. (Mobile: implement file save)');
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Reset all local data?')) resetData();
    } else {
      Alert.alert('Reset Data', 'Clear all local data?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetData },
      ]);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Sign out? Your data will stay synced for next time.')) signOut();
    } else {
      Alert.alert('Sign Out', 'Sign out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ]);
    }
  };

  const isSignedIn = !!authUser;
  const displayName = isSignedIn ? (authUser!.email.split('@')[0]) : user.name;
  const displayHandle = isSignedIn ? authUser!.email : `${user.handle} · Joined ${user.joined}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Sync banner */}
        {!isSignedIn && (
          <Pressable style={styles.syncBanner} onPress={() => setAuthVisible(true)}>
            <View style={styles.syncBannerIcon}>
              <Ionicons name="cloud-offline-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncBannerTitle}>Sign in to sync</Text>
              <Text style={styles.syncBannerText}>Back up tasks, notes & activities across devices.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
        {isSignedIn && syncing && (
          <View style={[styles.syncBanner, { backgroundColor: '#ECFDF5' }]}>
            <ActivityIndicator size="small" color={colors.mint} />
            <Text style={[styles.syncBannerTitle, { color: '#065F46', marginLeft: 10 }]}>Syncing your data…</Text>
          </View>
        )}

        {/* Profile header */}
        <View style={styles.profileHead}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Pressable style={styles.editAvatar} onPress={() => !isSignedIn && setAuthVisible(true)}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.handle}>{displayHandle}</Text>
          {isSignedIn && (
            <View style={styles.cloudBadge}>
              <Ionicons name="cloud-done" size={12} color={colors.mint} />
              <Text style={styles.cloudBadgeText}>Cloud Synced</Text>
            </View>
          )}
        </View>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="checkmark-circle" size={18} color={colors.mint} />
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <Text style={styles.statValue}>{tasksDone.toLocaleString()}</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="flame" size={18} color={colors.golden} />
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <Text style={styles.statValue}>{streak} <Text style={styles.statUnit}>days</Text></Text>
          </Card>
        </View>

        <Card style={styles.fullStat}>
          <View style={styles.statHead}>
            <Ionicons name="timer-outline" size={18} color={colors.lavender} />
            <Text style={styles.statLabel}>Total Focus Hours</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.statValue}>{focusHours}</Text>
            <View style={styles.medal}>
              <Ionicons name="ribbon" size={22} color={colors.lavender} />
            </View>
          </View>
        </Card>

        <Card style={styles.fullStat}>
          <View style={styles.statHead}>
            <Ionicons name="document-text-outline" size={18} color={colors.coral} />
            <Text style={styles.statLabel}>Notes Created</Text>
          </View>
          <Text style={styles.statValue}>{totalNotes}</Text>
        </Card>

        {/* Tab toggles for analytics */}
        <View style={styles.toggleRow}>
          <Pressable style={[styles.toggle, tab === 'stats' && styles.toggleActive]} onPress={() => setTab('stats')}>
            <Text style={[styles.toggleText, tab === 'stats' && styles.toggleTextActive]}>Activity</Text>
          </Pressable>
          <Pressable style={[styles.toggle, tab === 'consistency' && styles.toggleActive]} onPress={() => setTab('consistency')}>
            <Text style={[styles.toggleText, tab === 'consistency' && styles.toggleTextActive]}>Consistency</Text>
          </Pressable>
        </View>

        {tab === 'stats' ? (
          <Card style={styles.chartCard}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Activity (Last 7 Days)</Text>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
            </View>
            <WeeklyBarChart data={weeklyData} peakIndex={2} />
          </Card>
        ) : (
          <Card style={styles.chartCard}>
            <Text style={styles.cardTitle}>Consistency</Text>
            <View style={{ height: 12 }} />
            <ConsistencyHeatmap />
          </Card>
        )}

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <Card style={styles.prefCard}>
          <PrefRow icon="moon-outline" label="Dark Mode" value={settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} />
          <PrefRow icon="volume-high-outline" label="Sound Effects" value={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
          <PrefRow icon="notifications-outline" label="Push Notifications" value={settings.pushNotifications} onChange={(v) => updateSettings({ pushNotifications: v })} />
          <PrefRow icon="phone-portrait-outline" label="Haptic Feedback" value={settings.hapticFeedback} onChange={(v) => updateSettings({ hapticFeedback: v })} last />
        </Card>

        <Pressable style={styles.actionRow} onPress={handleExport}>
          <Text style={styles.actionText}>Export Data</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleReset}>
          <Text style={[styles.actionText, { color: colors.coral }]}>Reset Local Data</Text>
          <Ionicons name="refresh" size={20} color={colors.coral} />
        </Pressable>

        {isSignedIn ? (
          <Pressable style={styles.logoutBtn} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Sign Out</Text>
            <Ionicons name="log-out-outline" size={20} color={colors.coral} />
          </Pressable>
        ) : (
          <Pressable style={styles.signInBtn} onPress={() => setAuthVisible(true)}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.signInText}>Sign In to Sync</Text>
          </Pressable>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
    </SafeAreaView>
  );
}


function PrefRow({ icon, label, value, onChange, last }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.prefRow, !last && styles.prefBorder]}>
      <View style={styles.prefIcon}>
        <Ionicons name={icon} size={18} color={colors.subtext} />
      </View>
      <Text style={styles.prefLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: '#D1D5DB' }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  profileHead: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarRing: { padding: 4, borderRadius: 60, borderWidth: 3, borderColor: colors.golden, position: 'relative' },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  editAvatar: { position: 'absolute', right: 2, bottom: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 12 },
  handle: { fontSize: 14, color: colors.subtext, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 18 },
  statHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statLabel: { fontSize: 13, color: colors.subtext, fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statUnit: { fontSize: 14, fontWeight: '600', color: colors.muted },
  fullStat: { padding: 18, marginBottom: 12 },
  medal: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 4, marginVertical: 12 },
  toggle: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontWeight: '700', color: colors.subtext },
  toggleTextActive: { color: '#fff' },
  chartCard: { padding: 20, marginBottom: 16 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1, marginVertical: 12, marginTop: 16 },
  prefCard: { padding: 0, marginBottom: 12 },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, gap: 12 },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  prefIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  prefLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  actionRow: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 16, marginBottom: 10 },
  actionText: { fontSize: 16, fontWeight: '700', color: colors.text },
  logoutBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 16, marginTop: 6 },
  logoutText: { fontSize: 16, fontWeight: '800', color: colors.coral },
  signInBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, borderRadius: 16, marginTop: 6, shadowColor: colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4 },
  signInText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  syncBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 14, borderRadius: 16, marginBottom: 16, gap: 12 },
  syncBannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  syncBannerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  syncBannerText: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  cloudBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  cloudBadgeText: { fontSize: 11, fontWeight: '800', color: '#065F46', letterSpacing: 0.3 },
});

