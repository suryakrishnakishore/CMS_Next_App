import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';

const NewProductPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productStatus, setProductStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await axios.post('/api/products', {
        product_name: productName,
        product_desc: productDesc,
        status: productStatus,
      }, { withCredentials: true });

      if (response.status === 201) {
        setMessage('Product created successfully!');
        setIsSuccess(true);
        // Clear the form after successful submission
        setProductName('');
        setProductDesc('');
        setProductStatus('Draft');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      setMessage(`Error: ${errorMessage}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Create New Product</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            My Products
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
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="productDesc" className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                id="productDesc"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="productStatus" className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                id="productStatus"
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value as 'Draft' | 'Published' | 'Archived')}
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
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
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

export default NewProductPage;
