export enum Type {
  JWT = 'JWT',
}

export enum Algorithm {
  HS256 = 'HS256',
  RS256 = 'RS256',
}

export interface JwtHeader {
  algorithm: Algorithm;
  type?: Type;
}

export interface JwtPayload {
  issuedAt: number;
  expiresAt: number;
}

export default class JwtToken<H extends JwtHeader, P extends JwtPayload> {
  public readonly header: H;

  public readonly payload: P;

  private readonly token: string;

  constructor(header: H, payload: P, token: string) {
    this.header = header;
    this.payload = payload;
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }
}
