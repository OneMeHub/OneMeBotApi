import * as fs from 'fs';
import path from 'node:path';

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

type DefaultOptions = {
  timeout?: number;
};

type UploadFromSourceOptions = {
  source: FileSource
};

type UploadFromUrlOptions = {
  url: string
};

type UploadFromUrlOrSourceOptions = UploadFromSourceOptions | UploadFromUrlOptions;

const MAX_ATTEMPTS = 5;

const DEFAULT_UPLOAD_TIMEOUT = 20_000; // ms

type FileBlob = {
  source: Blob;
  fileName?: string;
};

export class MediaAttachment {
  constructor(private readonly api: Api) {}

  private getBlobFromSource = async (source: FileSource): Promise<FileBlob> => {
    if (typeof source === 'string') {
      const stat = await fs.promises.stat(source);
      const fileName = path.basename(source);

      if (!stat.isFile()) {
        throw new Error(`Failed to upload ${fileName}. Not a file`);
      }

      const stream = fs.createReadStream(source);
      return {
        source: await streamToBlob(stream),
        fileName,
      };
    }

    if (source instanceof Buffer) {
      return {
        source: new Blob([source]),
      };
    }

    return {
      source: await streamToBlob(source),
    };
  };

  private getUploadStatus = async (uploadUrl: string) => {
    const res = await fetch(uploadUrl);
    const progress = await res.text();

    return {
      status: res.status,
      progress,
    };
  };

  private upload = async <Res>(type: UploadType, file: FileBlob, options?: DefaultOptions) => {
    const fd = new FormData();
    fd.append('data', file.source, file.fileName);

    const { url: uploadUrl } = await this.api.raw.uploads.getUploadUrl({ type });

    const uploadController = new AbortController();

    const uploadInterval = setTimeout(() => {
      uploadController.abort();
    }, options?.timeout || DEFAULT_UPLOAD_TIMEOUT);

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: fd,
        signal: uploadController.signal,
      });

      const result = await res.json() as Res;

      let { progress } = await this.getUploadStatus(uploadUrl);

      let attempts = 0;

      while (progress && attempts <= MAX_ATTEMPTS) {
        await sleep(500 * (attempts + 1));
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
    { timeout, ...source }: UploadFromUrlOrSourceOptions & DefaultOptions,
  ): Promise<ImageAttachmentRequest> => {
    if ('url' in source) {
      return {
        type: 'image',
        payload: { url: source.url },
      };
    }

    const fileBlob = await this.getBlobFromSource(source.source);

    const data = await this.upload<{
      photos: { [key: string]: { token: string } }
    }>('image', fileBlob, { timeout });

    return {
      type: 'image',
      payload: data,
    };
  };

  uploadVideo = async (
    { source, ...options }: UploadFromSourceOptions & DefaultOptions,
  ): Promise<VideoAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('video', fileBlob, options);

    return {
      type: 'video',
      payload: { token: data.token },
    };
  };

  uploadFile = async (
    { source, ...options }: UploadFromSourceOptions & DefaultOptions,
  ): Promise<FileAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('file', fileBlob, options);

    return {
      type: 'file',
      payload: { token: data.token },
    };
  };

  uploadAudio = async (
    { source, ...options }: UploadFromSourceOptions & DefaultOptions,
  ): Promise<AudioAttachmentRequest> => {
    const fileBlob = await this.getBlobFromSource(source);

    const data = await this.upload<{
      id: number,
      token: string,
    }>('audio', fileBlob, options);

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
