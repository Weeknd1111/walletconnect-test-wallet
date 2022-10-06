import { AES } from 'crypto-ts';

const CRYPTO_KEY = "z=>NwD.C1kc9";
const USE_CRYPTO = true;

export let local: Storage;

if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
  local = window.localStorage;
}

function encrypt(value :string) : string {
  if(USE_CRYPTO && typeof value === "string") {
    value = AES.encrypt(value, CRYPTO_KEY).toString();
  }
  return value;
}

function decrypt(value : string) : string {
  if(USE_CRYPTO && value === "string") {
    value = AES.decrypt(value, CRYPTO_KEY).toString();
  }
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
