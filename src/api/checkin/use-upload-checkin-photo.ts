import { useMutation } from '@tanstack/react-query';
import FormData from 'form-data';

import { client } from '../common';
import type { Status } from '../types';

export type CheckinPhotoUploadResponse = {
  status: Status;
  name: string;
};

export type CheckinPhotoUploadRequest = {
  event_id: string;
  file: {
    uri: string;
    type?: string;
    name?: string | null;
  };
};

export const useUploadCheckinPhoto = () => {
  return useMutation({
    // Not using scope to make all photo uploads run in parallel
    // Uncomment this to serialize uploads
    // scope: {
    //   id: 'checkin.photo.create',
    // },
    mutationFn: async (
      data: CheckinPhotoUploadRequest
    ): Promise<CheckinPhotoUploadResponse> => {
      const formData = new FormData();
      formData.append('event_id', data.event_id);
      formData.append('file', data.file);

      return client
        .post(`photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => response.data);
    },
  });
};
