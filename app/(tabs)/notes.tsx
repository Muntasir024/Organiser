import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

type Sort = 'modified' | 'title';

export default function NotesScreen() {
  const { notes, deleteNote } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('modified');
  const [grid, setGrid] = useState(true);

  const filtered = useMemo(() => {
    let list = notes.filter(
      (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
    return list;
  }, [notes, search, sort]);

  // Split for masonry
  const left = filtered.filter((_, i) => i % 2 === 0);
  const right = filtered.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setSort(sort === 'modified' ? 'title' : 'modified')} style={styles.iconBtn}>
            <Ionicons name={sort === 'modified' ? 'time-outline' : 'text-outline'} size={20} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setGrid(!grid)} style={styles.iconBtn}>
            <Ionicons name={grid ? 'list-outline' : 'grid-outline'} size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          placeholder="Search your thoughts..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No notes found.</Text>
        ) : grid ? (
          <View style={styles.masonry}>
            <View style={styles.col}>
              {left.map((n) => (
                <NoteCard key={n.id} note={n} onPress={() => router.push(`/note/${n.id}`)} onDelete={() => deleteNote(n.id)} />
              ))}
            </View>
            <View style={styles.col}>
              {right.map((n) => (
                <NoteCard key={n.id} note={n} onPress={() => router.push(`/note/${n.id}`)} onDelete={() => deleteNote(n.id)} />
              ))}
            </View>
          </View>
        ) : (
          filtered.map((n) => (
            <Pressable key={n.id} onPress={() => router.push(`/note/${n.id}`)} style={[styles.listCard]}>
              <View style={{ flex: 1 }}>
                <View style={styles.listCardHead}>
                  <Text style={styles.listTitle}>{n.title}</Text>
                  <Text style={styles.listDate}>{new Date(n.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                </View>
                <Text style={styles.listContent} numberOfLines={2}>{n.content}</Text>
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: 140 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/note/new')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function NoteCard({ note, onPress, onDelete }: { note: any; onPress: () => void; onDelete: () => void }) {
  return (
    <Pressable style={[styles.noteCard, { backgroundColor: note.color }]} onPress={onPress} onLongPress={onDelete}>
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteContent} numberOfLines={4}>{note.content}</Text>
      {note.tag && (
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{note.tag}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 36, fontWeight: '800', color: colors.text },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, gap: 10, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  scrollBody: { paddingHorizontal: 20, paddingTop: 8 },
  empty: { textAlign: 'center', color: colors.muted, paddingVertical: 40 },
  masonry: { flexDirection: 'row', gap: 12 },
  col: { flex: 1, gap: 12 },
  noteCard: { borderRadius: 20, padding: 18, minHeight: 140 },
  noteTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
  noteContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
  tagPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 12 },
  tagText: { fontSize: 11, fontWeight: '800', color: colors.text, letterSpacing: 0.5 },
  listCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12 },
  listCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  listTitle: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1 },
  listDate: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  listContent: { fontSize: 14, color: colors.subtext, marginTop: 8, lineHeight: 20 },
  fab: { position: 'absolute', right: 24, bottom: 110, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8 },
});
