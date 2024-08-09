/* eslint-disable max-lines-per-function */
import { Link, router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { TextFieldRef } from 'react-native-ui-lib';
import { Button, Colors, Incubator, Text, View } from 'react-native-ui-lib';

import FacebookLogo from '@/../assets/icons/facebook_logo.svg';
import GoogleLogo from '@/../assets/icons/google_logo.svg';
import { useSignup } from '@/api/auth/use-signup';
import RHA from '@/components';
import { HeaderWithLogo } from '@/components/ui/header-with-logo';

const initialState: {
  first_name: string;
  last_name: string;
  email_id: string;
  password: string;
  confirm_password: string;
} = {
  first_name: '',
  last_name: '',
  email_id: '',
  password: '',
  confirm_password: '',
};

export default function SignupScreen() {
  let firstNameInputRef = useRef<TextFieldRef>(null);
  let lastNameInputRef = useRef<TextFieldRef>(null);
  let emailInputRef = useRef<TextFieldRef>(null);
  let passwordInputRef = useRef<TextFieldRef>(null);
  let confirmPasswordInputRef = useRef<TextFieldRef>(null);

  const [state, setState] = React.useState(initialState);

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
    mutate: signup,
    isPending: isSignupRequestPending,
    error: errorSignup,
    data: signupResponse,
  } = useSignup();

  useEffect(() => {
    if (state.password !== '' && state.confirm_password !== '') {
      passwordInputRef.current?.validate();
      confirmPasswordInputRef.current?.validate();
    }
  }, [state.password, state.confirm_password]);

  useEffect(() => {
    if (errorSignup) {
      console.log('errorSignup', errorSignup);

      setToast({
        visible: true,
        message: 'Something went wrong, please try again',
        type: 'failure',
      });
    }
  }, [errorSignup]);

  useEffect(() => {
    if (signupResponse) {
      if (signupResponse.status.success) {
        router.push({
          pathname: '/auth/verification',
          params: {
            user_id: signupResponse.user_id,
          },
        });
      } else {
        setToast({
          visible: true,
          message: 'Something went wrong, please try again',
          type: 'failure',
        });
      }
    }
  }, [signupResponse]);

  const onSubmit = () => {
    const isFirstNameValid = firstNameInputRef.current?.validate?.();
    const isLastNameValid = lastNameInputRef.current?.validate();
    const isEmailValid = emailInputRef.current?.validate();
    const isPasswordValid = passwordInputRef.current?.validate();
    const isConfirmPasswordValid = confirmPasswordInputRef.current?.validate();
    if (
      isFirstNameValid === false ||
      isLastNameValid === false ||
      isEmailValid === false ||
      isPasswordValid === false ||
      isConfirmPasswordValid === false
    ) {
      return;
    }

    signup({
      first_name: state.first_name,
      last_name: state.last_name,
      email_id: state.email_id,
      password: state.password,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sign Up',
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
        visible={isSignupRequestPending}
        type="loading"
        message={'Signing up...'}
        messageStyle={{ color: Colors.white }}
        containerStyle={{ backgroundColor: Colors.rgba(Colors.grey_3, 0.9) }}
      />

      <HeaderWithLogo />

      <ScrollView
        style={{ paddingHorizontal: 24 }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <RHA.Type.H1>Sign Up</RHA.Type.H1>

        <View row>
          <RHA.Form.NameInput
            ref={firstNameInputRef}
            placeholder={'First Name'}
            validate={['required']}
            validationMessage={['First name is required']}
            onChangeText={(text) => setState({ ...state, first_name: text })}
          />
          <RHA.Form.NameInput
            ref={lastNameInputRef}
            placeholder={'Last Name'}
            validate={['required']}
            validationMessage={['Last name is required']}
            onChangeText={(text) => setState({ ...state, last_name: text })}
          />
        </View>
        <RHA.Form.EmailInput
          ref={emailInputRef}
          onChangeText={(text) => setState({ ...state, email_id: text })}
        />
        <RHA.Form.PasswordInput
          ref={passwordInputRef}
          onChangeText={(text) => {
            setState({ ...state, password: text });
          }}
        />
        <RHA.Form.PasswordInput
          ref={confirmPasswordInputRef}
          placeholder="Confirm Password"
          compareWith={state.password}
          onChangeText={(text) => {
            setState({ ...state, confirm_password: text });
          }}
        />

        <RHA.Form.Button
          label="Sign Up"
          iconOnRight
          iconSource={RHA.Icons.render(RHA.Icons.ArrowRight, {
            stroke: Colors.white,
          })}
          style={{ marginTop: 36, alignSelf: 'stretch' }}
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

        <Text
          marginV-48
          style={{
            color: Colors.rhaBlack,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ fontWeight: 900, color: Colors.rhaGreen }}
          >
            Login
          </Link>
        </Text>
      </ScrollView>
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
