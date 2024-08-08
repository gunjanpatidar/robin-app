import { useMutation } from '@tanstack/react-query';

import { client } from '../common';
import type { Status } from '../types';

export type LoginResponse = {
  status: Status;
  token: string;
};

export type LoginRequest = {
  email_id: string;
  password: string;
};

export const useLogin = () => {
  return useMutation({
    scope: {
      id: 'auth.login',
    },
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      return client.post(`auth/login`, data).then((response) => response.data);
    },
  });
};
