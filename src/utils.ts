// import parsePhoneNumber, { CountryCode } from 'libphonenumber-js';
import crypto from 'crypto';
// import { phoneNumberFormat } from '../config';

const len = 128;
const iterations = 12000;

export async function getSimpleDecodedHash(
  pwd: string,
  salt?: string
): Promise<string> {
  const hashedKey = await hash(pwd, salt);
  return Buffer.from(hashedKey.hash).toString('base64');
}

export async function hash(
  pwd: string,
  salt?: string
): Promise<{ salt: string; hash: string }> {
  salt =
    salt ||
    (await new Promise((resolve, reject) => {
      return crypto.randomBytes(len, (err, salt) => {
        if (err) {
          return reject(err);
        }
        return resolve(salt.toString('base64'));
      });
    }));
  return await new Promise((resolve, reject) =>
    crypto.pbkdf2(pwd, salt!, iterations, len, 'sha1', (err, hash) =>
      err ? reject(err) : resolve({ salt: salt!, hash: hash.toString() })
    )
  );
}

export function generateClientId() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4()}-${s4()}-${s4()}-${s4()}`;
}

// const SHORT_ID_CHARS =
//   'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789-_~';
// export function createRandomShortId(length: number) {
//   const buf = [];
//   let i = 0;
//   while (i < length) {
//     buf.push(
//       SHORT_ID_CHARS[
//         Math.floor(Math.random() * Math.floor(SHORT_ID_CHARS.length - 1))
//       ]
//     );
//     ++i;
//   }
//   return buf.join('');
// }

// export function formatPhoneNumber(phone: string) {
//   const parsedPhone = parsePhoneNumber(phone, phoneNumberFormat as CountryCode);
//   if (!parsedPhone) {
//     throw new Error('Malformed phone number');
//   }
//   const formattedPhoneNumber = parsedPhone.formatInternational();
//   if (!formattedPhoneNumber) {
//     throw new Error('Malformed phone number');
//   }
//   return formattedPhoneNumber;
// }

export function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// export function isStringArray(x: unknown): x is string[] {
//   return (x as string[]).length === 0 || isString((x as string[])[0]);
// }

// export function toQueryParams(obj: { [P: string]: string }) {
//   return Object.keys(obj)
//     .map(function (k) {
//       return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
//     })
//     .join('&');
// }

// export const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
// export const localhostRegex = /https?:\/\/localhost/;
