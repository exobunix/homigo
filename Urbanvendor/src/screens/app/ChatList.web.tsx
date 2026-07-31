import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Badge } from 'react-native-paper';
import WebLayout from '@/components/WebLayout';

export default function ChatList({ navigation }: any) {
    const chats = [
        { id: '1', name: 'Rahul Verma', message: 'Is 4:30 PM okay?', time: '10:30 AM', unread: 2, avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma' },
        { id: '2', name: 'Sneha Kapoor', message: 'Thank you for the service!', time: 'Yesterday', unread: 0, avatar: 'https://ui-avatars.com/api/?name=Sneha+Kapoor' },
    ];

    return (
        <WebLayout
            title="Messages"
            subtitle="Chat with your customers."
        >
            <ScrollView style={styles.container}>
                <View style={styles.list}>
                    {chats.map((chat) => (
                        <TouchableOpacity
                            key={chat.id}
                            onPress={() => navigation.navigate('Chat', { chatId: chat.id, name: chat.name })}
                            activeOpacity={0.7}
                        >
                            <Card style={styles.card}>
                                <Card.Content style={styles.content}>
                                    <Avatar.Image size={56} source={{ uri: chat.avatar }} />
                                    <View style={styles.textBlock}>
                                        <View style={styles.headerRow}>
                                            <Text style={styles.name}>{chat.name}</Text>
                                            <Text style={styles.time}>{chat.time}</Text>
                                        </View>
                                        <View style={styles.messageRow}>
                                            <Text style={[styles.message, chat.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
                                                {chat.message}
                                            </Text>
                                            {chat.unread > 0 && (
                                                <Badge size={24} style={styles.badge}>{chat.unread}</Badge>
                                            )}
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },
    list: {
        maxWidth: 800,
        gap: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    textBlock: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    unreadMessage: {
        color: '#1e293b',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#ef4444',
        fontWeight: 'bold',
    },
});
