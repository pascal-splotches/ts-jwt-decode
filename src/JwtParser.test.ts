import JwtParser from './JwtParser';
import JwtToken, { Algorithm, JwtHeader, JwtPayload, Type } from './JwtToken';

describe('JwtParser.parse', () => {
  it('should throw an error when a malformed token is parsed', () => {
    expect(() => {
      JwtParser.parse('');
    }).toThrowError(/^Malformed JWT Token/);
  });

  // The tests below will not work until a solution has been devised where we can do a run-time verification on
  // whether the token data matches the schema set out by the interface.
  //
  //  it('should throw an error when header fields are missing', () => {
  //    const tokenString = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInRlc3QiOiJ0ZXN0In0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.a6XKGfpZjmA0QgVzw4MgekvihPSy5ObL1kIV-elY2H4";
  //
  //    interface Header extends JwtHeader {
  //      missing: string,
  //    }
  //
  //    expect(() => {
  //      JwtParser.parse<Header, JwtPayload>(tokenString);
  //    }).toThrowError(/^Unable to parse header segment/);
  //  });
  //
  // it('should throw an error when payload fields are missing', () => {
  //   const tokenString = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInRlc3QiOiJ0ZXN0In0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.a6XKGfpZjmA0QgVzw4MgekvihPSy5ObL1kIV-elY2H4";
  //
  //   interface Payload extends JwtPayload {
  //     missing: string,
  //   }
  //
  //   expect(() => {
  //     JwtParser.parse<JwtHeader, Payload>(tokenString);
  //   }).toThrowError(/^Unable to parse payload segment/);
  // });

  it('should parse when header has extra fields', () => {
    const tokenString =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInRlc3QiOiJ0ZXN0In0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.a6XKGfpZjmA0QgVzw4MgekvihPSy5ObL1kIV-elY2H4';

    interface Payload extends JwtPayload {
      name: string;
    }

    const token = JwtParser.parse<JwtHeader, Payload>(tokenString);

    expect(token).toBeInstanceOf(JwtToken);

    expect(token.header.algorithm).toBe(Algorithm.HS256);
    expect(token.header.type).toBe(Type.JWT);
    expect(token.payload.issuedAt).toBe(1516239022);
    expect(token.payload.expiresAt).toBe(1516239022);
    expect(token.payload.name).toBe('John Doe');
  });

  it('should parse when token matches schema', () => {
    const tokenString =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInRlc3QiOiJ0ZXN0In0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.a6XKGfpZjmA0QgVzw4MgekvihPSy5ObL1kIV-elY2H4';

    interface Header extends JwtHeader {
      test: string;
    }

    interface Payload extends JwtPayload {
      sub: string;
      name: string;
    }

    const token = JwtParser.parse<Header, Payload>(tokenString);

    expect(token).toBeInstanceOf(JwtToken);

    expect(token.header.algorithm).toBe(Algorithm.HS256);
    expect(token.header.type).toBe(Type.JWT);
    expect(token.header.test).toBe('test');
    expect(token.payload.issuedAt).toBe(1516239022);
    expect(token.payload.expiresAt).toBe(1516239022);
    expect(token.payload.sub).toBe('1234567890');
    expect(token.payload.name).toBe('John Doe');
  });
});

describe('JwtParser.verify', () => {
  it('verifies a valid token', () => {
    const tokenString = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1OTkzNzgzNTEsImV4cCI6MTU5OTM4MTk1MSwicm9sZXMiOltdLCJ1c2VybmFtZSI6IkRhdmVDYWxsdW0iLCJpZCI6IjZkMDNlOWM3LTEzNjMtNDBkYy05YmYyLWQ0YjcyN2FlZWIzZiJ9.daBMQJyyYSgcuvrFaV8P7euBVz_YtZMo_7sfLsBm3QVQztjHaYTF9PYZ1_j9J4Ziw2j9OZYw5Ux8dSvArLQnqI8yS_PZO_o4RybhI3oq-YWHA9TTLcxhwL3ERl_MISUY2wy0MAqNy_Mrvh-rDId52YrfyaSSieGTKB1a9FBnPGf5P-raA2j0TESt4l115s_x4nAsN7TXLaD8A_NMMvfYiXsYKyy6IAEqqhMIBGbppXqyCJvMekv5RmKP9fNUYLNXb8uPy1rF7cEEjtBxEmTLaLHUF1D1CuWqPqdR_35kN5KgpDR1GrqoTWG6zBa34RTxerxvnENojrzOixrJLHjnKbxCh8LL9kMkArhqcNegpOVEl8G0yyuBaK2rhoPIJnt8xu_1spLcPwnEcZAAauJ3ev-x-DmVRZukpCsJZdOuKu9R9EeBEqoPeAyw51KXqBV6jUonRs5FuBgiQp9zavjwvJcFOZfYhx3BX0LexJCwQvXr4KYSmmPrXv8cy5wibBG7wll33n5Cye16jJzEaTBJiF0eZT0FEk32aHPt6VTou_x3l8U9eKGmEnDftSS2A8-rNfkCfVezSdBsIHb3MfNWmJ-Ccgpslumnq62wP61s7FWtYOm3bm6904PrlAW5-Nck0llQwOn9AQSOOZcX0LC1HAZ1QHKQKINTKQE8elIej8c`;
    const key = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAoiKwT8jCW9Hn2lMEnHbX
zoWJEQkYxdvdxD5UJjuMB1nADdxSr7AcGIJVLlO8qaEJssJ2Qkt8/HskD8DO9qUj
fbHK/ieYOFj5wl7guYuvxXevNcI+/Hv4HTAwvYTTdSVvxmPoWYAE0FSj5Ks5j9j6
aOtpXUKyKu2yOjGNEi9MZZKAcrNM/hUfegA/wb3JuhZqJ3oWSCxrS9UsJa4fMWQ4
spbYO54tP1bJriLfSPEnCzdTv5gfsGwRtO/eOIpBvBkL0CX+HdD+gpdM5sA9dfem
LlaGxcGOumDQbp0/gYgQllsgvrz2LnF9n0qhYcTUA5dsNJsClZU1JDIcZWf5keKe
HyK/7Y0pEF8XdBfIRJJwd+J0tCO+E8k14YNhbpyk4dWQZDYjlgQWxL5XGrFxqFJt
8rlzulV484L/IVy60DMhl2N5yH+4zwK+CEBG2PzwQxfrNzNf00GUjx9M6z9dCBFp
k3V63lSxqSZRPt2decRddDo+xO/phclXlhd92gSJ1YVj4oJjyWeQ1Z/498cZuDzt
++0zzrGhoU6TOD/UyFKb3w4wqA5FmwMxny1rNHdUQmDMvCVgXhFILZUYU/YOMGjx
znzmUOlWp1C99+ysFRFnHZDj5rMjiuO/4kD07LGbGFozjfUuWTs7cnPrdzg0hd7m
QCwjunX2zh7WeyNjjecR/WECAwEAAQ==
-----END PUBLIC KEY-----`;

    const token = JwtParser.parse(tokenString);

    expect(JwtParser.verify(token, key, 1599381951)).toBe(true);
  });

  it('rejects an expired token', () => {
    const tokenString = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1OTkzNzgzNTEsImV4cCI6MTU5OTM4MTk1MSwicm9sZXMiOltdLCJ1c2VybmFtZSI6IkRhdmVDYWxsdW0iLCJpZCI6IjZkMDNlOWM3LTEzNjMtNDBkYy05YmYyLWQ0YjcyN2FlZWIzZiJ9.daBMQJyyYSgcuvrFaV8P7euBVz_YtZMo_7sfLsBm3QVQztjHaYTF9PYZ1_j9J4Ziw2j9OZYw5Ux8dSvArLQnqI8yS_PZO_o4RybhI3oq-YWHA9TTLcxhwL3ERl_MISUY2wy0MAqNy_Mrvh-rDId52YrfyaSSieGTKB1a9FBnPGf5P-raA2j0TESt4l115s_x4nAsN7TXLaD8A_NMMvfYiXsYKyy6IAEqqhMIBGbppXqyCJvMekv5RmKP9fNUYLNXb8uPy1rF7cEEjtBxEmTLaLHUF1D1CuWqPqdR_35kN5KgpDR1GrqoTWG6zBa34RTxerxvnENojrzOixrJLHjnKbxCh8LL9kMkArhqcNegpOVEl8G0yyuBaK2rhoPIJnt8xu_1spLcPwnEcZAAauJ3ev-x-DmVRZukpCsJZdOuKu9R9EeBEqoPeAyw51KXqBV6jUonRs5FuBgiQp9zavjwvJcFOZfYhx3BX0LexJCwQvXr4KYSmmPrXv8cy5wibBG7wll33n5Cye16jJzEaTBJiF0eZT0FEk32aHPt6VTou_x3l8U9eKGmEnDftSS2A8-rNfkCfVezSdBsIHb3MfNWmJ-Ccgpslumnq62wP61s7FWtYOm3bm6904PrlAW5-Nck0llQwOn9AQSOOZcX0LC1HAZ1QHKQKINTKQE8elIej8c`;
    const key = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAoiKwT8jCW9Hn2lMEnHbX
zoWJEQkYxdvdxD5UJjuMB1nADdxSr7AcGIJVLlO8qaEJssJ2Qkt8/HskD8DO9qUj
fbHK/ieYOFj5wl7guYuvxXevNcI+/Hv4HTAwvYTTdSVvxmPoWYAE0FSj5Ks5j9j6
aOtpXUKyKu2yOjGNEi9MZZKAcrNM/hUfegA/wb3JuhZqJ3oWSCxrS9UsJa4fMWQ4
spbYO54tP1bJriLfSPEnCzdTv5gfsGwRtO/eOIpBvBkL0CX+HdD+gpdM5sA9dfem
LlaGxcGOumDQbp0/gYgQllsgvrz2LnF9n0qhYcTUA5dsNJsClZU1JDIcZWf5keKe
HyK/7Y0pEF8XdBfIRJJwd+J0tCO+E8k14YNhbpyk4dWQZDYjlgQWxL5XGrFxqFJt
8rlzulV484L/IVy60DMhl2N5yH+4zwK+CEBG2PzwQxfrNzNf00GUjx9M6z9dCBFp
k3V63lSxqSZRPt2decRddDo+xO/phclXlhd92gSJ1YVj4oJjyWeQ1Z/498cZuDzt
++0zzrGhoU6TOD/UyFKb3w4wqA5FmwMxny1rNHdUQmDMvCVgXhFILZUYU/YOMGjx
znzmUOlWp1C99+ysFRFnHZDj5rMjiuO/4kD07LGbGFozjfUuWTs7cnPrdzg0hd7m
QCwjunX2zh7WeyNjjecR/WECAwEAAQ==
-----END PUBLIC KEY-----`;

    const token = JwtParser.parse(tokenString);

    expect(JwtParser.verify(token, key, 1599382951)).toBe(false);
  });

  it('verifies a token issued in the future', () => {
    const tokenString = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1OTkzNzgzNTEsImV4cCI6MTU5OTM4MTk1MSwicm9sZXMiOltdLCJ1c2VybmFtZSI6IkRhdmVDYWxsdW0iLCJpZCI6IjZkMDNlOWM3LTEzNjMtNDBkYy05YmYyLWQ0YjcyN2FlZWIzZiJ9.daBMQJyyYSgcuvrFaV8P7euBVz_YtZMo_7sfLsBm3QVQztjHaYTF9PYZ1_j9J4Ziw2j9OZYw5Ux8dSvArLQnqI8yS_PZO_o4RybhI3oq-YWHA9TTLcxhwL3ERl_MISUY2wy0MAqNy_Mrvh-rDId52YrfyaSSieGTKB1a9FBnPGf5P-raA2j0TESt4l115s_x4nAsN7TXLaD8A_NMMvfYiXsYKyy6IAEqqhMIBGbppXqyCJvMekv5RmKP9fNUYLNXb8uPy1rF7cEEjtBxEmTLaLHUF1D1CuWqPqdR_35kN5KgpDR1GrqoTWG6zBa34RTxerxvnENojrzOixrJLHjnKbxCh8LL9kMkArhqcNegpOVEl8G0yyuBaK2rhoPIJnt8xu_1spLcPwnEcZAAauJ3ev-x-DmVRZukpCsJZdOuKu9R9EeBEqoPeAyw51KXqBV6jUonRs5FuBgiQp9zavjwvJcFOZfYhx3BX0LexJCwQvXr4KYSmmPrXv8cy5wibBG7wll33n5Cye16jJzEaTBJiF0eZT0FEk32aHPt6VTou_x3l8U9eKGmEnDftSS2A8-rNfkCfVezSdBsIHb3MfNWmJ-Ccgpslumnq62wP61s7FWtYOm3bm6904PrlAW5-Nck0llQwOn9AQSOOZcX0LC1HAZ1QHKQKINTKQE8elIej8c`;
    const key = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAoiKwT8jCW9Hn2lMEnHbX
zoWJEQkYxdvdxD5UJjuMB1nADdxSr7AcGIJVLlO8qaEJssJ2Qkt8/HskD8DO9qUj
fbHK/ieYOFj5wl7guYuvxXevNcI+/Hv4HTAwvYTTdSVvxmPoWYAE0FSj5Ks5j9j6
aOtpXUKyKu2yOjGNEi9MZZKAcrNM/hUfegA/wb3JuhZqJ3oWSCxrS9UsJa4fMWQ4
spbYO54tP1bJriLfSPEnCzdTv5gfsGwRtO/eOIpBvBkL0CX+HdD+gpdM5sA9dfem
LlaGxcGOumDQbp0/gYgQllsgvrz2LnF9n0qhYcTUA5dsNJsClZU1JDIcZWf5keKe
HyK/7Y0pEF8XdBfIRJJwd+J0tCO+E8k14YNhbpyk4dWQZDYjlgQWxL5XGrFxqFJt
8rlzulV484L/IVy60DMhl2N5yH+4zwK+CEBG2PzwQxfrNzNf00GUjx9M6z9dCBFp
k3V63lSxqSZRPt2decRddDo+xO/phclXlhd92gSJ1YVj4oJjyWeQ1Z/498cZuDzt
++0zzrGhoU6TOD/UyFKb3w4wqA5FmwMxny1rNHdUQmDMvCVgXhFILZUYU/YOMGjx
znzmUOlWp1C99+ysFRFnHZDj5rMjiuO/4kD07LGbGFozjfUuWTs7cnPrdzg0hd7m
QCwjunX2zh7WeyNjjecR/WECAwEAAQ==
-----END PUBLIC KEY-----`;

    const token = JwtParser.parse(tokenString);

    expect(JwtParser.verify(token, key, 1599380951)).toBe(true);
  });
});
