import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // adjust path if needed
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Check for a valid session before proceeding
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the user's email from the session for audit purposes
  const authenticatedUserEmail = session.user?.email || 'unknown';
  const { id } = req.query;

  // GET method to fetch a single product for editing
  if (req.method === 'GET') {
    try {
      const products: any = await query('SELECT * FROM Products WHERE product_id = ?', [id]);
      if (products.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.status(200).json(products[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch product.' });
    }
  }

  // PUT method to edit or restore a product
  else if (req.method === 'PUT') {
    console.log(req.body);
    
    const { product_name, product_desc, status, is_deleted } = req.body;
    
    // Validate required fields for editing
    if (!product_name) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    try {
      const sql = 'UPDATE Products SET product_name = ?, product_desc = ?, status = ?, is_deleted = ?, updated_by = ? WHERE product_id = ?';
      const values = [product_name, product_desc, status, is_deleted || false, authenticatedUserEmail, id];
      const result: any = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.status(200).json({ message: 'Product updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update product.' });
    }
  }

  // DELETE method to soft delete a product
  else if (req.method === 'DELETE') {
    try {
      const sql = 'UPDATE Products SET is_deleted = ?, updated_by = ? WHERE product_id = ?';
      const values = [true, authenticatedUserEmail, id];
      const result: any = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.status(200).json({ message: 'Product soft-deleted successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to soft-delete product.' });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
