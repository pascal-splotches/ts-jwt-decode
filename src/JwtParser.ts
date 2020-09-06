import JwtToken, { Algorithm, JwtHeader, JwtPayload, Type } from './JwtToken';
import JwtVerifier from './JwtVerifier';

interface JwtHeaderDto {
  alg: Algorithm;
  typ?: Type;
}

interface JwtPayloadDto {
  iat: number;
  exp: number;
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

function isJwtHeaderDto(dto: unknown): dto is JwtHeaderDto {
  if (!(dto instanceof Object)) {
    return false;
  }

  if (hasOwnProperty(dto, 'alg')) {
    if (!(typeof dto.alg === 'string' && dto.alg in Algorithm)) {
      return false;
    }
  } else {
    return false;
  }

  if (hasOwnProperty(dto, 'typ')) {
    return typeof dto.typ === 'string' && dto.typ in Type;
  }

  return true;
}

function isJwtHeader<H extends JwtHeader>(header: unknown): header is H {
  // As far as I know there is currently no (easy) way to verify that the header meets the schema
  // definition of H simply by knowing the interface is H.
  //
  // So be warned! This forces the header into the correct typing, but runtime errors may occur if you stuff
  // headers not matching your schema into the token!
  return header instanceof Object;
}

function isJwtPayloadDto(dto: unknown): dto is JwtPayloadDto {
  if (!(dto instanceof Object)) {
    return false;
  }

  if (hasOwnProperty(dto, 'iat')) {
    if (typeof dto.iat !== 'number') {
      return false;
    }
  } else {
    return false;
  }

  if (hasOwnProperty(dto, 'exp')) {
    if (typeof dto.exp !== 'number') {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

function isJwtPayload<P extends JwtPayload>(payload: unknown): payload is P {
  // As far as I know there is currently no (easy) way to verify that the payload meets the schema
  // definition of P simply by knowing the interface is P.
  //
  // So be warned! This forces the payload into the correct typing, but runtime errors may occur if you stuff
  // payloads not matching your schema into the token!
  return payload instanceof Object;
}

export class JwtParseError extends Error {
  public readonly previousError?: Error;

  constructor(message?: string, previousError?: Error) {
    super(message);

    this.previousError = previousError;
  }
}

export default class JwtParser {
  public static parse<H extends JwtHeader, P extends JwtPayload>(
    tokenString: string,
  ) {
    const segments = tokenString.split('.');

    if (segments.length != 3) {
      throw new JwtParseError(
        `Malformed JWT Token - ${segments.length}/3 segments`,
      );
    }

    const [headerSegment, payloadSegment] = segments;

    const headerRaw = JSON.parse(window.atob(headerSegment));
    const payloadRaw = JSON.parse(window.atob(payloadSegment));

    if (!isJwtHeaderDto(headerRaw)) {
      throw new JwtParseError(
        'Unable to parse header segment - header does not contain required attributes',
      );
    }
    if (!isJwtPayloadDto(payloadRaw)) {
      throw new JwtParseError(
        'Unable to parse payload segment - header does not contain required attributes',
      );
    }

    const header = this.transformHeaderDto<H>(headerRaw);
    const payload = this.transformPayloadDto<P>(payloadRaw);

    return new JwtToken<H, P>(header, payload, tokenString);
  }

  private static transformHeaderDto<H extends JwtHeader>(dto: JwtHeaderDto): H {
    const algorithm = dto.alg;
    const type = dto.typ;

    const raw: any = dto;

    delete raw['alg'];
    delete raw['typ'];

    const header = {
      algorithm,
      type,
      ...raw,
    };

    if (!isJwtHeader<H>(header)) {
      throw new JwtParseError(
        'Unable to parse header segment - header does not match schema',
      );
    }

    return header;
  }

  private static transformPayloadDto<P extends JwtPayload>(
    dto: JwtPayloadDto,
  ): P {
    const issuedAt = dto.iat;
    const expiresAt = dto.exp;

    const raw: any = dto;

    delete raw['iat'];
    delete raw['exp'];

    const payload = {
      issuedAt,
      expiresAt,
      ...raw,
    };

    if (!isJwtPayload<P>(payload)) {
      throw new JwtParseError(
        'Unable to parse payload segment - payload does not match schema',
      );
    }

    return payload;
  }

  public static verify(
    token: JwtToken<any, any>,
    key?: string,
    verifyAt?: number,
  ): boolean {
    const verifier = new JwtVerifier(key);

    return verifier.verify(token, verifyAt);
  }
}
