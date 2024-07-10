import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY ?? 'asjkdfawoefsdfoasf2kj2owoe2o3o2n3ro23owesc0czmxpvqqr1e5';

export const generateToken = (data: { id: number; email: string }): string => {
  return jwt.sign({ data: data }, SECRET_KEY, { expiresIn: '24h' });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, SECRET_KEY);
};