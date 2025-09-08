// components/AuthButtons.tsx (Client Component)
"use client";

import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from './AuthModal';
import { useRouter } from 'next/navigation';

interface AuthButtonsProps {
  session: Session | null;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ session }) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  
  const user = session?.user;

  return (
    <>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.user_metadata?.display_name || user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      )}
      {showModal && <AuthModal />}
    </>
  );
};

export default AuthButtons;