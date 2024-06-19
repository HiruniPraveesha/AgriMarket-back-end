


/*import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY ?? 'asjkdfawoefsdfoasf2kj2owoe2o3o2n3ro23owesc0czmxpvqqr1e5';

export const generateToken = (data: { id: number; email: string }): string => {
  return jwt.sign({ id: data.id, email: data.email }, SECRET_KEY, { expiresIn: '24h' });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, SECRET_KEY);
};
*/

//caht rememberme
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY ?? 'asjkdfawoefsdfoasf2kj2owoe2o3o2n3ro23owesc0czmxpvqqr1e5';

export const generateToken = (data: { id: number; email: string }, expiresIn: string = '24h'): string => {
  return jwt.sign(data, SECRET_KEY, { expiresIn });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, SECRET_KEY);
};







