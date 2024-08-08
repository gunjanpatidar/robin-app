/* eslint-disable max-lines-per-function */
import { Link, router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Colors, Incubator, Text, View } from 'react-native-ui-lib';

import FacebookLogo from '@/../assets/icons/facebook_logo.svg';
import GoogleLogo from '@/../assets/icons/google_logo.svg';
import type { LoginRequest } from '@/api/auth/use-login';
import { useLogin } from '@/api/auth/use-login';
import RHA from '@/components';
import { useAuth } from '@/core';

export default function LoginScreen() {
  const signIn = useAuth.use.signIn();

  const [state, setState] = useState<LoginRequest>({
    email_id: '',
    password: '',
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: Incubator.ToastPresets | 'success' | 'failure';
  }>({
    visible: false,
    message: '',
    type: 'failure',
  });

  const {
    mutate: login,
    isPending: isLoginRequestPending,
    error: errorLogin,
    data: loginResponse,
  } = useLogin();

  const onSubmit = () => {
    login(state);
  };

  useEffect(() => {
    let msg = loginResponse?.status.message;

    if (errorLogin) {
      console.log('error:', errorLogin, msg);

      setToast({
        visible: true,
        message: msg || 'Something went wrong, please try again',
        type: 'failure',
      });
    }
  }, [errorLogin, loginResponse]);

  useEffect(() => {
    if (loginResponse) {
      if (loginResponse.status.success) {
        signIn({ token: loginResponse.token });
        router.push('/');
      } else {
        setToast({
          visible: true,
          message:
            loginResponse.status.message ||
            'Something went wrong, please try again',
          type: 'failure',
        });
      }
    }
  }, [loginResponse, signIn]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Login',
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />

      <Incubator.Toast
        visible={toast.visible}
        message={toast.message}
        position={'top'}
        preset={toast.type}
        backgroundColor={Colors.red70}
        autoDismiss={10000}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setToast({ ...toast, visible: false });
          },
        }}
        onDismiss={() => {
          setToast({ ...toast, visible: false });
        }}
      />

      <RHA.UI.Overlay
        visible={isLoginRequestPending}
        type="loading"
        message={'Signin up...'}
        messageStyle={{ color: Colors.white }}
        containerStyle={{ backgroundColor: Colors.rgba(Colors.grey_3, 0.9) }}
      />

      <RHA.UI.HeaderWithLogo />

      <View style={{ marginHorizontal: 24, alignItems: 'center' }}>
        <RHA.Type.H1>Login</RHA.Type.H1>

        <RHA.Form.EmailInput
          onChangeText={(text) => setState({ ...state, email_id: text })}
        />
        <RHA.Form.PasswordInput
          minLength={0}
          onChangeText={(text) => setState({ ...state, password: text })}
        />

        <Link
          href="/auth/reset-password"
          style={{ alignSelf: 'flex-end', paddingVertical: 4 }}
        >
          Forgot Password?
        </Link>

        <RHA.Form.Button
          label="Login"
          iconOnRight
          iconSource={RHA.Icons.render(RHA.Icons.ArrowRight, {
            stroke: Colors.white,
          })}
          style={{ marginTop: 24, alignSelf: 'stretch' }}
          onPress={onSubmit}
        />

        <Text marginV-24 style={{ color: Colors.grey_2 }}>
          OR
        </Text>

        <Button
          label="Login with Google"
          iconSource={GoogleLogoIcon}
          backgroundColor={Colors.white}
          borderRadius={12}
          labelStyle={styles.socialButtonLabel}
          style={styles.socialButton}
        />

        <Button
          marginT-16
          label="Login with Facebook"
          iconSource={FacebookLogoIcon}
          backgroundColor={Colors.white}
          style={styles.socialButton}
          labelStyle={styles.socialButtonLabel}
          borderRadius={12}
        />

        <Text marginT-24>
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            style={{
              color: Colors.rhaGreen,
              fontFamily: 'poppinsSemiBold',
              fontWeight: 'bold',
            }}
          >
            Sign up
          </Link>
        </Text>
      </View>
    </>
  );
}

function GoogleLogoIcon() {
  return <GoogleLogo />;
}

function FacebookLogoIcon() {
  return <FacebookLogo />;
}

const styles = StyleSheet.create({
  socialButton: {
    alignSelf: 'stretch',
    elevation: 4,
    height: 56,
    shadowColor: '#443E3E56',
    borderWidth: 1,
    borderColor: '#E5E5E555',
  },
  socialButtonLabel: {
    color: Colors.rhaBlack,
    paddingLeft: 12,
  },
});
