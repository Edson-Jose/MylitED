import React, { useState } from 'react';
import { FlatList, Modal, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native'; 
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Task, TaskPriority } from '../../types/task';

export default function Home() {
  // 🌟 Chamando as funções oficiais da Store que possuem o gatilho do AsyncStorage
  const { 
    user, columns, tasks, addColumn, deleteColumn, addTask, moveTask, updateTask, deleteTask, addNote, addSchedule 
  } = useAuthStore();

  // Modais de controle
  const [columnModalVisible, setColumnModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Estados dos formulários de criação
  const [newColumnName, setNewColumnName] = useState('');
  const [selectedColumnForTask, setSelectedColumnForTask] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Estados do formulário de EDIÇÃO
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Baixa');

  // Estados de notas e agenda rápidas
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    addColumn(newColumnName.trim());
    setNewColumnName('');
    setColumnModalVisible(false);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    addTask(taskTitle, taskDesc, taskCategory || 'Geral', selectedColumnForTask);
    const finalDate = taskDueDate.trim() || 'Sem prazo';
    const lastInserted = tasks[tasks.length - 1];
    if (lastInserted) {
      updateTask(lastInserted.id, { date: finalDate });
    }
    setTaskTitle('');
    setTaskDesc('');
    setTaskCategory('');
    setTaskDueDate('');
    setTaskModalVisible(false);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditCategory(task.category || 'Geral');
    setEditDueDate(task.date || 'Sem prazo');
    setEditPriority(task.priority || 'Baixa');
    setEditTaskModalVisible(true);
  };

  const handleSaveEditedTask = () => {
    if (!selectedTask || !editTitle.trim()) return;
    updateTask(selectedTask.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory.trim() || 'Geral',
      date: editDueDate.trim() || 'Sem prazo',
      priority: editPriority
    });
    setEditTaskModalVisible(false);
    setSelectedTask(null);
  };

  const handleDeleteTaskPrompt = () => {
    if (!selectedTask) return;
    Alert.alert('Excluir Cartão', `Deseja realmente apagar o cartão "${selectedTask.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Excluir', 
        style: 'destructive', 
        onPress: () => {
          deleteTask(selectedTask.id);
          setEditTaskModalVisible(false);
          setSelectedTask(null);
        }
      }
    ]);
  };

  const handleNextColumn = (task: Task) => {
    const currentIndex = columns.indexOf(task.status);
    if (currentIndex < columns.length - 1) {
      moveTask(task.id, columns[currentIndex + 1]);
    } else {
      moveTask(task.id, columns[0]);
    }
  };

  //  SALVAMENTO DE NOTA CORRIGIDO (Aciona o set() do Zustand para salvar no celular)
  const handleQuickNoteSave = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    
    addNote(noteTitle.trim(), noteContent.trim(), '#FFF9DB');
    
    setNoteTitle('');
    setNoteContent('');
    setNoteModalVisible(false);
    Alert.alert('Sucesso', 'Nota gravada no dispositivo e enviada para a aba de Notas!');
  };

  // 🌟 SALVAMENTO DE AGENDA CORRIGIDO (Aciona o set() do Zustand para salvar no celular)
  const handleQuickScheduleSave = () => {
    if (!eventTitle.trim() || !eventTime.trim()) return;
    const finalEventDate = eventDate.trim() || new Date().toLocaleDateString('pt-BR');
    
    addSchedule(eventTitle.trim(), eventDesc.trim(), eventTime.trim(), finalEventDate, 'Média');
    
    setEventTitle('');
    setEventDesc('');
    setEventTime('');
    setEventDate('');
    setScheduleModalVisible(false);
    Alert.alert('Sucesso', 'Compromisso gravado no dispositivo e enviado para a aba Agenda!');
  };

  return (
    <Container>
      {/* HEADER INTEGRADO COM A FOTO DE PERFIL GLOBAL */}
      <HeaderView>
        <HeaderLeft>
          <WelcomeText>Olá,</WelcomeText>
          <UserText>{user?.name || 'Sr. Edson'}</UserText>
        </HeaderLeft>
        <AvatarCircle>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <AvatarText>{user?.name?.slice(0,2).toUpperCase() || 'ED'}</AvatarText>
          )}
        </AvatarCircle>
      </HeaderView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PaddingWrapper>
          <SectionTitle>Ações Rápidas</SectionTitle>
          <ActionsRow>
            <QuickBtn onPress={() => setNoteModalVisible(true)} style={{ backgroundColor: '#0079BF' }}>
              <Ionicons name="document-text" size={16} color="#FFF" />
              <QuickBtnText>Nova Nota</QuickBtnText>
            </QuickBtn>
            <QuickBtn onPress={() => setScheduleModalVisible(true)} style={{ backgroundColor: '#579DFF' }}>
              <Ionicons name="calendar" size={16} color="#FFF" />
              <QuickBtnText>Agendar</QuickBtnText>
            </QuickBtn>
          </ActionsRow>

          <BoardHeaderRow>
            <SectionTitle style={{ marginBottom: 0 }}>Seu Quadro Trello</SectionTitle>
            <AddColumnBtn onPress={() => setColumnModalVisible(true)}>
              <Ionicons name="add" size={16} color="#0079BF" />
              <AddColumnBtnText>Nova Coluna</AddColumnBtnText>
            </AddColumnBtn>
          </BoardHeaderRow>
        </PaddingWrapper>

        {/* COLUNAS KANBAN */}
        <FlatList
          data={columns}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 20 }}
          renderItem={({ item: columnName }) => {
            const columnTasks = tasks.filter(t => t.status === columnName);
            return (
              <ColumnContainer>
                <ColumnHeader>
                  <ColumnTitleRow>
                    <ColumnTitle>{columnName}</ColumnTitle>
                    <ColumnCounter>{columnTasks.length}</ColumnCounter>
                  </ColumnTitleRow>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Excluir', `Apagar a coluna "${columnName}"?`, [
                      { text: 'Cancelar' },
                      { text: 'Apagar', onPress: () => deleteColumn(columnName), style: 'destructive' }
                    ]);
                  }}>
                    <Ionicons name="ellipsis-horizontal" size={16} color="#5E6C84" />
                  </TouchableOpacity>
                </ColumnHeader>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                  {columnTasks.map((task: any) => (
                    <CardContainer key={task.id} activeOpacity={0.8} onPress={() => handleOpenEditModal(task as any)}>
                      <CardHeaderRow>
                        <CategoryText>{task.category}</CategoryText>
                        <PriorityBadge priority={task.priority}>
                          <PriorityText priority={task.priority}>{task.priority}</PriorityText>
                        </PriorityBadge>
                      </CardHeaderRow>
                      <CardTitle>{task.title}</CardTitle>
                      {task.description ? <CardDesc>{task.description}</CardDesc> : null}
                      <CardFooterRow>
                        <DateRow>
                          <Ionicons name="time-outline" size={12} color="#97A0AF" style={{ marginRight: 3 }} />
                          <FooterDate>{task.date || 'Sem prazo'}</FooterDate>
                        </DateRow>
                        <MoveButton onPress={() => handleNextColumn(task as any)}>
                          <Ionicons name="arrow-forward-circle" size={20} color="#0079BF" />
                        </MoveButton>
                      </CardFooterRow>
                    </CardContainer>
                  ))}
                  
                  <AddTaskInlineBtn onPress={() => {
                    setSelectedColumnForTask(columnName);
                    setTaskModalVisible(true);
                  }}>
                    <Ionicons name="add" size={16} color="#5E6C84" />
                    <AddTaskInlineText>Adicionar cartão</AddTaskInlineText>
                  </AddTaskInlineBtn>
                </ScrollView>
              </ColumnContainer>
            );
          }}
        />
      </ScrollView>

      {/* MODAL: NOVA COLUNA */}
      <Modal visible={columnModalVisible} animationType="fade" transparent>
        <ModalBg>
          <ModalBox>
            <ModalTitle>Nova Coluna</ModalTitle>
            <Input placeholder="Nome da coluna" placeholderTextColor="#97A0AF" value={newColumnName} onChangeText={setNewColumnName} />
            <ModalButtons>
              <ModalBtn onPress={() => setColumnModalVisible(false)}><BtnTxt style={{ color: '#5E6C84' }}>Cancelar</BtnTxt></ModalBtn>
              <ModalBtn onPress={handleCreateColumn} style={{ backgroundColor: '#0079BF' }}><BtnTxt style={{ color: '#FFF' }}>Criar</BtnTxt></ModalBtn>
            </ModalButtons>
          </ModalBox>
        </ModalBg>
      </Modal>

      {/* MODAL: CRIAR CARTÃO */}
      <Modal visible={taskModalVisible} animationType="slide" transparent>
        <ModalBg style={{ justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <ModalBox style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
              <ModalTitle>Novo Cartão em "{selectedColumnForTask}"</ModalTitle>
              <Input placeholder="Título da tarefa" placeholderTextColor="#97A0AF" value={taskTitle} onChangeText={setTaskTitle} />
              <Input placeholder="Descrição" placeholderTextColor="#97A0AF" value={taskDesc} onChangeText={setTaskDesc} />
              <Input placeholder="Categoria (Ex: TI, Faculdade)" placeholderTextColor="#97A0AF" value={taskCategory} onChangeText={setTaskCategory} />
              <Input placeholder="Data Limite (Ex: 25/05/2026)" placeholderTextColor="#97A0AF" value={taskDueDate} onChangeText={setTaskDueDate} />
              <SaveBtn onPress={handleCreateTask} style={{ backgroundColor: '#0079BF' }}><BtnTxt style={{ color: '#FFF' }}>Criar Cartão</BtnTxt></SaveBtn>
              <CancelBtn onPress={() => setTaskModalVisible(false)}><BtnTxt style={{ color: '#EB5A46' }}>Fechar</BtnTxt></CancelBtn>
            </ModalBox>
          </KeyboardAvoidingView>
        </ModalBg>
      </Modal>

      {/* MODAL: EDITAR CARTÃO */}
      <Modal visible={editTaskModalVisible} animationType="slide" transparent>
        <ModalBg style={{ justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <ModalBox style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
              <ModalTitleRow style={{ marginBottom: 12 }}>
                <ModalTitle style={{ marginBottom: 0 }}>Visualizar / Editar Cartão</ModalTitle>
                <TouchableOpacity onPress={handleDeleteTaskPrompt}>
                  <Ionicons name="trash" size={20} color="#EB5A46" />
                </TouchableOpacity>
              </ModalTitleRow>
              
              <Input placeholder="Título da tarefa" placeholderTextColor="#97A0AF" value={editTitle} onChangeText={setEditTitle} />
              <Input placeholder="Descrição" placeholderTextColor="#97A0AF" value={editDesc} onChangeText={setEditDesc} />
              <Input placeholder="Categoria" placeholderTextColor="#97A0AF" value={editCategory} onChangeText={setEditCategory} />
              <Input placeholder="Data Limite" placeholderTextColor="#97A0AF" value={editDueDate} onChangeText={setEditDueDate} />
              
              <LabelText>Definir Prioridade:</LabelText>
              <PrioritySelectorRow>
                <PriorityOptionBtn 
                  onPress={() => setEditPriority('Baixa')} 
                  style={{ backgroundColor: editPriority === 'Baixa' ? '#E2FCEF' : '#F4F5F7', borderColor: '#61BD4F', borderWidth: editPriority === 'Baixa' ? 1.5 : 0 }}
                >
                  <PriorityOptionText style={{ color: '#61BD4F', fontWeight: editPriority === 'Baixa' ? 'bold' : 'normal' }}>Baixa</PriorityOptionText>
                </PriorityOptionBtn>

                <PriorityOptionBtn 
                  onPress={() => setEditPriority('Média')} 
                  style={{ backgroundColor: editPriority === 'Média' ? '#FFF9DB' : '#F4F5F7', borderColor: '#B59E00', borderWidth: editPriority === 'Média' ? 1.5 : 0 }}
                >
                  <PriorityOptionText style={{ color: '#B59E00', fontWeight: editPriority === 'Média' ? 'bold' : 'normal' }}>Média</PriorityOptionText>
                </PriorityOptionBtn>

                <PriorityOptionBtn 
                  onPress={() => setEditPriority('Alta')} 
                  style={{ backgroundColor: editPriority === 'Alta' ? '#FCE8E6' : '#F4F5F7', borderColor: '#EB5A46', borderWidth: editPriority === 'Alta' ? 1.5 : 0 }}
                >
                  <PriorityOptionText style={{ color: '#EB5A46', fontWeight: editPriority === 'Alta' ? 'bold' : 'normal' }}>Alta</PriorityOptionText>
                </PriorityOptionBtn>
              </PrioritySelectorRow>
              
              <SaveBtn onPress={handleSaveEditedTask} style={{ backgroundColor: '#61BD4F', marginTop: 15 }}><BtnTxt style={{ color: '#FFF' }}>Salvar Alterações</BtnTxt></SaveBtn>
              <CancelBtn onPress={() => { setEditTaskModalVisible(false); setSelectedTask(null); }}><BtnTxt style={{ color: '#5E6C84' }}>Voltar</BtnTxt></CancelBtn>
            </ModalBox>
          </KeyboardAvoidingView>
        </ModalBg>
      </Modal>

      {/* MODAL: NOTA RÁPIDA */}
      <Modal visible={noteModalVisible} animationType="slide" transparent>
        <ModalBg style={{ justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <ModalBox style={{ width: '100%' }}>
              <ModalTitle>Nota Rápida</ModalTitle>
              <Input placeholder="Título" placeholderTextColor="#97A0AF" value={noteTitle} onChangeText={setNoteTitle} />
              <Input placeholder="Conteúdo..." placeholderTextColor="#97A0AF" multiline style={{ height: 80 }} value={noteContent} onChangeText={setNoteContent} />
              <SaveBtn onPress={handleQuickNoteSave} style={{ backgroundColor: '#0079BF' }}><BtnTxt style={{ color: '#FFF' }}>Salvar Nota</BtnTxt></SaveBtn>
              <CancelBtn onPress={() => setNoteModalVisible(false)}><BtnTxt style={{ color: '#EB5A46' }}>Fechar</BtnTxt></CancelBtn>
            </ModalBox>
          </KeyboardAvoidingView>
        </ModalBg>
      </Modal>

      {/* MODAL: AGENDAR EVENTO */}
      <Modal visible={scheduleModalVisible} animationType="slide" transparent>
        <ModalBg style={{ justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <ModalBox style={{ width: '100%' }}>
              <ModalTitle>Agendar Evento</ModalTitle>
              <Input placeholder="O que vai fazer?" placeholderTextColor="#97A0AF" value={eventTitle} onChangeText={setEventTitle} />
              <Input placeholder="Data (Ex: 28/05/2026)" placeholderTextColor="#97A0AF" value={eventDate} onChangeText={setEventDate} />
              <Input placeholder="Horário (Ex: 15:00)" placeholderTextColor="#97A0AF" value={eventTime} onChangeText={setEventTime} />
              <Input placeholder="Descrição..." placeholderTextColor="#97A0AF" value={eventDesc} onChangeText={setEventDesc} />
              <SaveBtn onPress={handleQuickScheduleSave} style={{ backgroundColor: '#579DFF' }}><BtnTxt style={{ color: '#FFF' }}>Agendar</BtnTxt></SaveBtn>
              <CancelBtn onPress={() => setScheduleModalVisible(false)}><BtnTxt style={{ color: '#EB5A46' }}>Fechar</BtnTxt></CancelBtn>
            </ModalBox>
          </KeyboardAvoidingView>
        </ModalBg>
      </Modal>
    </Container>
  );
}

// --- SEUS ESTILOS KANBAN ORIGINAIS MANTIDOS MANTIDOS INTACTOS ---
const Container = styled.SafeAreaView` flex: 1; background-color: ${props => props.theme.colors.background}; `;
const PaddingWrapper = styled.View` padding-horizontal: 20px; `;
const HeaderView = styled.View` height: 75px; background-color: ${props => props.theme.colors.surface}; flex-direction: row; justify-content: space-between; align-items: center; padding-horizontal: 20px; border-bottom-width: 1px; border-color: ${props => props.theme.colors.border}; margin-bottom: 15px; `;
const HeaderLeft = styled.View``;
const WelcomeText = styled.Text` font-size: 13px; color: ${props => props.theme.colors.textSecondary}; `;
const UserText = styled.Text` font-size: 17px; font-weight: bold; color: ${props => props.theme.colors.textPrimary}; `;
const AvatarCircle = styled.View` width: 40px; height: 40px; border-radius: 20px; background-color: ${props => props.theme.colors.primary}; justify-content: center; align-items: center; overflow: hidden; `;
const AvatarText = styled.Text` color: #fff; font-weight: bold; `;
const SectionTitle = styled.Text` font-size: 15px; font-weight: bold; color: ${props => props.theme.colors.textPrimary}; margin-bottom: 10px; `;
const ActionsRow = styled.View` flex-direction: row; gap: 10px; margin-bottom: 20px; `;
const QuickBtn = styled.TouchableOpacity` flex: 1; height: 42px; border-radius: 6px; flex-direction: row; align-items: center; justify-content: center; gap: 6px; `;
const QuickBtnText = styled.Text` color: #fff; font-weight: bold; font-size: 13px; `;
const BoardHeaderRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 5px; `;
const AddColumnBtn = styled.TouchableOpacity` flex-direction: row; align-items: center; gap: 4px; `;
const AddColumnBtnText = styled.Text` color: #0079BF; font-weight: bold; font-size: 13px; `;
const ColumnContainer = styled.View` width: 280px; background-color: #EBECF0; margin-right: 15px; border-radius: 8px; padding: 12px; max-height: 450px; `;
const ColumnHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 12px; `;
const ColumnTitleRow = styled.View` flex-direction: row; align-items: center; gap: 8px; `;
const ColumnTitle = styled.Text` font-size: 14px; font-weight: bold; color: #172B4D; `;
const ColumnCounter = styled.Text` font-size: 11px; background-color: rgba(0,0,0,0.08); padding-horizontal: 6px; padding-vertical: 2px; border-radius: 10px; color: #5E6C84; font-weight: bold; `;
const CardContainer = styled.TouchableOpacity` background-color: #FFF; border-radius: 4px; padding: 10px; margin-bottom: 8px; border-bottom-width: 1px; border-color: #CCC; elevation: 1; `;
const CardHeaderRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 4px; `;
const CategoryText = styled.Text` font-size: 11px; color: #5E6C84; font-weight: 500; `;
const CardTitle = styled.Text` font-size: 14px; color: #172B4D; font-weight: 500; `;
const CardDesc = styled.Text` font-size: 12px; color: #5E6C84; margin-top: 4px; `;
const CardFooterRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-top: 8px; border-top-width: 0.5px; border-color: #EEE; padding-top: 6px; `;
const DateRow = styled.View` flex-direction: row; align-items: center; `;
const FooterDate = styled.Text` font-size: 11px; color: #97A0AF; `;
const MoveButton = styled.TouchableOpacity``;
const PriorityBadge = styled.View<{ priority: string }>` padding-horizontal: 6px; padding-vertical: 2px; border-radius: 3px; background-color: ${props => props.priority === 'Alta' ? '#FCE8E6' : props.priority === 'Média' ? '#FFF9DB' : '#E2FCEF'}; `;
const PriorityText = styled.Text<{ priority: string }>` font-size: 10px; font-weight: bold; color: ${props => props.priority === 'Alta' ? '#EB5A46' : props.priority === 'Média' ? '#B59E00' : '#61BD4F'}; `;
const AddTaskInlineBtn = styled.TouchableOpacity` flex-direction: row; align-items: center; gap: 6px; padding-vertical: 6px; margin-top: 4px; `;
const AddTaskInlineText = styled.Text` color: #5E6C84; font-size: 13px; `;
const ModalBg = styled.View` flex: 1; background-color: rgba(0,0,0,0.4); justify-content: center; align-items: center; `;
const ModalBox = styled.View` background-color: #FFF; padding: 20px; border-radius: 8px; `;
const ModalTitleRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; width: 100%; `;
const ModalTitle = styled.Text` font-size: 15px; font-weight: bold; color: #172B4D; margin-bottom: 12px; `;
const Input = styled.TextInput` height: 40px; border-width: 1px; border-color: #DFE1E6; border-radius: 4px; padding-horizontal: 10px; margin-bottom: 12px; color: #172B4D; width: 100%; `;
const ModalButtons = styled.View` flex-direction: row; justify-content: flex-end; gap: 10px; width: 100%; `;
const ModalBtn = styled.TouchableOpacity` padding-horizontal: 14px; padding-vertical: 8px; border-radius: 4px; `;
const BtnTxt = styled.Text` font-weight: bold; font-size: 13px; `;
const SaveBtn = styled.TouchableOpacity` height: 42px; border-radius: 4px; justify-content: center; align-items: center; margin-top: 5px; width: 100%; `;
const CancelBtn = styled.TouchableOpacity` height: 42px; justify-content: center; align-items: center; margin-top: 5px; width: 100%; `;
const LabelText = styled.Text` font-size: 13px; font-weight: 600; color: #5E6C84; margin-bottom: 6px; margin-top: 4px; `;
const PrioritySelectorRow = styled.View` flex-direction: row; gap: 8px; width: 100%; justify-content: space-between; `;
const PriorityOptionBtn = styled.TouchableOpacity` flex: 1; height: 36px; border-radius: 4px; justify-content: center; align-items: center; background-color: #F4F5F7; `;
const PriorityOptionText = styled.Text` font-size: 12px; `;