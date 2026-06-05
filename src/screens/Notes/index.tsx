import React, { useState } from 'react';
import { FlatList, Modal, Alert, TouchableOpacity, ScrollView, Share, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Note } from '../../types/note';

const NOTE_COLORS = ['#FFF9DB', '#E2FCEF', '#E6FCFF', '#FCE8E6', '#F3E8FF'];

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useAuthStore();
  const [search, setSearch] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTargetDate, setNoteTargetDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);

  const handleShareNote = async (note: Note) => {
    try {
      const extraInfo = note.createdAt ? `\n_Prazo final: ${note.createdAt}_` : '';
      const messageToShare = `*${note.title}*\n\n${note.content}${extraInfo}\n\n_Enviado via MylitED app_`;
      await Share.share({ message: messageToShare, title: note.title });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar o compartilhamento nativo.');
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTargetDate('');
    setSelectedColor(NOTE_COLORS[0]);
    setModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTargetDate(note.createdAt || ''); 
    setSelectedColor(note.color);
    setModalVisible(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Aviso', 'Por favor, preencha o título e o conteúdo.');
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim(), selectedColor, noteTargetDate.trim());
    } else {
      addNote(noteTitle.trim(), noteContent.trim(), selectedColor, noteTargetDate.trim());
    }
    setModalVisible(false);
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('Excluir Anotação', 'Tem certeza que quer apagar esta nota permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteNote(id) }
    ]);
  };

  const filteredNotes = notes.filter((note: any) => 
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <HeaderRow>
        <TitleText>Minhas Notas</TitleText>
        <AddButton onPress={handleNewNote}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </AddButton>
      </HeaderRow>

      <SearchContainer>
        <Ionicons name="search-outline" size={18} color="#97A0AF" />
        <SearchInput 
          placeholder="Pesquisar nas anotações..."
          placeholderTextColor="#97A0AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#97A0AF" />
          </TouchableOpacity>
        )}
      </SearchContainer>

      <FlatList 
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <NoteCard cardColor={item.color} activeOpacity={0.9} onPress={() => handleEditNote(item)}>
            <NoteCardHeader>
              <NoteTitle>{item.title}</NoteTitle>
              <CardActionsRow>
                <ActionButton onPress={() => handleShareNote(item)}>
                  <Ionicons name="share-social-outline" size={18} color="#0079BF" />
                </ActionButton>
                <ActionButton onPress={() => handleDeleteNote(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EB5A46" />
                </ActionButton>
              </CardActionsRow>
            </NoteCardHeader>
            <NoteContent numberOfLines={4}>{item.content}</NoteContent>
            <NoteDate>{item.createdAt || 'Sem Meta'}</NoteDate>
          </NoteCard>
        )}
        ListEmptyComponent={
          <EmptyContainer>
            <Ionicons name="document-text-outline" size={44} color="#97A0AF" />
            <EmptyText>Nenhuma anotação por aqui.</EmptyText>
          </EmptyContainer>
        }
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <ModalBackground>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <ModalContent>
              <ModalHeader>
                <ModalTitleText>{editingNote ? 'Editar Nota' : 'Nova Nota'}</ModalTitleText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#172B4D" />
                </TouchableOpacity>
              </ModalHeader>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Label>Título da Nota</Label>
                <Input placeholder="Ex: Resumo de Engenharia" placeholderTextColor="#97A0AF" value={noteTitle} onChangeText={setNoteTitle} />

                <Label>Data Final / Meta (Opcional)</Label>
                <Input placeholder="Ex: Até sexta 18:00h" placeholderTextColor="#97A0AF" value={noteTargetDate} onChangeText={setNoteTargetDate} />

                <Label>Conteúdo descritivo</Label>
                <InputContent placeholder="Comece a digitar..." placeholderTextColor="#97A0AF" multiline textAlignVertical="top" value={noteContent} onChangeText={setNoteContent} />

                <Label>Escolha uma cor de identificação</Label>
                <ColorRow>
                  {NOTE_COLORS.map((color) => (
                    <ColorCircle key={color} circleColor={color} isSelected={selectedColor === color} onPress={() => setSelectedColor(color)}>
                      {selectedColor === color && <Ionicons name="checkmark" size={16} color="#172B4D" />}
                    </ColorCircle>
                  ))}
                </ColorRow>

                <SaveButton onPress={handleSaveNote}>
                  <SaveButtonText>Salvar Anotação</SaveButtonText>
                </SaveButton>
              </ScrollView>
            </ModalContent>
          </KeyboardAvoidingView>
        </ModalBackground>
      </Modal>
    </Container>
  );
}

// Estilos originais preservados
const Container = styled.SafeAreaView` flex: 1; background-color: ${(props) => props.theme.colors.background}; `;
const HeaderRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding-horizontal: 24px; padding-top: 20px; margin-bottom: 16px; `;
const TitleText = styled.Text` font-size: 24px; font-weight: bold; color: ${(props) => props.theme.colors.textPrimary}; `;
const AddButton = styled.TouchableOpacity` width: 40px; height: 40px; border-radius: 20px; background-color: ${(props) => props.theme.colors.primary}; justify-content: center; align-items: center; `;
const SearchContainer = styled.View` flex-direction: row; align-items: center; background-color: ${(props) => props.theme.colors.surface}; margin-horizontal: 24px; padding-horizontal: 12px; height: 44px; border-radius: 8px; border-width: 1px; border-color: ${(props) => props.theme.colors.border}; margin-bottom: 16px; gap: 8px; `;
const SearchInput = styled.TextInput` flex: 1; height: 100%; color: ${(props) => props.theme.colors.textPrimary}; font-size: 15px; `;
const NoteCard = styled.TouchableOpacity<{ cardColor: string }>` background-color: ${(props) => props.cardColor}; border-radius: 8px; padding: 16px; margin-vertical: 8px; border-width: 1px; border-color: rgba(0, 0, 0, 0.05); elevation: 2; `;
const NoteCardHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; `;
const NoteTitle = styled.Text` font-size: 16px; font-weight: bold; color: #172B4D; flex: 1; margin-right: 8px; `;
const CardActionsRow = styled.View` flex-direction: row; gap: 10px; align-items: center; `;
const ActionButton = styled.TouchableOpacity` padding: 4px; background-color: rgba(255, 255, 255, 0.6); border-radius: 4px; `;
const NoteContent = styled.Text` font-size: 14px; color: #42526E; line-height: 20px; margin-bottom: 12px; `;
const NoteDate = styled.Text` font-size: 11px; color: #5E6C84; text-align: right; `;
const ModalBackground = styled.View` flex: 1; background-color: rgba(0, 0, 0, 0.4); justify-content: flex-end; `;
const ModalContent = styled.View` background-color: #FFFFFF; border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 24px; max-height: 85%; `;
const ModalHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const ModalTitleText = styled.Text` font-size: 18px; font-weight: bold; color: #172B4D; `;
const Label = styled.Text` font-size: 14px; font-weight: 600; color: #172B4D; margin-top: 12px; margin-bottom: 6px; `;
const Input = styled.TextInput` height: 44px; border-width: 1px; border-color: #DFE1E6; border-radius: 8px; padding-horizontal: 12px; background-color: #FAFBFC; font-size: 15px; color: #172B4D; `;
const InputContent = styled.TextInput` height: 120px; border-width: 1px; border-color: #DFE1E6; border-radius: 8px; padding: 12px; background-color: #FAFBFC; font-size: 15px; color: #172B4D; `;
const ColorRow = styled.View` flex-direction: row; gap: 12px; margin-vertical: 8px; `;
const ColorCircle = styled.TouchableOpacity<{ circleColor: string; isSelected: boolean }>` width: 38px; height: 38px; border-radius: 19px; background-color: ${(props) => props.circleColor}; justify-content: center; align-items: center; border-width: ${(props) => (props.isSelected ? '2px' : '1px')}; border-color: ${(props) => (props.isSelected ? '#0079BF' : 'rgba(0, 0, 0, 0.1)')}; `;
const SaveButton = styled.TouchableOpacity` height: 48px; background-color: #0079BF; border-radius: 8px; justify-content: center; align-items: center; margin-top: 24px; margin-bottom: 16px; `;
const SaveButtonText = styled.Text` color: #FFFFFF; font-weight: bold; font-size: 16px; `;
const EmptyContainer = styled.View` align-items: center; justify-content: center; margin-top: 60px; gap: 8px; `;
const EmptyText = styled.Text` color: #97A0AF; font-size: 14px; `;