// components/AuthModal.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
        })
      : await supabase.auth.signInWithPassword({
          email,
          password,
        });

    if (error) {
      setMessage(error.message);
    } else if (isSignUp && data.user) {
        setMessage('Check your email for a verification link to complete signup!');
    } else {
        // Successful login, redirect or update UI
        router.refresh(); // Refreshes the page to show the logged-in state
    }
    setLoading(false);
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="p-8 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 relative">
        <h3 className="text-2xl font-bold mb-4 text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h3>
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        
        <form onSubmit={handleAuth}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">or</div>

        <button
          onClick={() => handleSocialSignIn('google')}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center mb-2"
        >
          {/* Google SVG */}
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.611 3.511-4.943 6.467-9.453 6.467-5.405 0-9.742-4.436-9.742-9.877S19.555 14.873 24.96 14.873c2.724 0 5.145 1.092 6.966 2.659L34.116 14.48c-3.153-2.905-7.391-4.695-12.256-4.695C14.167 9.785 8.354 15.581 8.354 22.846c0 7.265 5.813 13.061 12.956 13.061 5.992 0 11.22-3.953 12.99-9.922h-12.99v-8z" clipRule="evenodd"/><path fill="#FF3D00" d="M6.305 14.691L14.735 21.01l1.547-.944-1.547-.944-7.43-5.002z"/><path fill="#4CAF50" d="M14.735 21.01l-8.43 6.319-1.393.993 1.393.993 7.036 4.691 1.766-2.583 7.32-4.881-7.32-4.881z"/><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-1.611 3.511-4.943 6.467-9.453 6.467-5.405 0-9.742-4.436-9.742-9.877s4.337-9.877 9.742-9.877c2.724 0 5.145 1.092 6.966 2.659l4.58-4.505C35.91 10.783 30.732 8.785 24.96 8.785c-8.835 0-16 7.165-16 16s7.165 16 16 16c8.455 0 15.421-6.521 15.823-14.898L43.611 20.083z"/></svg>
          Continue with Google
        </button>
        {/* Apple social button would go here */}

        <div className="text-center mt-4 text-gray-700 dark:text-gray-300">
          {isSignUp ? (
            <span>Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className="text-blue-600 hover:underline">Sign In</button></span>
          ) : (
            <span>Don&apos;t have an account? <button type="button" onClick={() => setIsSignUp(true)} className="text-blue-600 hover:underline">Sign Up</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;