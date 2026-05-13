import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const COLORS = ['#FFFFFF', '#FFE074', '#A7E8C9', '#D9D2F5', '#FAD7CC', '#D6D2F8'];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const isNew = id === 'new';
  const existing = !isNew ? notes.find((n) => n.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [color, setColor] = useState(existing?.color || '#FFFFFF');
  const saveTimer = useRef<any>(null);

  // Auto-save every 3s when editing existing
  useEffect(() => {
    if (isNew) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (existing && (title !== existing.title || content !== existing.content || color !== existing.color)) {
        updateNote(existing.id, { title, content, color });
      }
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, color]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }
    if (isNew) {
      addNote({ title: title.trim() || 'Untitled', content, color });
    } else if (existing) {
      updateNote(existing.id, { title: title.trim() || 'Untitled', content, color });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!isNew && existing) deleteNote(existing.id);
    router.back();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.wordCount}>{wordCount} words</Text>
        <Pressable onPress={handleSave}>
          <Text style={styles.doneBtn}>Done</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <TextInput
          placeholder="Note title..."
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
          multiline
        />
        <TextInput
          placeholder="Start typing..."
          placeholderTextColor={colors.muted}
          value={content}
          onChangeText={setContent}
          style={styles.contentInput}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} />
          ))}
        </View>
        {!isNew && (
          <Pressable onPress={handleDelete} style={styles.trashBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.coral} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  wordCount: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  doneBtn: { color: colors.primary, fontSize: 16, fontWeight: '800', paddingHorizontal: 12 },
  body: { padding: 20, paddingBottom: 40 },
  titleInput: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 16, padding: 0 },
  contentInput: { fontSize: 17, color: colors.text, lineHeight: 26, minHeight: 300, padding: 0 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorDotActive: { borderWidth: 3, borderColor: colors.primary },
  trashBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
