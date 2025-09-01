import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // Redirect to login page if not authenticated
  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null; // Return null to prevent rendering the page content
  }

  // User is authenticated, show the dashboard content
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {session?.user?.name}!</h1>
      <p>You are logged in and can now manage your products.</p>
      {/* Your product management UI (e.g., list, add, edit, delete buttons) goes here */}
    </div>
  );
};

export default AdminDashboard;
