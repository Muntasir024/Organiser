import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Simple bar chart for weekly activity
export function WeeklyBarChart({ data, peakIndex }: { data: number[]; peakIndex?: number }) {
  const max = Math.max(...data, 1);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <View>
      <View style={styles.chartArea}>
        {data.map((v, i) => {
          const h = (v / max) * 110;
          const isPeak = i === peakIndex;
          return (
            <View key={i} style={styles.barCol}>
              {isPeak && (
                <View style={styles.peakBubble}>
                  <Text style={styles.peakText}>Peak</Text>
                </View>
              )}
              <View style={[styles.bar, { height: Math.max(h, 6), backgroundColor: isPeak ? colors.primary : '#C7D2FE' }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        {labels.map((l, i) => (
          <Text key={l} style={[styles.label, i === peakIndex && styles.labelActive]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

// GitHub-style consistency heatmap
export function ConsistencyHeatmap() {
  const cols = 14;
  const rows = 7;
  const cells: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.floor(Math.random() * 5));
    }
    cells.push(row);
  }
  const palette = ['#EEF2FF', '#C7D2FE', '#A5B4FC', '#6366F1', '#4338CA'];
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: cols }).map((_, c) => (
          <View key={c} style={{ gap: 4 }}>
            {Array.from({ length: rows }).map((_, r) => (
              <View key={r} style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: palette[cells[r][c]] }} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {palette.map((p) => (
            <View key={p} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: p }} />
          ))}
        </View>
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 22, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  peakBubble: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  peakText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  label: { fontSize: 12, color: colors.muted, flex: 1, textAlign: 'center', fontWeight: '600' },
  labelActive: { color: colors.text, fontWeight: '800' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  legendText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
});
