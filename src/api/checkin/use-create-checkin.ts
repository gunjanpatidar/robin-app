import { useMutation } from '@tanstack/react-query';

import { client } from '../common';
import type { Status } from '../types';

export type CreateCheckinResponse = {
  status: Status;
  checkin_id: string;
};

export type CreateCheckinRequest = {
  event_id: string;
  caption: string;
  photos: string[];
};

export const useCreateCheckin = () => {
  return useMutation({
    scope: {
      id: 'event.checkin.create',
    },
    mutationFn: async (
      data: CreateCheckinRequest
    ): Promise<CreateCheckinResponse> => {
      return client
        .post(`event/${data.event_id}/checkin`, data)
        .then((response) => response.data);
    },
  });
};
