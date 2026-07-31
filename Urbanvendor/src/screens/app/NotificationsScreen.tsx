import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { useAppSelector } from '@/store';

export default function NotificationsScreen() {
  const { notifications } = useAppSelector((s) => (s as any).notification);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Notifications</Title>
      <FlatList
        data={notifications}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.cardMeta}>{new Date(item.createdAt || Date.now()).toLocaleString()}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: { marginBottom: 10, borderRadius: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardBody: { fontSize: 13, color: '#475569' },
  cardMeta: { fontSize: 11, color: '#94a3b8', marginTop: 8 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24 },
});
