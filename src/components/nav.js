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
import LogoutButton from '@/components/LogoutButton'
export default function NavBar() {
    const { data: session } = useSession()
    return (
        <header className="bg-white shadow-sm mb-3 ">
            <div className="max-w-7xl mx-auto px-4 py-6 ">
                <div className="flex justify-between items-center">
                    <div>
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <table >
                                <tbody>
                                    <tr>
                                        <th>
                                            {/* container เดียวสำหรับ Globe + ชื่อ + description */}
                                            <div className="flex flex-col items-center">
                                                {/* นอนเรียง: Globe + ชื่อ */}
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="w-8 h-8 text-indigo-600" />

                                                </div>
                                            </div>
                                        </th>
                                        <th>
                                            <div className='mx-4'>
                                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">ระบบขอใช้โดเมน</h1>
                                                {/* ข้อความมหาวิทยาลัย ตั้งเดี่ยว */}
                                                <p className="text-gray-600 mt-1">มหาวิทยาลัยราชภัฏนครศรีธรรมราช</p>
                                            </div>

                                        </th>
                                    </tr>
                                </tbody>
                            </table>

                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    สวัสดี,{session.user.username}
                                </span>
                                <div className="flex space-x-2">
                                    {/* Navigation buttons */}
                                    {session.user.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            จัดการระบบ
                                        </Link>
                                    )}


                                    <Link
                                        href="/change-password"
                                        className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                                    >
                                        <Key className="w-4 h-4 mr-2" />
                                        เปลี่ยนรหัสผ่าน
                                    </Link><LogoutButton className="btn-rose px-4 py-2 rounded-lg transition-colors" />
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="btn-indigo px-4 py-2 rounded-lg transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                เข้าสู่ระบบ
                            </Link>

                        )
                        }

                    </div>
                </div>
            </div>
        </header >
    );
}