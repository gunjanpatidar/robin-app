/* eslint-disable max-lines-per-function */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { Button, Colors, Incubator, Text, View } from 'react-native-ui-lib';

import { useVerify } from '@/api/auth/use-verify';
import RHA from '@/components';
import { HeaderWithLogo } from '@/components/ui/header-with-logo';
import { useAuth } from '@/core';

export default function VerificationScreen() {
  const { user_id } = useLocalSearchParams();
  const signIn = useAuth.use.signIn();

  const {
    data: verifyResponse,
    error: errorVerify,
    isPending: isPendingVerify,
    mutate: verify,
  } = useVerify();

  const CELL_COUNT = 6;
  const [otp, setOTP] = useState('');
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOTP,
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

  const [state, setState] = useState({
    disabled: true,
  });

  useEffect(() => {
    if (otp.length === CELL_COUNT) {
      setState((s) => {
        return { ...s, disabled: false };
      });
    } else {
      setState((s) => {
        return { ...s, disabled: true };
      });
    }
  }, [otp]);

  const onSubmit = () => {
    verify({
      user_id: user_id as string,
      otp: Number(otp),
    });
  };

  useEffect(() => {
    if (verifyResponse?.status) {
      if (verifyResponse?.status.success && verifyResponse?.token) {
        signIn({
          token: verifyResponse?.token,
        });

        router.navigate('/');
      } else {
        setToast({
          visible: true,
          message:
            verifyResponse?.status.message ||
            'Verification failed, please try again',
          type: 'failure',
        });
      }
    }
  }, [verifyResponse, signIn]);

  useEffect(() => {
    let msg = verifyResponse?.status.message || '';

    if (errorVerify) {
      setToast({
        visible: true,
        message:
          msg ||
          errorVerify.message ||
          'Something went wrong, please try again',
        type: 'failure',
      });
    }
  }, [errorVerify, verifyResponse]);

  const onResend = () => {
    // TODO
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
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
        visible={isPendingVerify}
        message="verifying code..."
        type="loading"
      />

      <HeaderWithLogo />

      <View style={{ marginHorizontal: 24, alignItems: 'center' }}>
        <RHA.Type.H1>Verification</RHA.Type.H1>
        <Text style={styles.subheading}>
          We've sent you the verification code on your email
        </Text>

        <CodeField
          ref={ref}
          {...props}
          value={otp}
          onChangeText={setOTP}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cellRoot, isFocused && styles.focusCell]}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        <Button
          link
          linkColor={Colors.grey_2}
          marginT-32
          label="Re-send code"
          onPress={onResend}
        />

        <RHA.Form.Button
          label="Continue"
          iconOnRight
          iconSource={RHA.Icons.render(RHA.Icons.ArrowRight, {
            stroke: Colors.white,
          })}
          style={{ marginTop: 36, alignSelf: 'stretch' }}
          disabled={state.disabled}
          onPress={onSubmit}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginTop: 20,
    width: 300,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cellRoot: {
    width: 36,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: Colors.grey_1,
    borderBottomWidth: 2,
  },
  cellText: {
    color: Colors.rhaBlack,
    fontSize: 28,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: Colors.rhaGreen,
    borderBottomWidth: 2,
  },
  subheading: {
    color: Colors.rha_black,
    textAlign: 'center',
    marginBottom: 36,
  },
});
