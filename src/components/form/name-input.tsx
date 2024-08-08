import React from 'react';
import type Validator from 'react-native-ui-lib';
import { Colors, TextField } from 'react-native-ui-lib';

import IconProfile from '@/../assets/icons/profile.svg';

import { styles } from './styles';

type PropTypes = {
  placeholder?: string;
  validate?:
    | Validator.Incubator.TextFieldValidator
    | Validator.Incubator.TextFieldValidator[];
  validationMessage?: string | string[];
  onChangeValidity?: (isValid: boolean) => void;
  onChangeText?: (text: string) => void;
  validateOnChange?: boolean;
};

export const NameInput = React.forwardRef<
  Validator.Incubator.TextFieldRef,
  PropTypes
>(
  (
    {
      placeholder = 'Name',
      validate,
      validationMessage,
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
        placeholderTextColor={Colors.grey_1}
        validate={validate}
        validationMessage={validationMessage}
        validateOnBlur
        autoCapitalize="words"
        leadingAccessory={<IconProfile stroke={Colors.grey_2} />}
        onChangeText={onChangeText}
        onChangeValidity={onChangeValidity}
      />
    );
  }
);
