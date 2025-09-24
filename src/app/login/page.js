'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // ถ้ามี session อยู่แล้ว ให้ redirect ไปหน้าแรก
    useEffect(() => {
        if (session) {
            router.push('/')
        }
    }, [session, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                username: credentials.username,
                password: credentials.password,
                redirect: false
            })

            if (result?.error) {
                setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
            } else {
                router.push('/')
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        })
    }

    if (session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังเข้าสู่ระบบ...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
            >
                {/* หัวข้อ */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
                    <p className="text-gray-600 mt-2">
                        ระบบขอใช้โดเมน มหาวิทยาลัยราชภัฏนครศรีธรรมราช
                    </p>
                </div>

                {/* ฟอร์มล็อกอิน */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            ชื่อผู้ใช้
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="กรอกชื่อผู้ใช้"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            รหัสผ่าน
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="กรอกรหัสผ่าน"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <span className="text-red-700 text-sm">{error}</span>
                        </motion.div>
                    )}

                    {/* ปุ่มเข้าสู่ระบบ */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                {/* บัญชีทดสอบ */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>บัญชีทดสอบ:</p>
                    <p>Admin: admin / admin123</p>
                    <p>User: user01 / passuser01</p>
                </div>

                {/* สมัครสมาชิก  */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p><a href='/sign-up' className='text-blue-500'>สมัครใช้งาน</a></p>
                </div>
            </motion.div>
        </div>
    )
}
