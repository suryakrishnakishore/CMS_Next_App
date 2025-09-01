import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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

const MyProductsDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchMyProducts = async () => {
        try {
          // This API call fetches only the products of the logged-in user
          const response = await axios.get('/api/products/my-products');
          setProducts(response.data);
        } catch (error) {
          console.error('Error fetching my products:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyProducts();
    }
  }, [status]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleEdit = () => {
    if (selectedProduct) {
      // Navigate to the edit page with the product ID
      router.push(`/admin/products/edit/${selectedProduct.product_id}`);
      closeModal();
    }
  };

  const handleDelete = async () => {
    if (selectedProduct && confirm(`Are you sure you want to soft-delete the product "${selectedProduct.product_name}"?`)) {
      try {
        await axios.delete(`/api/products/${selectedProduct.product_id}`);
        // Refresh the product list after a successful deletion
        setProducts(products.filter(p => p.product_id !== selectedProduct.product_id));
        closeModal();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product.');
      }
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
      {/* Navigation Bar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {session?.user?.name}!</span>
          <button
            onClick={() => router.push('/admin/new')}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            Create New Product
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            View All Products
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr
                      key={product.product_id}
                      className={index % 2 === 0 ? 'bg-white cursor-pointer hover:bg-gray-100' : 'bg-gray-50 cursor-pointer hover:bg-gray-100'}
                      onClick={() => handleRowClick(product)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm overflow-hidden text-ellipsis">{product.product_desc}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === 'Published' ? 'bg-green-100 text-green-800' :
                          product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">You have no products yet. Start by adding a new one!</p>
          )}
        </div>
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:text-blue-900 transition duration-300"
                  title="Edit Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-900 transition duration-300"
                  title="Delete Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  className="ml-4 text-gray-400 hover:text-gray-600 text-3xl font-light"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Product ID:</span>
                <span>{selectedProduct.product_id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Name:</span>
                <span>{selectedProduct.product_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Description:</span>
                <span>{selectedProduct.product_desc}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Status:</span>
                <span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedProduct.status === 'Published' ? 'bg-green-100 text-green-800' :
                    selectedProduct.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProduct.status}
                  </span>
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Created By:</span>
                <span>{selectedProduct.created_by}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Created At:</span>
                <span>{new Date(selectedProduct.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Updated By:</span>
                <span>{selectedProduct.updated_by || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Updated At:</span>
                <span>{selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsDashboard;
