import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function Chatbot() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your University Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { id: Date.now(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      console.log('Chatbot sending query:', { query, role: user.role, userId: user.id });
      const response = await ApiService.chatbot(query, user.role, user.id);
      console.log('Chatbot received response:', response);
      const botMessage = { id: Date.now() + 1, text: response.answer, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setVisible(true)}
      >
        <Ionicons name="chatbubbles" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.chatContainer}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>RomeAI Assistant</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.messagesList}>
              {messages.map(msg => (
                <View key={msg.id} style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.botText
                  ]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
              {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 10 }} />}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask me something..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '80%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  messagesList: {
    padding: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
  },
  messageText: {
    fontSize: 15,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#334155',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
