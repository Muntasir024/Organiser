import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function AuthModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const reset = () => {
    setEmail(''); setPassword(''); setError(null); setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const res = await fn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      handleClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {mode === 'signin' ? 'Sign in to sync your tasks, notes, and activities across devices.' : 'Create an account to back up your data and access it anywhere.'}
          </Text>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.muted} />
            <TextInput
              placeholder="you@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
            />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
            <TextInput
              placeholder="Password (min 6 chars)"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              style={styles.input}
            />
            <Pressable onPress={() => setShowPwd(!showPwd)}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </Pressable>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.coral} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}>
            <Text style={styles.switchText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
  handle: { width: 44, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 14, color: colors.subtext, lineHeight: 20, marginBottom: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 12 },
  errorText: { color: colors.coral, fontSize: 13, fontWeight: '600', flex: 1 },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  switchText: { textAlign: 'center', color: colors.subtext, fontSize: 14 },
  switchLink: { color: colors.primary, fontWeight: '800' },
});
