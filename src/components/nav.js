'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    Ticket,
    Shield,
    Key,
    LogOut,
    Globe
} from 'lucide-react'
//import LogoutButton from '@/components/LogoutButton'
export default function NavBar() {
    return (
        <header className="bg-white shadow-sm mb-3 ">
            <div className="max-w-7xl mx-auto px-4 py-6 ">
                <div className="flex justify-between items-center">
                    <div>
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Globe className="w-8 h-8 mr-3 text-indigo-600" />
                                ระบบขอใช้โดเมน
                            </h1>
                            <p className="text-gray-600 ml-11">มหาวิทยาลัยราชภัฏนครศรีธรรมราช</p>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                สวัสดี,
                            </span>
                            <div className="flex space-x-2">
                                {/* Navigation buttons */}

                                <Link
                                    href="/admin"
                                    className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    จัดการระบบ
                                </Link>

                                <Link
                                    href="/change-password"
                                    className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    เปลี่ยนรหัสผ่าน
                                </Link>

                                <Link
                                    href="/login"
                                    className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}