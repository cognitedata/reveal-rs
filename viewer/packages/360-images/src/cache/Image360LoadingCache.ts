/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '../entity/Image360Entity';
import { Image360RevisionEntity } from '../entity/Image360RevisionEntity';
import pull from 'lodash/pull';
import findLast from 'lodash/findLast';
import find from 'lodash/find';
import remove from 'lodash/remove';
import { Log } from '@reveal/logger';

export type DownloadRequest = {
  revision: Image360RevisionEntity;
  firstCompleted: Promise<void>;
  fullResolutionCompleted: Promise<void>;
  abort: () => void;
};

export type Loaded360Image = {
  revision: Image360RevisionEntity;
  isFullResolution: boolean;
};

export class Image360LoadingCache {
  private readonly _loaded360Images: Loaded360Image[];
  private readonly _inProgressDownloads: DownloadRequest[];
  private _lockedDownload: Image360RevisionEntity | undefined;

  get cachedEntities(): Image360RevisionEntity[] {
    return this._loaded360Images.map(image => {
      return image.revision;
    });
  }

  get currentlyLoadingEntities(): DownloadRequest[] {
    return this._inProgressDownloads;
  }

  public getDownloadInProgress(revision: Image360RevisionEntity): DownloadRequest | undefined {
    const inProgressDownload = this._inProgressDownloads.find(download => {
      return download.revision === revision;
    });
    return inProgressDownload;
  }

  constructor(private readonly _imageCacheSize = 10, private readonly _downloadCacheSize = 3) {
    this._loaded360Images = [];
    this._inProgressDownloads = [];
  }

  public async cachedPreload(revision: Image360RevisionEntity, lockDownload = false): Promise<void> {
    if (this._loaded360Images.find(image => image.revision === revision)?.isFullResolution) {
      return;
    }

    if (lockDownload) {
      this._lockedDownload = revision;
    }

    const inProgressDownload = this.getDownloadInProgress(revision);
    if (inProgressDownload !== undefined) {
      return inProgressDownload.firstCompleted;
    }

    if (this._inProgressDownloads.length >= this._downloadCacheSize) {
      this.abortLastRecentlyReqestedEntity();
    }

    const { signal, abort } = this.createAbortSignal();
    const { firstCompleted, fullResolutionCompleted } = revision.load360Image(signal);

    this._inProgressDownloads.push({
      revision,
      firstCompleted,
      fullResolutionCompleted,
      abort
    });

    fullResolutionCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          this.addRevisionToCache(revision, true);
        },
        () => {
          return Promise.resolve();
        }
      )
      .finally(() => {
        removeDownload(this._lockedDownload, this._inProgressDownloads);
      });

    const visualzationBoxReady = await firstCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          this.addRevisionToCache(revision, false);
        },
        reason => {
          removeDownload(this._lockedDownload, this._inProgressDownloads);

          if (signal.aborted || reason === 'Aborted') {
            Log.info('360 Image download aborted: ' + reason);
          } else {
            throw new Error('Failed to load 360 image: ' + reason);
          }
        }
      );

    return visualzationBoxReady;

    function removeDownload(
      _lockedDownload: Image360RevisionEntity | undefined,
      _inProgressDownloads: DownloadRequest[]
    ) {
      if (_lockedDownload === revision) {
        _lockedDownload = undefined;
      }
      remove(_inProgressDownloads, download => {
        return download.revision === revision;
      });
    }
  }

  public async purge(entity: Image360Entity): Promise<void> {
    const revisions = entity.list360ImageRevisions();
    revisions.forEach(revision => {
      const inFlightDownloads = this._inProgressDownloads.filter(download => {
        return download.revision === revision;
      });
      inFlightDownloads.map(inFlightDownload => {
        pull(this._inProgressDownloads, inFlightDownload);
        inFlightDownload.abort();
      });
      remove(this._loaded360Images, image => {
        return image.revision === revision;
      });
    });
  }

  private addRevisionToCache(revision: Image360RevisionEntity, isFullResolution: boolean) {
    const cachedImage = this._loaded360Images.find(image => image.revision === revision);
    if (cachedImage && cachedImage.isFullResolution) {
      // Image is already cached with full resolution. Discard attempts to add lower quality image.
      return;
    }

    if (cachedImage) {
      pull(this._loaded360Images, cachedImage);
    }

    if (this._loaded360Images.length === this._imageCacheSize) {
      const entityToPurge = findLast(this._loaded360Images, image => !image.revision.image360Visualization.visible);
      if (entityToPurge === undefined) {
        throw new Error('Unable to purge 360 image from cache due to too many visible instances');
      }
      pull(this._loaded360Images, entityToPurge);
      entityToPurge.revision.unload360Image();
    }
    this._loaded360Images.unshift({ revision, isFullResolution });
  }

  private abortLastRecentlyReqestedEntity() {
    const download = find(
      this._inProgressDownloads,
      download => download.revision !== this._lockedDownload && !download.revision.image360Visualization.visible
    );
    if (download) {
      pull(this._inProgressDownloads, download);
      download.abort();
    }
  }

  private createAbortSignal() {
    const abortController = new AbortController();
    const abort = () => {
      abortController.abort();
    };
    return { signal: abortController.signal, abort };
  }
}
