import { useState, useEffect } from 'react';
import axios from 'axios';

// Updated interface to include all columns from the Products table
interface Product {
  product_id: number;
  product_name: string;
  product_desc: string;
  status: 'Draft' | 'Published' | 'Archived';
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
  is_deleted: boolean;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const response = await axios.get('/api/products/live');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <p className="text-gray-600 mt-2">Check out our latest and greatest products.</p>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="bg-white p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.product_name}</h2>
              <p className="text-gray-700">{product.product_desc}</p>
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                <p><strong>Status:</strong> {product.status}</p>
                <p><strong>Created By:</strong> {product.created_by}</p>
                <p><strong>Created At:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
                {product.updated_by && (
                  <>
                    <p><strong>Updated By:</strong> {product.updated_by}</p>
                    <p><strong>Updated At:</strong> {new Date(product.updated_at as string).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No products are currently published. Please check back later!</p>
        )}
      </main>
    </div>
  );
};

export default HomePage;
