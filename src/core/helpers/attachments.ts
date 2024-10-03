import * as fs from 'node:fs';

import { type Api } from '../../api';
import { sleep, streamToBlob } from '../../utils';
import {
  type AudioAttachmentRequest,
  type FileAttachmentRequest,
  type ImageAttachmentRequest,
  type StickerAttachmentRequest,
  type VideoAttachmentRequest,
  type UploadType,
} from '../network/api';

type FileSource = string | Buffer | fs.ReadStream;

const MAX_ATTEMPTS = 5;

export class MediaAttachment {
  constructor(private readonly api: Api) {}

  private getBlobFromSource = async (source: FileSource): Promise<Blob> => {
    if (typeof source === 'string') {
      const stream = fs.createReadStream(source);
      return streamToBlob(stream);
    }

    if (source instanceof Buffer) {
      return new Blob([source]);
    }

    return streamToBlob(source);
  };

  private getUploadStatus = async (uploadUrl: string) => {
    const res = await fetch(uploadUrl);
    const progress = await res.text();

    return {
      status: res.status,
      progress,
    };
  };

  private upload = async <Res>(type: UploadType, blob: Blob, initialRetries?: number) => {
    if (initialRetries === MAX_ATTEMPTS) {
      throw new Error('Max retries reached');
    }

    const body = new FormData();
    body.append('data', blob);

    const { url: uploadUrl } = await this.api.raw.uploads.getUploadUrl({ type });

    const uploadController = new AbortController();
    const uploadInterval = setTimeout(() => uploadController.abort(), 20_000);

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body,
        signal: uploadController.signal,
      });

      const result = await res.json() as Res;

      let { progress } = await this.getUploadStatus(uploadUrl);

      let attempts = 0;

      while (progress && attempts <= MAX_ATTEMPTS) {
        await sleep(1500);
        const { progress: newProgress } = await this.getUploadStatus(uploadUrl);
        if (progress === newProgress) {
          attempts += 1;
        }
        progress = newProgress;
      }

      return result;
    } finally {
      clearTimeout(uploadInterval);
    }
  };

  uploadImage = async (
    options: { url: string } | { source: FileSource },
  ): Promise<ImageAttachmentRequest> => {
    if ('url' in options) {
      return {
        type: 'image',
        payload: { url: options.url },
      };
    }

    const fileBlob = await this.getBlobFromSource(options.source);

    const data = await this.upload<{
      photos: { [key: string]: { token: string } }
    }>('image', fileBlob);

    return {
      type: 'image',
      payload: data,
    };
  };

  uploadVideo = async (options: { source: FileSource }): Promise<VideoAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(options.source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('video', fileBlob);

    return {
      type: 'video',
      payload: { token: data.token },
    };
  };

  uploadFile = async (options: { source: FileSource }): Promise<FileAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(options.source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('file', fileBlob);

    return {
      type: 'file',
      payload: { token: data.token },
    };
  };

  uploadAudio = async (options: { source: FileSource }): Promise<AudioAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(options.source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('audio', fileBlob);

    return {
      type: 'audio',
      payload: { token: data.token },
    };
  };
}

export class StickerAttachment {
  private readonly type = 'sticker';

  getByCode(code: string): StickerAttachmentRequest {
    return {
      type: this.type,
      payload: { code },
    };
  }
}
