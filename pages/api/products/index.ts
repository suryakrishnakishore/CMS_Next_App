import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // adjust path if needed
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    console.log("Request Method", req.method);

    const session = await getServerSession(req, res, authOptions);
    console.log("Session in API:", session);
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const authenticatedUserEmail = session.user?.email || 'unknown';

    if (req.method === 'GET') {
        try {
            const products = await query('SELECT * FROM Products ORDER BY created_at DESC');
            res.status(200).json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch products.' });
        }
    }
    else if (req.method === "POST") {
        const { product_name, product_desc, status } = req.body;

        if (!product_name) {
            return res.status(400).json({ error: 'Product name is required.' });
        }

        try {
            const sql = "INSERT INTO Products (product_name, product_desc, status, created_by) VALUES (?, ?, ?, ?)";
            const values = [product_name, product_desc || "", status || "Draft", authenticatedUserEmail];
            const result: any = await query(sql, values);

            res.status(201).json({
                message: "Product Created Successfully.",
                productId: result.insertId,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create product.' });
        }
    }
    else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}