import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';

// Define a type for your product data
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

const EditProductPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch product data on page load
  useEffect(() => {
    if (status === 'authenticated' && id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`/api/products/${id}`);
          setProduct(response.data);
        } catch (error) {
          console.error('Error fetching product for edit:', error);
          setMessage('Error fetching product data.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [status, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    if (!product) return;

    try {
      const response = await axios.put(`/api/products/${id}`, {
        product_name: product.product_name,
        product_desc: product.product_desc,
        status: product.status,
      }, { withCredentials: true });

      if (response.status === 200) {
        setMessage('Product updated successfully!');
        setIsSuccess(true);
        router.push('/admin/products')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      setMessage(`Error: ${errorMessage}`);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
      
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  if (!product) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                  <h1 className="text-2xl font-bold text-red-600">Product not found.</h1>
                  <button
                      onClick={() => router.push('/admin/products')}
                      className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                  >
                      Go back to My Products
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product: {product.product_name}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Back to My Products
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="productName" className="block text-gray-700 font-semibold mb-2">Product Name</label>
              <input
                type="text"
                id="productName"
                value={product.product_name}
                onChange={(e) => setProduct({ ...product, product_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="productDesc" className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                id="productDesc"
                value={product.product_desc}
                onChange={(e) => setProduct({ ...product, product_desc: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="productStatus" className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                id="productStatus"
                value={product.status}
                onChange={(e) => setProduct({ ...product, status: e.target.value as 'Draft' | 'Published' | 'Archived' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 font-semibold text-white rounded-lg shadow-md transition duration-300 ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center font-semibold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProductPage;
