import { signIn } from 'next-auth/react';

const AdminLoginPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>CMS Admin Login</h1>
      <p>Please sign in with your Google account to manage products.</p>
      <button 
        onClick={() => signIn('google', { callbackUrl: '/admin' })}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default AdminLoginPage;