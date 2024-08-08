import { useMutation } from '@tanstack/react-query';

import { client } from '../common';
import type { Status } from '../types';

export type VerifyResponse = {
  status: Status;
  token: string;
};

export type VerifyRequest = {
  user_id: string;
  otp: number;
};

export const useVerify = () => {
  return useMutation({
    scope: {
      id: 'auth.verify',
    },
    mutationFn: async (data: VerifyRequest): Promise<VerifyResponse> => {
      return client.post(`auth/verify`, data).then((response) => response.data);
    },
  });
};
