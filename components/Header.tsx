// components/Header.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AuthButtons from './AuthButtons'; // We'll create this

const Header = async () => {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        Motamot
      </Link>
      <div className="flex items-center space-x-4">
        {/* Language switcher would go here */}
        <AuthButtons session={session} />
      </div>
    </header>
  );
};

export default Header;