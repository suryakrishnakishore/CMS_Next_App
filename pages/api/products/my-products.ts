import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    console.log("Session in myp API:", session);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const authorizedEmail = session?.user?.email || "unknown";

    if(req.method === "GET") {
        try {
            const sql = "SELECT * FROM Products WHERE created_by = ? ORDER BY created_at DESC";
            const values = [authorizedEmail];
            const myproducts = await query(sql, values);

            res.status(200).json(myproducts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ err: 'Failed to fetch your products.' });
        }


    }
}