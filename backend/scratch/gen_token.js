import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = () => {
  const adminId = '69f580ba7fe98d93bfc2ce9c'; // ID for admin@gmail.com found earlier
  const role = 'admin';
  const secret = process.env.JWT_SECRET || 'mysupersecretkey';

  const token = jwt.sign(
    { id: adminId, role: role },
    secret,
    { expiresIn: '1d' }
  );

  console.log('--- ADMIN TOKEN ---');
  console.log(token);
  console.log('-------------------');
};

generateToken();
