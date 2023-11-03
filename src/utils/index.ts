import { LOCAL_STORAGE_KEY, PHONE_NUMBER, REGEX } from '~/constants';

export const clearLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const formatNumber = (value: string, decimal: number) => {
  return parseFloat(value).toFixed(decimal);
};

export const formatSocialSecurity = (ssn: string) => {
  ssn = ssn.toString();
  ssn = ssn.replace(/\D/g, '');
  ssn = ssn.replace(/^(\d{3})/, '$1-');
  ssn = ssn.replace(/-(\d{2})/, '-$1-');
  ssn = ssn.replace(/(\d)-(\d{4}).*/, '$1-$2');
  return ssn;
};

export const formatPhoneNumber = (value: string, formatId: number) => {
  const match = value.replace(/\D/g, '').match(PHONE_NUMBER.FORMAT_PATTERN[formatId]);
  let phone = '';
  if (match) {
    if (formatId === PHONE_NUMBER.FORMAT_ID[0]) {
      phone = match[1] + '-' + match[2] + '-' + match[3];
    } else if (formatId === PHONE_NUMBER.FORMAT_ID[1]) {
      phone = '(' + match[1] + ') ' + match[2] + '-' + match[3];
    } else if (formatId === PHONE_NUMBER.FORMAT_ID[2]) {
      phone = '(+' + match[1] + ') ' + match[2] + '-' + match[3] + '-' + match[4];
    }
  }
  return phone;
};

export const getOriginalPhoneNumber = (phoneTxt: string) => {
  return phoneTxt.replaceAll(REGEX.PHONE_NUMBER_SPECIAL_CHARACTER, '');
};

export const getOriginalSSN = (ssnTxt: string) => {
  return ssnTxt.replace(/[-\s]/g, '');
};

export const formatFileSize = (fileSize: number, decimalPoint?: number) => {
  if (fileSize === 0) return '0 Bytes';
  const k = 1000;
  const dm = decimalPoint || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(fileSize) / Math.log(k));
  return parseFloat((fileSize / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getBase64 = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const updateRootColors = (
  colorPrimary: string,
  colorBorderPrimary: string,
  colorBgPrimary: string,
  colorFill: string,
) => {
  const root = document.querySelector(':root') as HTMLElement;
  root.style.setProperty('--cs-primary-color', colorPrimary);
  root.style.setProperty('--cs-primary-border-color', colorBorderPrimary);
  root.style.setProperty('--cs-primary-bg-color', colorBgPrimary);
  root.style.setProperty('--cs-fill-color', colorFill);
};

export function blobToURL(blob: any) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
}

export const downloadURI = async (uri: any, name: any) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
