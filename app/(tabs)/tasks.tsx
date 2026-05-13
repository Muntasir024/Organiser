import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, Task } from '../context/AppContext';
import { colors, categoryColors } from '../theme';

const FILTERS: Array<'All' | Task['category']> = ['All', 'Work', 'Personal', 'Study', 'Errands'];

export default function TasksScreen() {
  const { tasks, toggleTask, deleteTask, addTask } = useApp();
  const [filter, setFilter] = useState<'All' | Task['category']>('All');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Add form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('Work');
  const [newTime, setNewTime] = useState('');

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter !== 'All') list = list.filter((t) => t.category === filter);
    if (search.trim()) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [tasks, filter, search]);

  const active = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle.trim(), category: newCategory, time: newTime || undefined });
    setNewTitle('');
    setNewTime('');
    setNewCategory('Work');
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Pressable onPress={() => setShowSearch((s) => !s)} style={styles.iconBtn}>
          <Ionicons name="search" size={20} color={colors.text} />
        </Pressable>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>TODAY</Text>
        {active.length === 0 && <Text style={styles.empty}>No tasks. Add one below!</Text>}
        {active.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            swiped={swipedId === t.id}
            onSwipe={() => setSwipedId(swipedId === t.id ? null : t.id)}
            onToggle={() => toggleTask(t.id)}
            onDelete={() => { deleteTask(t.id); setSwipedId(null); }}
          />
        ))}

        <Pressable style={styles.completedHeader} onPress={() => setShowCompleted((s) => !s)}>
          <Text style={styles.sectionLabel}>COMPLETED ({completed.length})</Text>
          <Ionicons name={showCompleted ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.muted} />
        </Pressable>
        {showCompleted && completed.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            swiped={swipedId === t.id}
            onSwipe={() => setSwipedId(swipedId === t.id ? null : t.id)}
            onToggle={() => toggleTask(t.id)}
            onDelete={() => { deleteTask(t.id); setSwipedId(null); }}
          />
        ))}
        <View style={{ height: 140 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              placeholder="Task title"
              placeholderTextColor={colors.muted}
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              autoFocus
            />
            <TextInput
              placeholder="Time (e.g. 10:00 AM)"
              placeholderTextColor={colors.muted}
              value={newTime}
              onChangeText={setNewTime}
              style={styles.input}
            />
            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.catRow}>
              {(['Work', 'Personal', 'Study', 'Errands'] as Task['category'][]).map((c) => (
                <Pressable key={c} onPress={() => setNewCategory(c)} style={[styles.catChip, newCategory === c && { backgroundColor: categoryColors[c] }]}>
                  <Text style={[styles.catChipText, newCategory === c && { color: '#fff' }]}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.primaryBtn} onPress={handleAdd}>
              <Text style={styles.primaryBtnText}>Add Task</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function TaskRow({ task, swiped, onSwipe, onToggle, onDelete }: { task: Task; swiped: boolean; onSwipe: () => void; onToggle: () => void; onDelete: () => void }) {
  const accent = categoryColors[task.category] || colors.primary;
  return (
    <View style={styles.taskWrap}>
      {swiped && (
        <Pressable style={styles.deleteAction} onPress={onDelete}>
          <Ionicons name="trash" size={22} color="#fff" />
        </Pressable>
      )}
      <Pressable
        onLongPress={onSwipe}
        style={[styles.taskCard, swiped && { transform: [{ translateX: -80 }] }, task.completed && { opacity: 0.6 }]}
      >
        <View style={[styles.taskAccent, { backgroundColor: accent }]} />
        <View style={{ flex: 1, paddingLeft: 14 }}>
          <Text style={[styles.taskTitle, task.completed && styles.strikethrough]}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <Ionicons name={task.category === 'Errands' ? 'cart-outline' : task.category === 'Personal' ? 'fitness-outline' : task.category === 'Study' ? 'book-outline' : 'time-outline'} size={13} color={colors.muted} />
            <Text style={[styles.taskMetaText, task.completed && styles.strikethrough]}>{task.time || task.category}</Text>
          </View>
        </View>
        <Pressable onPress={onToggle} style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 36, fontWeight: '800', color: colors.text },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, gap: 10, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, backgroundColor: '#fff', marginRight: 10 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1, marginVertical: 12 },
  empty: { color: colors.muted, fontSize: 14, paddingVertical: 12 },
  completedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  taskWrap: { position: 'relative', marginBottom: 10 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 14, paddingRight: 16, overflow: 'hidden' },
  taskAccent: { width: 6, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  taskMetaText: { fontSize: 13, color: colors.muted },
  strikethrough: { textDecorationLine: 'line-through', color: colors.muted },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  deleteAction: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, backgroundColor: colors.coral, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 24, bottom: 110, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.bg, padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: colors.subtext, marginTop: 8, marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12, color: colors.text },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff' },
  catChipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
