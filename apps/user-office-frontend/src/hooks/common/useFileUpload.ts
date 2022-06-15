import { useState } from 'react';

import { FileMetaData } from 'models/questionary/FileUpload';
import { FunctionType } from 'utils/utilTypes';

export enum UPLOAD_STATE {
  PRISTINE,
  UPLOADING,
  COMPLETE,
  ERROR,
  ABORTED,
  REJECTED,
}

export function useFileUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [state, setState] = useState<UPLOAD_STATE>(UPLOAD_STATE.PRISTINE);
  let xhr: XMLHttpRequest;

  const reset = () => {
    setProgress(0);
    setState(UPLOAD_STATE.PRISTINE);
  };

  const abort = () => {
    try {
      xhr.abort();
    } catch {}

    reset();
  };

  const uploadFile = (
    file: File,
    completeHandler: FunctionType<void, FileMetaData>
  ) => {
    setState(UPLOAD_STATE.UPLOADING);
    const formData = new FormData();
    formData.append('file', file);
    xhr = new XMLHttpRequest();

    xhr.upload.addEventListener(
      'progress',
      (event) => {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent);
      },
      false
    );

    xhr.addEventListener(
      'load',
      (event) => {
        const { responseText, status } = event.currentTarget as XMLHttpRequest;
        try {
          if (status === 200 && responseText) {
            const metaData: FileMetaData = JSON.parse(responseText);
            completeHandler(metaData);
            reset(); // auto reset
          } else {
            setState(UPLOAD_STATE.ERROR);
          }
        } catch (e) {
          setState(UPLOAD_STATE.ERROR);
        }
      },
      false
    );

    xhr.addEventListener(
      'error',
      () => {
        setState(UPLOAD_STATE.ERROR);
      },
      false
    );

    xhr.addEventListener(
      'abort',
      () => {
        setState(UPLOAD_STATE.ABORTED);
      },
      false
    );

    xhr.open('POST', '/files/upload');
    xhr.send(formData);
  };

  return { uploadFile, progress, state, setState, abort };
}
