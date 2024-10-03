import * as fs from 'node:fs';

import { type Api } from '../../api';
import {
  type FileAttachmentRequest,
  type ImageAttachmentRequest,
  type VideoAttachmentRequest,
  type UploadType,
} from '../network/api';

type FileSource = string | Buffer | fs.ReadStream;

const MAX_RETRIES = 5;

const streamToBlob = async (stream: fs.ReadStream, mimeType?: string) => {
  return new Promise<Blob>((resolve, reject) => {
    const chunks: Array<string | Buffer> = [];
    stream
      .on('data', (chunk) => chunks.push(chunk))
      .once('end', () => {
        const blob = mimeType
          ? new Blob(chunks, { type: mimeType })
          : new Blob(chunks);
        resolve(blob);
      })
      .once('error', reject);
  });
};

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

  private upload = async <Res>(type: UploadType, blob: Blob, initialRetries?: number) => {
    if (initialRetries === MAX_RETRIES) {
      throw new Error('Max retries reached');
    }

    const body = new FormData();
    body.append('data', blob);

    const { url: uploadUrl } = await this.api.raw.uploads.getUploadUrl({ type });

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body,
    });

    return await res.json() as Res;
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
}
