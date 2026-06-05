import React, { useState } from 'react';
import { Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Esquema de validação com o YUP exigido pela faculdade
const AuthSchema = Yup.object().shape({
  email: Yup.string()
    .email('Insira um formato de e-mail válido (Ex: nome@dominio.com)')
    .required('O campo E-mail é estritamente obrigatório.'),
  password: Yup.string()
    .min(6, 'A senha precisa ter no mínimo 6 caracteres para sua segurança.')
    .required('A senha é obrigatória para efetuar o acesso.'),
  name: Yup.string().optional(), // Deixamos como opcional aqui, pois a validação manual já checa no submit
});

export default function Login() {
  const { loginUser, registerUser, isLoading } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuthAction = async (values: any, { resetForm }: any) => {
    if (isRegistering && !values.name.trim()) {
      Alert.alert('Aviso', 'Por favor, insira o seu Nome de Usuário.');
      return;
    }

    try {
      if (isRegistering) {
        await registerUser(values.email.trim(), values.name.trim(), values.password.trim());
        Alert.alert('Sucesso', 'Sua conta no MylitED foi criada!');
      } else {
        await loginUser(values.email.trim(), values.password.trim());
      }
    } catch (error: any) {
      console.log("Erro de Autenticação:", error.message);
      if (error.message.includes('email-already-in-use')) {
        Alert.alert('Erro', 'Este e-mail já está em uso por outro usuário.');
      } else if (error.message.includes('invalid-credential') || error.message.includes('wrong-password')) {
        Alert.alert('Erro', 'Credenciais incorretas. E-mail ou senha inválidos.');
      } else {
        Alert.alert('Erro', 'Falha na conexão com o banco de dados.');
      }
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          
          <LogoContainer>
            <LogoText>Mylit<LogoAccent>ED</LogoAccent></LogoText>
            <SubTitle>Suas anotações e agendamentos ágeis</SubTitle>
          </LogoContainer>

          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={AuthSchema}
            onSubmit={handleAuthAction}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <FormCard>
                <WelcomeText>
                  {isRegistering ? 'Crie sua Conta no MylitED' : 'Acesse sua Conta'}
                </WelcomeText>
                
                {isRegistering && (
                  <>
                    <Label>Nome de Usuário</Label>
                    <Input 
                      placeholder="Edson" 
                      placeholderTextColor="#97A0AF"
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                    />
                    {errors.name && touched.name && <ErrorText>{errors.name}</ErrorText>}
                  </>
                )}

                <Label>E-mail</Label>
                <Input 
                  placeholder="edson@gmail.com" 
                  placeholderTextColor="#97A0AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                />
                {errors.email && touched.email && <ErrorText>{errors.email}</ErrorText>}

                <Label>Senha</Label>
                <Input 
                  placeholder="Digite sua senha" 
                  placeholderTextColor="#97A0AF"
                  secureTextEntry
                  autoCapitalize="none"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                />
                {errors.password && touched.password && <ErrorText>{errors.password}</ErrorText>}

                {!isRegistering && <ForgotPasswordText>Esqueceu sua senha?</ForgotPasswordText>}

                <SubmitButton activeOpacity={0.8} onPress={() => handleSubmit()} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ButtonText>{isRegistering ? 'Cadastrar e Entrar' : 'Entrar'}</ButtonText>
                  )}
                </SubmitButton>

                <ToggleFormLink 
                  onPress={() => {
                    setIsRegistering(!isRegistering);
                  }} 
                  disabled={isLoading}
                >
                  <LinkText>
                    {isRegistering ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                    <LinkAccent>{isRegistering ? 'Fazer Login' : 'Cadastre-se'}</LinkAccent>
                  </LinkText>
                </ToggleFormLink>
              </FormCard>
            )}
          </Formik>

        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const Container = styled.SafeAreaView` flex: 1; background-color: ${(props) => props.theme.colors.background}; padding-horizontal: 24px; `;
const LogoContainer = styled.View` align-items: center; margin-bottom: 32px; `;
const LogoText = styled.Text` font-size: 36px; font-weight: bold; color: #1A2E4C; letter-spacing: 1px; `;
const LogoAccent = styled.Text` color: ${(props) => props.theme.colors.primary}; `;
const SubTitle = styled.Text` font-size: 14px; color: ${(props) => props.theme.colors.textSecondary}; margin-top: 6px; text-align: center; `;
const FormCard = styled.View` background-color: ${(props) => props.theme.colors.surface}; border-radius: 12px; padding: 24px; border-width: 1px; border-color: ${(props) => props.theme.colors.border}; elevation: 4; `;
const WelcomeText = styled.Text` font-size: 18px; font-weight: bold; color: ${(props) => props.theme.colors.textPrimary}; margin-bottom: 20px; `;
const Label = styled.Text` font-size: 13px; font-weight: 600; color: ${(props) => props.theme.colors.textSecondary}; margin-bottom: 6px; margin-top: 12px; `;
const Input = styled.TextInput` height: 46px; border-width: 1px; border-color: ${(props) => props.theme.colors.border}; border-radius: 8px; padding-horizontal: 14px; color: ${(props) => props.theme.colors.textPrimary}; background-color: rgba(0,0,0,0.01); font-size: 15px; `;
const ForgotPasswordText = styled.Text` font-size: 13px; color: ${(props) => props.theme.colors.primary}; text-align: right; margin-top: 8px; font-weight: 500; `;
const SubmitButton = styled.TouchableOpacity` height: 48px; background-color: ${(props) => props.theme.colors.primary}; border-radius: 8px; justify-content: center; align-items: center; margin-top: 24px; opacity: ${props => props.disabled ? 0.7 : 1}; `;
const ButtonText = styled.Text` color: #FFFFFF; font-size: 16px; font-weight: bold; `;
const ToggleFormLink = styled.TouchableOpacity` align-items: center; margin-top: 16px; padding-vertical: 10px; `;
const LinkText = styled.Text` font-size: 13px; color: ${(props) => props.theme.colors.textSecondary}; `;
const LinkAccent = styled.Text` color: ${(props) => props.theme.colors.primary}; font-weight: bold; `;
const ErrorText = styled.Text` font-size: 11px; color: #EB5A46; margin-top: 4px; font-weight: 500; `;