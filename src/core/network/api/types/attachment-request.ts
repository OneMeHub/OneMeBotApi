import { NullableObject } from '../../../helpers/types';

import { Button } from './keyboard';

type MediaPayloadRequest = {
  token?: string;
};

export type ImageAttachmentRequest = {
  type: 'image';
  payload: MediaPayloadRequest & {
    url?: string | null;
    photos?: {
      [key: string]: { token: string }
    } | null
  }
};

export type VideoAttachmentRequest = {
  type: 'video';
  payload: MediaPayloadRequest;
};

export type AudioAttachmentRequest = {
  type: 'audio';
  payload: MediaPayloadRequest;
};

export type FileAttachmentRequest = {
  type: 'file';
  payload: MediaPayloadRequest;
};

export type ContactAttachmentRequest = {
  type: 'contact';
  payload: {
    name: string | null;
    contact_id?: number | null;
    vcf_info?: string | null;
    vcf_phone?: string | null;
  }
};

export type StickerAttachmentRequest = {
  type: 'sticker';
  payload: {
    code: string
  };
};

export type InlineKeyboardAttachmentRequest = {
  type: 'inline_keyboard';
  payload: {
    buttons: Button[][]
  }
};

export type LocationAttachmentRequest = {
  type: 'location';
  latitude: number;
  longitude: number;
};

export type ShareAttachmentRequest = {
  type: 'share';
  payload: Partial<NullableObject<MediaPayloadRequest> & {
    url?: string | null;
  }>;
};

export type AttachmentRequest =
    | ImageAttachmentRequest
    | VideoAttachmentRequest
    | AudioAttachmentRequest
    | FileAttachmentRequest
    | StickerAttachmentRequest
    | ContactAttachmentRequest
    | InlineKeyboardAttachmentRequest
    | ShareAttachmentRequest
    | LocationAttachmentRequest;

export type AttachmentType = AttachmentRequest['type'];
