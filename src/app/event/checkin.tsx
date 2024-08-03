/* eslint-disable max-lines-per-function */
import type { UseMutateFunction } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { TextFieldRef } from 'react-native-ui-lib';
import {
  Colors,
  Image,
  Incubator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native-ui-lib';

import { useGetEvent } from '@/api';
import type {
  CreateCheckinRequest,
  CreateCheckinResponse,
} from '@/api/checkin/use-create-checkin';
import { useCreateCheckin } from '@/api/checkin/use-create-checkin';
import { useUploadCheckinPhoto } from '@/api/checkin/use-upload-checkin-photo';
import RHA from '@/components';
import { getDateString, getTimeString } from '@/core';

type Photo = {
  uri: string;
  type?: string;
  name?: string | null;
  serverFilename: string | null;
};

const initialState: {
  caption: string;
} = {
  caption: '',
};

export default function CheckinScreen() {
  let captionInputRef = useRef<TextFieldRef>(null);

  const { event_id } = useLocalSearchParams();
  const { data: getEventResponse, isLoading: isLoadingGetEvent } = useGetEvent({
    event_id: event_id as string,
  });

  const [state, setState] = useState(initialState);
  const [checkinPhotos, setCheckinPhotos] = useState<Photo[]>([]);

  const [overlay, setOverlay] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: '',
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
    mutate: createCheckin,
    isPending: isPendingCreateCheckin,
    data: createCheckinResponse,
    error: createCheckinError,
  } = useCreateCheckin();

  useEffect(() => {
    setOverlay({
      visible: isLoadingGetEvent || isPendingCreateCheckin,
      message: isLoadingGetEvent
        ? 'fetching event details...'
        : 'checking in...',
    });
  }, [isLoadingGetEvent, isPendingCreateCheckin]);

  useEffect(() => {
    if (createCheckinResponse?.status.success) {
      router.replace('/event/checkin-success');
    } else if (createCheckinError) {
      setToast({
        visible: true,
        message: createCheckinError.message,
        type: 'failure',
      });
    }
  }, [createCheckinResponse, createCheckinError]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      exif: true,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      orderedSelection: true,
    });

    console.log(result);

    if (!result.canceled) {
      setCheckinPhotos([
        ...checkinPhotos,
        {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType,
          name: result.assets[0].fileName,
          serverFilename: null,
        },
      ]);
      hideDialog();
    }
  };

  const captureImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
      exif: true,
    });

    console.log(result);
    console.log(result.assets?.[0].exif);

    if (!result.canceled) {
      setCheckinPhotos([
        ...checkinPhotos,
        {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType,
          name: result.assets[0].fileName,
          serverFilename: null,
        },
      ]);
      hideDialog();
    }
  };

  const removePhoto = (index: number) => {
    const newImages = checkinPhotos.filter((_, idx) => idx !== index);
    setCheckinPhotos(newImages);
  };

  const [isDialogVisible, setDialogVisible] = useState(false);
  const showDialog = () => {
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Check In',
        }}
      />

      {overlay.visible && (
        <RHA.UI.Overlay message={overlay.message} type="loading" />
      )}

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

      <Incubator.Dialog
        bottom
        visible={isDialogVisible}
        onDismiss={hideDialog}
        headerProps={{ title: '', showDivider: false }}
        width={'100%'}
        containerStyle={{ marginBottom: -4 }}
      >
        <View
          style={{
            padding: 20,
            marginVertical: 20,
            backgroundColor: Colors.white,
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            style={{
              borderBottomColor: Colors.grey_1,
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16, lineHeight: 56 }}>
              Pick from photo gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={captureImage}>
            <Text style={{ fontSize: 16, lineHeight: 56 }}>
              Capture using camera
            </Text>
          </TouchableOpacity>
        </View>
      </Incubator.Dialog>

      <View style={styles.header}>
        <Text style={styles.heading}>CHECKING IN FOR EVENT</Text>
        <Text style={styles.eventTitle}>
          {getEventResponse?.event.title || 'Event Title'}
        </Text>
        <Text style={styles.eventSubTitle}>
          {getDateString(getEventResponse?.event.start_time)}
          &nbsp;&nbsp;&middot;&nbsp;&nbsp;
          {getTimeString(getEventResponse?.event.start_time)}
        </Text>
      </View>

      <ScrollView style={{ padding: 20 }}>
        <Text>Upload pictures from the drive</Text>
        <ScrollView
          horizontal
          style={{
            flexDirection: 'row',
            paddingBottom: 10,
          }}
        >
          {checkinPhotos.map((photo, idx) => (
            <CheckinPhoto
              key={idx}
              event_id={getEventResponse?.event.event_id || ''}
              photo={photo}
              onRemove={() => removePhoto(idx)}
              checkinPhotos={checkinPhotos}
              setCheckinPhotos={setCheckinPhotos}
              setToast={setToast}
            />
          ))}

          <TouchableOpacity style={styles.addImageButton} onPress={showDialog}>
            <RHA.Icons.Plus stroke={Colors.rha_green} height={18} width={18} />
          </TouchableOpacity>
        </ScrollView>

        <RHA.Form.Input
          placeholder="Add a caption..."
          ref={captionInputRef}
          multiline
          numberOfLines={4}
          value={state.caption}
          onChangeText={(text) => setState({ ...state, caption: text })}
          validate={['required']}
          validationMessage={['Caption is required']}
          validateOnChange
        />
      </ScrollView>
      <RHA.Form.Button
        margin-20
        label="Submit"
        onPress={() =>
          onSubmit({ checkinPhotos, captionInputRef, setToast, createCheckin })
        }
      />
    </>
  );
}

// checks if photos are present and all of them have been uploaded
// (serverFilename is not null)
const validateCheckinPhotos = (photos: Photo[]) => {
  console.log('validate photos', photos);

  if (photos.length === 0) {
    return false;
  }

  for (const photo of photos) {
    if (!photo.serverFilename) {
      return false;
    }
  }

  return true;
};

const onSubmit = ({
  checkinPhotos,
  captionInputRef,
  setToast,
  createCheckin,
}: {
  checkinPhotos: Photo[];
  captionInputRef: React.RefObject<TextFieldRef>;
  setToast: React.Dispatch<any>;
  createCheckin: UseMutateFunction<
    CreateCheckinResponse,
    Error,
    CreateCheckinRequest,
    unknown
  >;
}) => {
  const isPhotosValid = validateCheckinPhotos(checkinPhotos);
  if (!isPhotosValid) {
    setToast({
      visible: true,
      message: 'At least one Photo is required',
      type: 'failure',
    });
    return;
  }

  const isCaptionValid = captionInputRef.current?.validate();
  if (isCaptionValid === false) {
    return;
  }

  createCheckin({
    event_id: 'event_id',
    caption: 'caption',
    photos: checkinPhotos.map((photo) => photo.serverFilename || ''),
  });
};

function CheckinPhoto({
  photo,
  event_id,
  onRemove,
  checkinPhotos,
  setCheckinPhotos,
  setToast,
}: {
  photo: Photo;
  event_id: string;
  onRemove: () => void;
  checkinPhotos: Photo[];
  setCheckinPhotos: (photos: Photo[]) => void;
  setToast: React.Dispatch<any>;
}) {
  const {
    mutate: uploadPhoto,
    isPending,
    data: response,
    error,
  } = useUploadCheckinPhoto();

  useEffect(() => {
    if (photo.serverFilename === null) {
      uploadPhoto({
        event_id: event_id,
        file: { uri: photo.uri, type: photo.type, name: photo.name },
      });
    }
  }, [uploadPhoto, event_id, photo]);

  useEffect(() => {
    if (response?.name && photo.serverFilename !== response.name) {
      setCheckinPhotos(
        checkinPhotos.map((p) => {
          return p.uri === photo.uri
            ? { ...p, serverFilename: response.name }
            : p;
        })
      );
    }
  }, [response, checkinPhotos, setCheckinPhotos, photo]);

  useEffect(() => {
    if (error) {
      setToast({
        visible: true,
        message: error.message + ', please try again',
        type: 'failure',
      });

      setCheckinPhotos(checkinPhotos.filter((p) => p.uri !== photo.uri));
    }
  }, [error, setToast, checkinPhotos, setCheckinPhotos, photo]);

  return (
    <View style={styles.imageContainer}>
      <TouchableOpacity style={styles.removeImageButton} onPress={onRemove}>
        <RHA.Icons.Plus
          stroke={Colors.white}
          rotation={-45}
          width={14}
          height={14}
        />
      </TouchableOpacity>
      <View style={styles.imageListItem}>
        <Image style={styles.image} source={{ uri: photo.uri }} />
        {isPending && (
          <View style={styles.imageOverlay}>
            <LottieView
              loop={true}
              speed={1}
              autoPlay
              style={styles.imageLoadingAnimation}
              source={require('@/../assets/lottie/loading.lottie')}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    paddingVertical: 20,
    paddingRight: 20,
  },
  imageListItem: {
    width: 80,
    height: 80,
    borderWidth: 1,
    backgroundColor: Colors.grey_1,
    borderColor: Colors.rha_green,
  },
  removeImageButton: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: Colors.red40,
    width: 24,
    height: 24,
    borderRadius: 24,
    right: 12,
    top: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: Colors.rgba(Colors.black, 0.2),
    alignContent: 'center',
    justifyContent: 'center',
  },
  imageLoadingAnimation: {
    marginLeft: 10,
    width: 60,
    height: 60,
  },
  addImageButton: {
    marginTop: 20,
    width: 80,
    height: 80,
    borderWidth: 1,
    backgroundColor: Colors.rgba(Colors.rha_green, 0.1),
    borderColor: Colors.rha_green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.rgba(Colors.rha_green, 0.1),
  },
  heading: {
    fontFamily: 'Poppins_400Regular',
    color: Colors.rha_green,
    fontSize: 14,
    marginBottom: 12,
  },
  eventTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.rha_black,
  },
  eventSubTitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.rha_grey3,
  },
});
