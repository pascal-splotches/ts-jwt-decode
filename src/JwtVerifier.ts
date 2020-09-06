import * as jsrsasign from 'jsrsasign';
import { KJUR } from 'jsrsasign';
import JwtToken from './JwtToken';

const KEYUTIL = jsrsasign.KEYUTIL;

type Key = jsrsasign.RSAKey | KJUR.crypto.DSA | KJUR.crypto.ECDSA | string;

export default class JwtVerifier {
  private key?: Key;

  constructor(keyString?: string) {
    if (keyString !== undefined) {
      this.key = KEYUTIL.getKey(keyString);
    }
  }

  verify(token: JwtToken<any, any>, verifyAt?: number): boolean {
    return KJUR.jws.JWS.verifyJWT(token.getToken(), this.key, {
      alg: [token.header.algorithm],
      verifyAt: verifyAt,
    });
  }
}
