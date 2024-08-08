import { useMutation } from '@tanstack/react-query';

import { client } from '../common';
import type { Status } from '../types';

export type SignupResponse = {
  status: Status;
  user_id: string;
};

export type SignupRequest = {
  first_name: string;
  last_name: string;
  email_id: string;
  password: string;
};

export const useSignup = () => {
  return useMutation({
    scope: {
      id: 'auth.signup',
    },
    mutationFn: async (data: SignupRequest): Promise<SignupResponse> => {
      return client.post(`auth/signup`, data).then((response) => response.data);
    },
  });
};
