'use client'

import { supabase } from '@/lib/supabase'

interface FacebookButtonProps{
    mode?:'login' | 'register'
}

export default function FacebookButton({mode='login'}:FacebookButtonProps) {
    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: 'https://aptsys.online',
            },
        })

        if (error) {
            console.error(error.message)
        }
    }

    return (
        
        <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-3 w-full rounded-xl border border-gray-300 bg-[#1877F2] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
            >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.009 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.082 24 18.092 24 12.073z" />
            </svg>

            {mode==='login' ? 'Sign in with Facebook' : 'Sign up with Facebook'}
        </button>
    )
}