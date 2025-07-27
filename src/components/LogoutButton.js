'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ className = '' }) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // ลบ session แล้ว redirect manually
            await signOut({ redirect: false })

            // Force redirect ไปหน้าแรกของ domain ปัจจุบัน
            if (typeof window !== 'undefined') {
                window.location.href = window.location.origin
            } else {
                router.push('/')
            }
        } catch (error) {
            console.error('Logout error:', error)
            // Fallback: redirect ไปหน้าแรกโดยตรง
            if (typeof window !== 'undefined') {
                window.location.href = window.location.origin
            }
        }
    }

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center justify-center transition-colors ${className}`}
        >
            <LogOut className="w-4 h-4 mr-1" />
            ออกจากระบบ
        </button>
    )
}
