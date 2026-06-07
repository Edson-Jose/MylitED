import React, { useState, useEffect } from 'react';
import { FlatList, Alert, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useAuthStore';

interface DayItem {
  dayName: string;   // Ex: "Seg"
  dayNumber: string; // Ex: "25"
  fullDate: string;  // Ex: "25/05/2026"
  isToday: boolean;
}

export default function Schedules() {
  const { schedules, deleteSchedule } = useAuthStore();
  const [weeklyDays, setWeeklyDays] = useState<DayItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));

  useEffect(() => {
    generateCurrentWeek();
  }, []);

  const generateCurrentWeek = () => {
    const current = new Date();
    const week: DayItem[] = [];
    const sunday = new Date(current.setDate(current.getDate() - current.getDay()));
    const daysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      const formattedDate = nextDay.toLocaleDateString('pt-BR');
      const isToday = formattedDate === new Date().toLocaleDateString('pt-BR');

      week.push({
        dayName: daysLabels[i],
        dayNumber: String(nextDay.getDate()),
        fullDate: formattedDate,
        isToday,
      });
    }
    setWeeklyDays(week);
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert('Remover Compromisso', 'Deseja realmente remover este evento de sua agenda local e remota?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Remover', 
        style: 'destructive',
        onPress: () => deleteSchedule(id) // Agora deleta globalmente no Firebase
      }
    ]);
  };

  const eventsOfSelectedDay = schedules.filter((event: any) => event.date === selectedDate);

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <Container>
      <HeaderContainer>
        <TitleText>Minha Agenda</TitleText>
        <DateText>{todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}</DateText>
      </HeaderContainer>

      <WeeklyCalendarHorizontal>
        {weeklyDays.map((item) => {
          const hasEventOnThisDay = schedules.some((e: any) => e.date === item.fullDate);
          const isSelected = item.fullDate === selectedDate;

          return (
            <DayCard 
              key={item.fullDate}
              activeOpacity={0.8}
              onPress={() => setSelectedDate(item.fullDate)}
              isSelected={isSelected}
              isToday={item.isToday}
            >
              <DayNameText isSelected={isSelected} isToday={item.isToday}>{item.dayName}</DayNameText>
              <DayNumberText isSelected={isSelected} isToday={item.isToday}>{item.dayNumber}</DayNumberText>
              
              {hasEventOnThisDay && (
                <EventIndicatorDot isSelected={isSelected} />
              )}
            </DayCard>
          );
        })}
      </WeeklyCalendarHorizontal>

      <AgendaSectionTitle>
        Compromissos para {selectedDate === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : selectedDate}
      </AgendaSectionTitle>

      <FlatList
        data={eventsOfSelectedDay}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <EventCard>
            <TimeSection>
              <Ionicons name="time-outline" size={16} color="#0079BF" />
              <TimeText>{item.time}</TimeText>
              <CategoryBadge>{item.category}</CategoryBadge>
            </TimeSection>

            <ContentSection>
              <EventHeaderRow>
                <EventName>{item.name}</EventName>
                <TrashButton onPress={() => handleDeleteEvent(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#EB5A46" />
                </TrashButton>
              </EventHeaderRow>

              {item.description ? <EventDescription>{item.description}</EventDescription> : null}

              <FooterRow>
                <DateBadge>
                  <Ionicons name="calendar-outline" size={12} color="#5E6C84" />
                  <DateBadgeText>{item.date}</DateBadgeText>
                </DateBadge>

                <PriorityIndicator priority={item.priority}>
                  <PriorityIndicatorText priority={item.priority}>
                    Prioridade {item.priority}
                  </PriorityIndicatorText>
                </PriorityIndicator>
              </FooterRow>
            </ContentSection>
          </EventCard>
        )}
        ListEmptyComponent={
          <EmptyContainer>
            <Ionicons name="calendar-clear-outline" size={44} color="#97A0AF" />
            <EmptyText>Nenhum compromisso para este dia.</EmptyText>
            <EmptySubText>Selecione outro dia com marcador ou adicione eventos pela Home.</EmptySubText>
          </EmptyContainer>
        }
      />
    </Container>
  );
}

// Estilos originais mantidos intactos
const Container = styled.SafeAreaView` flex: 1; background-color: ${(props) => props.theme.colors.background}; `;
const HeaderContainer = styled.View` padding-horizontal: 24px; padding-top: 20px; margin-bottom: 12px; `;
const TitleText = styled.Text` font-size: 24px; font-weight: bold; color: ${(props) => props.theme.colors.textPrimary}; `;
const DateText = styled.Text` font-size: 13px; color: ${(props) => props.theme.colors.textSecondary}; margin-top: 2px; `;
const AgendaSectionTitle = styled.Text` font-size: 14px; font-weight: bold; color: ${(props) => props.theme.colors.textPrimary}; margin-horizontal: 24px; margin-top: 16px; margin-bottom: 8px; `;
const WeeklyCalendarHorizontal = styled.View` flex-direction: row; justify-content: space-between; background-color: ${(props) => props.theme.colors.surface}; margin-horizontal: 24px; padding: 12px; border-radius: 12px; border-width: 1px; border-color: ${(props) => props.theme.colors.border}; `;
const DayCard = styled.TouchableOpacity<{ isSelected: boolean; isToday: boolean }>` align-items: center; justify-content: center; width: 38px; height: 52px; border-radius: 8px; background-color: ${(props) => props.isSelected ? props.theme.colors.primary : props.isToday ? props.theme.colors.primary + '15' : 'transparent'}; border-width: ${(props) => props.isToday && !props.isSelected ? '1px' : '0px'}; border-color: ${(props) => props.theme.colors.primary}; `;
const DayNameText = styled.Text<{ isSelected: boolean; isToday: boolean }>` font-size: 11px; font-weight: 500; color: ${(props) => props.isSelected ? '#FFFFFF' : props.isToday ? props.theme.colors.primary : props.theme.colors.textSecondary}; `;
const DayNumberText = styled.Text<{ isSelected: boolean; isToday: boolean }>` font-size: 14px; font-weight: bold; margin-top: 2px; color: ${(props) => props.isSelected ? '#FFFFFF' : props.isToday ? props.theme.colors.primary : props.theme.colors.textPrimary}; `;
const EventIndicatorDot = styled.View<{ isSelected: boolean }>` width: 4px; height: 4px; border-radius: 2px; background-color: ${(props) => props.isSelected ? '#FFFFFF' : props.theme.colors.primary}; margin-top: 3px; `;
const EventCard = styled.View` background-color: ${(props) => props.theme.colors.surface}; border-radius: 8px; padding: 14px; margin-vertical: 6px; border-width: 1px; border-color: ${(props) => props.theme.colors.border}; `;
const TimeSection = styled.View` flex-direction: row; align-items: center; gap: 6px; border-bottom-width: 1px; border-color: ${(props) => props.theme.colors.background}; padding-bottom: 6px; margin-bottom: 8px; `;
const TimeText = styled.Text` font-size: 13px; font-weight: bold; color: ${(props) => props.theme.colors.primary}; `;
const CategoryBadge = styled.Text` font-size: 11px; background-color: ${(props) => props.theme.colors.background}; color: ${(props) => props.theme.colors.textSecondary}; padding-horizontal: 6px; padding-vertical: 2px; border-radius: 4px; margin-left: auto; `;
const ContentSection = styled.View``;
const EventHeaderRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; `;
const EventName = styled.Text` font-size: 15px; font-weight: 600; color: ${(props) => props.theme.colors.textPrimary}; flex: 1; `;
const TrashButton = styled.TouchableOpacity` padding: 4px; `;
const EventDescription = styled.Text` font-size: 13px; color: ${(props) => props.theme.colors.textSecondary}; margin-top: 2px; `;
const FooterRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-top: 8px; `;
const DateBadge = styled.View` flex-direction: row; align-items: center; gap: 4px; `;
const DateBadgeText = styled.Text` font-size: 12px; color: ${(props) => props.theme.colors.textSecondary}; `;
const PriorityIndicator = styled.View<{ priority: string }>` padding-horizontal: 6px; padding-vertical: 2px; border-radius: 4px; background-color: ${(props) => props.priority === 'Alta' ? '#FCE8E6' : props.priority === 'Média' ? '#FFF9DB' : '#E2FCEF'}; `;
const PriorityIndicatorText = styled.Text<{ priority: string }>` font-size: 11px; font-weight: bold; color: ${(props) => props.priority === 'Alta' ? '#EB5A46' : props.priority === 'Média' ? '#B59E00' : '#61BD4F'}; `;
const EmptyContainer = styled.View` align-items: center; justify-content: center; margin-top: 40px; padding-horizontal: 20px; gap: 6px; `;
const EmptyText = styled.Text` color: #172B4D; font-size: 15px; font-weight: 600; `;
const EmptySubText = styled.Text` color: #97A0AF; font-size: 12px; text-align: center; `;