'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
    Users,
    Globe,
    AlertCircle,
    ChevronRight,
    Settings,
    FileText,
    UserCog
} from 'lucide-react'
import NavBar from '@/components/nav'
import Link from 'next/link'

export default function AdminPage() {
    const { data: session } = useSession()

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบ</p>
                    <Link href="/login" className="btn-indigo px-4 py-2 rounded-lg">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        )
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                    <Link href="/" className="btn-indigo px-4 py-2 rounded-lg">
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        )
    }

    const adminMenus = [
        {
            title: 'จัดการผู้ใช้',
            description: 'เพิ่ม ลบ จัดการบัญชีผู้ใช้',
            icon: Users,
            href: '/admin/users',
            color: '#10B981',
            hoverColor: '#059669'
        },

    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <NavBarBar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Settings className="w-8 h-8 text-red-600 mr-3" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                ยินดีต้อนรับ, {session.user.username}
                            </h2>
                            <p className="text-gray-600">
                                คุณเข้าสู่ระบบในฐานะผู้ดูแลระบบ
                            </p>
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-sm">
                            <strong>หมายเหตุ:</strong> คุณมีสิทธิ์ในการจัดการระบบทั้งหมด กรุณาใช้สิทธิ์อย่างระมัดระวัง
                        </p>
                    </div>
                </div>

                {/* Admin Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminMenus.map((menu, index) => (
                        <motion.div
                            key={menu.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={menu.href}>
                                <div
                                    className={`transition-all duration-300 rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl`}
                                    style={{ backgroundColor: menu.color }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = menu.hoverColor}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = menu.color}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <menu.icon className="w-8 h-8" />
                                        <ChevronRight className="w-5 h-5 opacity-70" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {menu.title}
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {menu.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        ข้อมูลระบบ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <UserCog className="w-6 h-6 text-emerald-600 mr-2" />
                                <div>
                                    <p className="text-sm text-emerald-600">จัดการผู้ใช้</p>
                                    <p className="font-semibold text-emerald-900">เพิ่ม ลบ บัญชีผู้ใช้</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Globe className="w-6 h-6 text-indigo-600 mr-2" />
                                <div>
                                    <p className="text-sm text-indigo-600">คำขอ Domain / ต่ออายุ</p>
                                    <p className="font-semibold text-indigo-900">จัดการคำขอทั้งหมด</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        คำแนะนำการใช้งาน
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">จัดการผู้ใช้</h4>
                            <ul className="space-y-1">
                                <li>• เพิ่มผู้ใช้งานใหม่</li>
                                <li>• ลบผู้ใช้งาน</li>
                                <li>• ดูรายการผู้ใช้ทั้งหมด</li>
                                <li>• จัดการสิทธิ์การใช้งาน</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">คำขอ Domain / คำขอ ต่ออายุ</h4>
                            <ul className="space-y-1">
                                <li>• อนุมัติ/ปฏิเสธคำขอใช้โดเมน</li>
                                <li>• อนุมัติ/ปฏิเสธคำขอต่ออายุ</li>
                                <li>• ดูรายละเอียดคำขอทั้งหมด</li>
                                <li>• จัดการโดเมนที่อนุมัติแล้ว</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
