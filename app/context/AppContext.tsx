import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export type Task = {
  id: string;
  title: string;
  category: 'Work' | 'Personal' | 'Study' | 'Errands';
  time?: string;
  completed: boolean;
  createdAt: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  tag?: string;
  updatedAt: number;
};

export type Activity = {
  id: string;
  title: string;
  duration: number;
  preferredTime: string;
  color: string;
  completedDates: string[];
};

export type Settings = {
  darkMode: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
};

export type AuthUser = { id: string; email: string };

type AppState = {
  tasks: Task[];
  notes: Note[];
  activities: Activity[];
  settings: Settings;
  user: { name: string; handle: string; joined: string; avatar: string };
  authUser: AuthUser | null;
  authLoading: boolean;
  syncing: boolean;
  streak: number;
  focusMinutes: number;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addActivity: (a: Omit<Activity, 'id' | 'completedDates'>) => void;
  toggleActivityToday: (id: string) => void;
  deleteActivity: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addFocusMinutes: (m: number) => void;
  resetData: () => void;
};

const STORAGE_KEY = 'daily_organizer_v1';
const todayISO = () => new Date().toISOString().slice(0, 10);
const DEFAULT_BASE_TS = Date.parse('2026-01-01T08:00:00.000Z');

const defaultTasks: Task[] = [
  { id: 't1', title: 'Finalize Q3 Pitch Deck', category: 'Work', time: '10:00 AM', completed: false, createdAt: DEFAULT_BASE_TS - 100000 },
  { id: 't2', title: 'Review pull requests', category: 'Work', time: '11:30 AM', completed: false, createdAt: DEFAULT_BASE_TS - 90000 },
  { id: 't3', title: 'Gym: Upper Body', category: 'Personal', time: '6:00 PM', completed: false, createdAt: DEFAULT_BASE_TS - 80000 },
  { id: 't4', title: 'Buy groceries', category: 'Errands', time: '7:30 PM', completed: false, createdAt: DEFAULT_BASE_TS - 70000 },
  { id: 't5', title: 'Read 30 pages', category: 'Study', time: '9:00 PM', completed: false, createdAt: DEFAULT_BASE_TS - 60000 },
  { id: 't6', title: 'Morning Standup', category: 'Work', time: '9:00 AM', completed: true, createdAt: DEFAULT_BASE_TS - 50000 },
  { id: 't7', title: 'Reply to client emails', category: 'Work', time: '8:30 AM', completed: true, createdAt: DEFAULT_BASE_TS - 40000 },
];

const defaultNotes: Note[] = [
  { id: 'n1', title: 'Project Ideation', content: 'Need to brainstorm the new marketing campaign. Think outside the box — focus on Gen Z engagement, short-form video, and authentic storytelling.', color: '#FFE074', tag: 'WORK', updatedAt: DEFAULT_BASE_TS - 100000 },
  { id: 'n2', title: 'Meeting Minutes - Q3 Planning', content: 'Key takeaways: Focus heavily on user retention for the second half. Strategic priorities include onboarding and feature discovery.', color: '#A7E8C9', tag: 'IMPORTANT', updatedAt: DEFAULT_BASE_TS - 90000 },
  { id: 'n3', title: 'Grocery List', content: '- Oat milk\n- Bananas\n- Sourdough bread\n- Greek yogurt\n- Spinach', color: '#D9D2F5', tag: 'PERSONAL', updatedAt: DEFAULT_BASE_TS - 80000 },
  { id: 'n4', title: 'Random thought', content: "Why don't we use standard navigation patterns more? Sometimes consistency wins over novelty.", color: '#FAD7CC', tag: 'IDEA', updatedAt: DEFAULT_BASE_TS - 70000 },
  { id: 'n5', title: 'Book Recommendations', content: 'Sci-fi list from Sarah: "Dune", "The Left Hand of Darkness", "Hyperion", "Project Hail Mary".', color: '#FFFFFF', tag: 'READING', updatedAt: DEFAULT_BASE_TS - 60000 },
  { id: 'n6', title: 'Design Moodboard', content: 'Exploring soft gradients and rounded UI. Inspired by neo-minimalist apps.', color: '#D6D2F8', tag: 'DESIGN', updatedAt: DEFAULT_BASE_TS - 50000 },
  { id: 'n7', title: 'Q4 OKR Brainstorming', content: 'Goal 1: Increase user retention by 15%.\nKey Results: Implement the new onboarding flow.', color: '#FFFFFF', tag: 'WORK', updatedAt: DEFAULT_BASE_TS - 40000 },
  { id: 'n8', title: 'Reading List 2024', content: '1. The Design of Everyday Things\n2. Hooked\n3. Atomic Habits\n4. Deep Work', color: '#FFE074', tag: 'READING', updatedAt: DEFAULT_BASE_TS - 30000 },
];

const defaultActivities: Activity[] = [
  { id: 'a1', title: 'Email Triage', duration: 25, preferredTime: '8:00 AM', color: '#4F46E5', completedDates: [] },
  { id: 'a2', title: 'Strategic Planning', duration: 90, preferredTime: '10:00 AM', color: '#A78BFA', completedDates: [] },
  { id: 'a3', title: 'Deep Reading', duration: 45, preferredTime: '2:00 PM', color: '#4ADE80', completedDates: [] },
  { id: 'a4', title: 'Gym Session', duration: 60, preferredTime: '6:00 PM', color: '#FF6B6B', completedDates: [] },
  { id: 'a5', title: 'Journaling', duration: 15, preferredTime: '9:30 PM', color: '#FFD93D', completedDates: [] },
];

const defaultSettings: Settings = {
  darkMode: false,
  pushNotifications: true,
  soundEffects: true,
  hapticFeedback: true,
};

const AppContext = createContext<AppState | undefined>(undefined);

const loadFromStorage = (): any | null => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
};

const saveToStorage = (data: any) => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {}
};

const uid = () => Math.random().toString(36).slice(2, 11);

// DB row -> app object mappers
const rowToTask = (r: any): Task => ({
  id: r.id, title: r.title, category: r.category, time: r.time || undefined,
  completed: !!r.completed, createdAt: new Date(r.created_at).getTime(),
});
const rowToNote = (r: any): Note => ({
  id: r.id, title: r.title, content: r.content || '', color: r.color || '#FFFFFF',
  tag: r.tag || undefined, updatedAt: new Date(r.updated_at).getTime(),
});
const rowToActivity = (r: any): Activity => ({
  id: r.id, title: r.title, duration: r.duration, preferredTime: r.preferred_time || '',
  color: r.color, completedDates: Array.isArray(r.completed_dates) ? r.completed_dates : [],
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [focusMinutes, setFocusMinutes] = useState<number>(5190);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (!stored) return;
    if (Array.isArray(stored.tasks)) setTasks(stored.tasks);
    if (Array.isArray(stored.notes)) setNotes(stored.notes);
    if (Array.isArray(stored.activities)) setActivities(stored.activities);
    if (stored.settings) setSettings((prev) => ({ ...prev, ...stored.settings }));
    if (typeof stored.focusMinutes === 'number') setFocusMinutes(stored.focusMinutes);
  }, []);

  const userProfile = {
    name: authUser?.email?.split('@')[0] || 'Alex Rivera',
    handle: authUser ? `@${authUser.email.split('@')[0]}` : '@arivera',
    joined: 'Mar 2024',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/69033c662132e9313f3d65b8_1777614097420_582563ae.png',
  };

  // Load auth state on mount
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const u = data.session?.user;
      if (u) setAuthUser({ id: u.id, email: u.email || '' });
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setAuthUser(u ? { id: u.id, email: u.email || '' } : null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // Load data from DB whenever the user changes
  const loadFromDB = useCallback(async (userId: string) => {
    setSyncing(true);
    try {
      const [tRes, nRes, aRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
        supabase.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      ]);

      const dbTasks = (tRes.data || []).map(rowToTask);
      const dbNotes = (nRes.data || []).map(rowToNote);
      const dbActivities = (aRes.data || []).map(rowToActivity);

      // If the user has no data yet, seed from current local state
      if (dbTasks.length === 0 && dbNotes.length === 0 && dbActivities.length === 0) {
        const seedTasks = tasks.map((t) => ({ user_id: userId, title: t.title, category: t.category, time: t.time, completed: t.completed }));
        const seedNotes = notes.map((n) => ({ user_id: userId, title: n.title, content: n.content, color: n.color, tag: n.tag }));
        const seedActs = activities.map((a) => ({ user_id: userId, title: a.title, duration: a.duration, preferred_time: a.preferredTime, color: a.color, completed_dates: a.completedDates }));
        if (seedTasks.length) await supabase.from('tasks').insert(seedTasks);
        if (seedNotes.length) await supabase.from('notes').insert(seedNotes);
        if (seedActs.length) await supabase.from('activities').insert(seedActs);
        // Reload after seed
        const [t2, n2, a2] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
          supabase.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        ]);
        setTasks((t2.data || []).map(rowToTask));
        setNotes((n2.data || []).map(rowToNote));
        setActivities((a2.data || []).map(rowToActivity));
      } else {
        setTasks(dbTasks);
        setNotes(dbNotes);
        setActivities(dbActivities);
      }
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setSyncing(false);
    }
  }, [tasks, notes, activities]);

  useEffect(() => {
    if (authUser) loadFromDB(authUser.id);
  }, [authUser?.id]);

  // Persist to local storage as cache
  useEffect(() => {
    saveToStorage({ tasks, notes, activities, settings, focusMinutes });
  }, [tasks, notes, activities, settings, focusMinutes]);

  const streak = 14;

  // ---- Auth ----
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? { error: error.message } : {};
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setTasks(defaultTasks);
    setNotes(defaultNotes);
    setActivities(defaultActivities);
  };

  // ---- Helpers ----
  const userId = authUser?.id;

  // ---- Tasks ----
  const addTask: AppState['addTask'] = async (t) => {
    const tempId = uid();
    const optimistic: Task = { ...t, id: tempId, completed: false, createdAt: Date.now() };
    setTasks((prev) => [optimistic, ...prev]);
    if (userId) {
      const { data, error } = await supabase.from('tasks').insert({ user_id: userId, title: t.title, category: t.category, time: t.time, completed: false }).select().single();
      if (!error && data) {
        setTasks((prev) => prev.map((x) => x.id === tempId ? rowToTask(data) : x));
      }
    }
  };
  const toggleTask: AppState['toggleTask'] = async (id) => {
    let nextCompleted = false;
    setTasks((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      nextCompleted = !x.completed;
      return { ...x, completed: nextCompleted };
    }));
    if (userId) await supabase.from('tasks').update({ completed: nextCompleted, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
  };
  const deleteTask: AppState['deleteTask'] = async (id) => {
    setTasks((prev) => prev.filter((x) => x.id !== id));
    if (userId) await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
  };
  const updateTask: AppState['updateTask'] = async (id, patch) => {
    setTasks((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
    if (userId) {
      const dbPatch: any = { updated_at: new Date().toISOString() };
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.category !== undefined) dbPatch.category = patch.category;
      if (patch.time !== undefined) dbPatch.time = patch.time;
      if (patch.completed !== undefined) dbPatch.completed = patch.completed;
      await supabase.from('tasks').update(dbPatch).eq('id', id).eq('user_id', userId);
    }
  };

  // ---- Notes ----
  const addNote: AppState['addNote'] = async (n) => {
    const tempId = uid();
    const optimistic: Note = { ...n, id: tempId, updatedAt: Date.now() };
    setNotes((prev) => [optimistic, ...prev]);
    if (userId) {
      const { data, error } = await supabase.from('notes').insert({ user_id: userId, title: n.title, content: n.content, color: n.color, tag: n.tag }).select().single();
      if (!error && data) setNotes((prev) => prev.map((x) => x.id === tempId ? rowToNote(data) : x));
    }
  };
  const updateNote: AppState['updateNote'] = async (id, patch) => {
    setNotes((prev) => prev.map((x) => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x));
    if (userId) {
      const dbPatch: any = { updated_at: new Date().toISOString() };
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.content !== undefined) dbPatch.content = patch.content;
      if (patch.color !== undefined) dbPatch.color = patch.color;
      if (patch.tag !== undefined) dbPatch.tag = patch.tag;
      await supabase.from('notes').update(dbPatch).eq('id', id).eq('user_id', userId);
    }
  };
  const deleteNote: AppState['deleteNote'] = async (id) => {
    setNotes((prev) => prev.filter((x) => x.id !== id));
    if (userId) await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
  };

  // ---- Activities ----
  const addActivity: AppState['addActivity'] = async (a) => {
    const tempId = uid();
    const optimistic: Activity = { ...a, id: tempId, completedDates: [] };
    setActivities((prev) => [...prev, optimistic]);
    if (userId) {
      const { data, error } = await supabase.from('activities').insert({ user_id: userId, title: a.title, duration: a.duration, preferred_time: a.preferredTime, color: a.color, completed_dates: [] }).select().single();
      if (!error && data) setActivities((prev) => prev.map((x) => x.id === tempId ? rowToActivity(data) : x));
    }
  };
  const toggleActivityToday: AppState['toggleActivityToday'] = async (id) => {
    let nextDates: string[] = [];
    setActivities((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const today = todayISO();
      const has = a.completedDates.includes(today);
      nextDates = has ? a.completedDates.filter((d) => d !== today) : [...a.completedDates, today];
      return { ...a, completedDates: nextDates };
    }));
    if (userId) await supabase.from('activities').update({ completed_dates: nextDates }).eq('id', id).eq('user_id', userId);
  };
  const deleteActivity: AppState['deleteActivity'] = async (id) => {
    setActivities((prev) => prev.filter((x) => x.id !== id));
    if (userId) await supabase.from('activities').delete().eq('id', id).eq('user_id', userId);
  };

  const updateSettings = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));
  const addFocusMinutes = (m: number) => setFocusMinutes((prev) => prev + m);
  const resetData = () => {
    setTasks(defaultTasks);
    setNotes(defaultNotes);
    setActivities(defaultActivities);
    setSettings(defaultSettings);
    setFocusMinutes(5190);
  };

  const value: AppState = {
    tasks, notes, activities, settings, user: userProfile, authUser, authLoading, syncing, streak, focusMinutes,
    signIn, signUp, signOut,
    addTask, toggleTask, deleteTask, updateTask,
    addNote, updateNote, deleteNote,
    addActivity, toggleActivityToday, deleteActivity,
    updateSettings, addFocusMinutes, resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
