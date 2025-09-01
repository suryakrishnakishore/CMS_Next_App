import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // This is a crucial callback. It allows you to add information to the session.
  // We'll use this to get the user's email to tie to the 'created_by' column.
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // Pass the user's email to the session object
      // This will be available on the frontend and in your API routes
      if (session.user && token?.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  // You can specify a custom sign-in page here.
  pages: {
    signIn: '/admin/login',
  },
};

export default NextAuth(authOptions);
