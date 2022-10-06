import { AES , enc, mode, pad} from 'crypto-ts';

const USE_CRYPTO = true;
const CRYPTO_KEY = enc.Utf8.parse('z=>NwD.C1kc9')

export let local: Storage;

if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
  local = window.localStorage;
}

function encrypt(value :string) : string {

  // console.log("== encrypt 1 ==");
  // console.log(value);

  if(USE_CRYPTO && typeof value === "string") {
    value = AES.encrypt(value, CRYPTO_KEY,{
      mode: mode.ECB,
      padding: pad.PKCS7
    }).toString();
  }

  // console.log("== encrypt 2 ==");
  // console.log(value);

  return value;
}

function decrypt(value : string) : string {

  // console.log("== decrypt 1 ==");
  // console.log(value);

  if(USE_CRYPTO && typeof value === "string") {
    value = AES.decrypt(value, CRYPTO_KEY,{
      mode: mode.ECB,
      padding: pad.PKCS7
    }).toString(enc.Utf8);
  }

  // console.log("== decrypt 2 ==");
  // console.log(value);

  return value;
}

export function setLocal(key: string, data: any) {
  const jsonData = JSON.stringify(data);
  if (local) {
    local.setItem(key, encrypt(jsonData));
  }
}

export function getLocal(key: string) {
  let data = null;
  let raw = null;
  if (local) {
    raw = local.getItem(key);
  }
  if (raw && typeof raw === "string") {
    try {
      data = JSON.parse(decrypt(raw));
    } catch (error) {
      return null;
    }
  }
  return data;
}

export function removeLocal(key: string) {
  if (local) {
    local.removeItem(key);
  }
}

export function updateLocal(key: string, data: any) {
  const localData = getLocal(key) || {};
  const mergedData = { ...localData, ...data };
  setLocal(key, mergedData);
}
