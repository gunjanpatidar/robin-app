import React from 'react';
import type Validator from 'react-native-ui-lib';
import { Colors, TextField } from 'react-native-ui-lib';

import IconPassword from '@/../assets/icons/password.svg';

import { styles } from './styles';

type PropTypes = {
  placeholder?: string;
  compareWith?: string;
  minLength?: number;
  onChangeText?: (text: string) => void;
  onChangeValidity?: (isValid: boolean) => void;
};

export const PasswordInput = React.forwardRef<
  Validator.Incubator.TextFieldRef,
  PropTypes
>(
  (
    {
      placeholder = 'Password',
      compareWith,
      minLength = 6,
      onChangeText,
      onChangeValidity,
    }: PropTypes,
    ref
  ) => {
    return (
      <TextField
        ref={ref}
        style={styles.formInput}
        containerStyle={styles.formFieldContainer}
        fieldStyle={styles.formField}
        floatingPlaceholderStyle={styles.formPlaceholder}
        validationMessageStyle={styles.formFieldValidationMessage}
        placeholder={placeholder}
        enableErrors
        floatingPlaceholder
        validate={[
          'required',
          (value: string) => minLength === 0 || value.length > minLength,
          (value: string) => compareWith && value === compareWith,
        ]}
        validationMessage={[
          'Password is required',
          'Password is too short',
          'Passwords do not match',
        ]}
        validateOnBlur
        validateOnChange
        leadingAccessory={<IconPassword stroke={Colors.grey_2} />}
        autoCapitalize="none"
        secureTextEntry
        onChangeText={onChangeText}
        onChangeValidity={onChangeValidity}
      />
    );
  }
);
