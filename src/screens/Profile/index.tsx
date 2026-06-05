import React from 'react';
import { Alert, Switch, ScrollView, Platform, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../hooks/useAuthStore';

export default function Profile() {
  // Chamada atualizada com o "logoutUser" do Firebase
  const { user, logoutUser, isDarkMode, toggleTheme, updateAvatar } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sair do Aplicativo',
      'Tem certeza que deseja acessar outra conta no MylitED?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => { 
            try {
              await logoutUser(); 
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
            }
          } 
        }
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos para alterar o avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      updateAvatar(result.assets[0].uri);
    }
  };

  const getInitials = (name: string = 'Edson') => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Container>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
      >
        
        {/* CARD DO AVATAR EXPANDIDO */}
        <ProfileHeaderCard>
          <TouchableOpacity activeOpacity={0.8} onPress={pickImage}>
            <AvatarLarge>
              {user?.avatarUrl ? (
                <StyledImage source={{ uri: user.avatarUrl }} />
              ) : (
                <AvatarText>{getInitials(user?.name)}</AvatarText>
              )}
              <CameraBadge>
                <Ionicons name="camera" size={14} color="#FFF" />
              </CameraBadge>
            </AvatarLarge>
          </TouchableOpacity>
          
          <ProfileName>{user?.name || 'Edson'}</ProfileName>
          <ProfileSub>Estudante de ADS • CESMAC</ProfileSub>
        </ProfileHeaderCard>

        {/* SEÇÃO DA APARÊNCIA */}
        <SectionTitle>Aparência do Aplicativo</SectionTitle>
        <ThemeToggleCard>
          <ThemeLeftRow>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#0079BF" />
            <ThemeLabelText>Modo Escuro Ativo</ThemeLabelText>
          </ThemeLeftRow>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#DFE1E6', true: '#579DFF' }}
            thumbColor={isDarkMode ? '#0079BF' : '#F4F5F7'}
          />
        </ThemeToggleCard>

        {/* SEÇÃO DE INFORMAÇÕES DO USUÁRIO */}
        <SectionTitle>Informações do Usuário</SectionTitle>
        <InfoCard>
          <InfoRow>
            <Ionicons name="mail-outline" size={20} color="#0079BF" />
            <InfoContent>
              <InfoLabel>E-mail Cadastrado</InfoLabel>
              <InfoValue>{user?.email || 'edson@gmail.com'}</InfoValue>
            </InfoContent>
          </InfoRow>
          
          <Divider />
          
          <InfoRow>
            <Ionicons name="school-outline" size={20} color="#0079BF" />
            <InfoContent>
              <InfoLabel>Instituição de Ensino</InfoLabel>
              <InfoValue>Centro Universitário CESMAC</InfoValue>
            </InfoContent>
          </InfoRow>
          
          <Divider />
          
          <InfoRow>
            <Ionicons name="briefcase-outline" size={20} color="#0079BF" />
            <InfoContent>
              <InfoLabel>Cargo / Atuação</InfoLabel>
              <InfoValue>Auxiliar de TI</InfoValue>
            </InfoContent>
          </InfoRow>
        </InfoCard>

        {/* BOTÃO DE LOGOUT */}
        <LogoutButton activeOpacity={0.8} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <LogoutButtonText>Encerrar Sessão</LogoutButtonText>
        </LogoutButton>

        <VersionText>MylitED v1.0.0 — 2026</VersionText>
      </ScrollView>
    </Container>
  );
}

// --- ESTILIZAÇÃO (STYLED COMPONENTS) ---
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
  padding-horizontal: 24px;
`;

const ProfileHeaderCard = styled.View`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  align-items: center;
  border-width: 1px;
  border-color: ${(props) => props.theme.colors.border};
  margin-top: ${Platform.OS === 'android' ? '20px' : '10px'};
  margin-bottom: 20px;
  elevation: 3;
`;

const AvatarLarge = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${(props) => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
`;

const StyledImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const AvatarText = styled.Text`
  color: #FFFFFF;
  font-size: 28px;
  font-weight: bold;
`;

const CameraBadge = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #0079BF;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: #FFF;
`;

const ProfileName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ProfileSub = styled.Text`
  font-size: 13px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 4px;
`;

const SectionTitle = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 8px;
  margin-top: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ThemeToggleCard = styled.View`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${(props) => props.theme.colors.border};
  padding: 12px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  elevation: 1;
`;

const ThemeLeftRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ThemeLabelText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const InfoCard = styled.View`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${(props) => props.theme.colors.border};
  padding-horizontal: 16px;
  margin-bottom: 24px;
  elevation: 1;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 14px;
  gap: 12px;
`;

const InfoContent = styled.View`
  flex: 1;
`;

const InfoLabel = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const InfoValue = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-top: 2px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${(props) => props.theme.colors.border};
`;

const LogoutButton = styled.TouchableOpacity`
  height: 48px;
  background-color: ${(props) => props.theme.colors.danger};
  border-radius: 8px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  elevation: 2;
  margin-top: 10px;
`;

const LogoutButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 15px;
  font-weight: bold;
`;

const VersionText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.placeholder};
  text-align: center;
  margin-top: 25px;
  padding-bottom: 10px;
`;