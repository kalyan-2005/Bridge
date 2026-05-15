import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export type AppJwtPayload = {
  sub: string;
  scope?: string;
};

export function signAppJwt(payload: AppJwtPayload, expiresIn: jwt.SignOptions["expiresIn"] = "1h") {
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { algorithm: "HS256", expiresIn });
}

export function verifyAppJwt<T extends AppJwtPayload = AppJwtPayload>(token: string) {
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, secret) as T;
}
