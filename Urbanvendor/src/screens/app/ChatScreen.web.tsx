import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput as NativeTextInput, Platform } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';

export default function ChatScreen({ route, navigation }: any) {
    const { name = 'Rahul Verma', chatId } = route.params || {};
    const [message, setMessage] = useState('');

    const [messages, setMessages] = useState([
        { id: '1', text: 'Hi, I have a question about the AC service.', sender: 'user', time: '10:00 AM' },
        { id: '2', text: 'Hello! Sure, how can I help you?', sender: 'me', time: '10:05 AM' },
        { id: '3', text: 'Is the gas refill included in the price?', sender: 'user', time: '10:06 AM' },
        { id: '4', text: 'Yes, for the split AC service, basic gas top-up is included.', sender: 'me', time: '10:08 AM' },
        { id: '5', text: 'Great, thanks! Is 4:30 PM okay?', sender: 'user', time: '10:30 AM' },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, { id: Date.now().toString(), text: message, sender: 'me', time: 'Now' }]);
        setMessage('');
    };

    return (
        <WebLayout title="Chat" subtitle={`Conversation with ${name}`}>
            <View style={styles.container}>
                <Card style={styles.chatCard}>
                    <View style={styles.chatHeader}>
                        <View style={styles.userInfo}>
                            <Avatar.Text size={40} label={name[0]} style={{ backgroundColor: '#e0e7ff' }} color="#4338ca" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.userName}>{name}</Text>
                                <Text style={styles.userStatus}>Online</Text>
                            </View>
                        </View>
                        <View style={styles.headerActions}>
                            <IconButton icon="phone" onPress={() => { }} />
                            <IconButton icon="dots-vertical" onPress={() => { }} />
                        </View>
                    </View>

                    <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 24 }}>
                        {messages.map((msg) => (
                            <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'me' ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                                <View style={[styles.messageBubble, msg.sender === 'me' ? styles.myMessage : styles.theirMessage]}>
                                    <Text style={[styles.messageText, msg.sender === 'me' ? styles.myMessageText : styles.theirMessageText]}>
                                        {msg.text}
                                    </Text>
                                    <Text style={[styles.messageTime, msg.sender === 'me' ? styles.myMessageTime : styles.theirMessageTime]}>
                                        {msg.time}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.inputArea}>
                        <IconButton icon="paperclip" onPress={() => { }} />
                        <NativeTextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            value={message}
                            onChangeText={setMessage}
                            onSubmitEditing={handleSend}
                        />
                        <IconButton
                            icon="send"
                            mode="contained"
                            containerColor={theme.colors.primary}
                            iconColor="#ffffff"
                            onPress={handleSend}
                        />
                    </View>
                </Card>
            </View>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        height: '100%',
    },
    chatCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: Platform.OS === 'web' ? ('80vh' as any) : '100%', // Fixed height for web chat window feel
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userStatus: {
        fontSize: 12,
        color: '#10b981',
    },
    headerActions: {
        flexDirection: 'row',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    messageWrapper: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    myMessageWrapper: {
        justifyContent: 'flex-end',
    },
    theirMessageWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 12,
        borderRadius: 16,
    },
    myMessage: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#ffffff',
    },
    theirMessageText: {
        color: '#1e293b',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirMessageTime: {
        color: '#94a3b8',
    },
    inputArea: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#f1f5f9',
        borderRadius: 22,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        fontSize: 15,
        // @ts-ignore
        outlineStyle: 'none', // Web specific
    },
});
