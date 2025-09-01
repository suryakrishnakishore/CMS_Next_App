import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    
    const sql = 'SELECT * FROM Products WHERE status = ? AND is_deleted = ?';
    const values = ['Published', false];
    
    const products = await query(sql, values);
    
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    // If an error occurs, send a 500 status code with a descriptive error message.
    res.status(500).json({ error: 'Failed to fetch live products.' });
  }
}
