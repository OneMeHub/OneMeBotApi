import * as fs from 'fs';
import path from 'node:path';

import { type Api } from '../../api';
import { streamToBlob } from '../../utils';

import { type UploadType } from '../network/api';

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

type FileBlob = {
  source: Blob;
  fileName?: string;
};

export type UploadImageOptions = UploadFromUrlOrSourceOptions & DefaultOptions;
export type UploadVideoOptions = UploadFromSourceOptions & DefaultOptions;
export type UploadFileOptions = UploadFromSourceOptions & DefaultOptions;
export type UploadAudioOptions = UploadFromSourceOptions & DefaultOptions;

const DEFAULT_UPLOAD_TIMEOUT = 20_000; // ms

export class Upload {
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

      return await res.json() as Res;
    } finally {
      clearTimeout(uploadInterval);
    }
  };

  image = async ({ timeout, ...source }: UploadImageOptions) => {
    if ('url' in source) {
      return { url: source.url };
    }

    const fileBlob = await this.getBlobFromSource(source.source);

    return this.upload<{
      photos: { [key: string]: { token: string } }
    }>('image', fileBlob, { timeout });
  };

  video = async ({ source, ...options }: UploadVideoOptions) => {
    const fileBlob = await this.getBlobFromSource(source);

    return this.upload<{
      id: number,
      token: string,
    }>('video', fileBlob, options);
  };

  file = async ({ source, ...options }: UploadFileOptions) => {
    const fileBlob = await this.getBlobFromSource(source);

    return this.upload<{
      id: number,
      token: string,
    }>('file', fileBlob, options);
  };

  audio = async ({ source, ...options }: UploadAudioOptions) => {
    const fileBlob = await this.getBlobFromSource(source);

    return this.upload<{
      id: number,
      token: string,
    }>('audio', fileBlob, options);
  };
}
