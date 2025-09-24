'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, AlertCircle, Mail, Phone } from 'lucide-react'

export default function SignUpPage() {
    const router = useRouter()
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        contactP: '',
        contactE: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (credentials.password !== credentials.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password,
                    contactP: credentials.contactP,
                    contactE: credentials.contactE,
                    role: 'USER' // หรือเลือก role อื่นถ้าต้องการ
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด')
            } else {
                alert('สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ')
                router.push('/login')
            }
        } catch (err) {
            console.error(err)
            setError('เกิดข้อผิดพลาดในการสมัครสมาชิก')
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
                    <p className="text-gray-600 mt-2">
                        ระบบขอใช้โดเมน มหาวิทยาลัยราชภัฏนครศรีธรรมราช
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้</label>
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

                    {/* Email */}
                    <div>
                        <label htmlFor="contactE" className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="contactE"
                                name="contactE"
                                type="email"
                                required
                                value={credentials.contactE}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="กรอกอีเมล"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="contactP" className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="contactP"
                                name="contactP"
                                type="text"
                                required
                                value={credentials.contactP}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="กรอกเบอร์โทรศัพท์"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
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

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={credentials.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ยืนยันรหัสผ่าน"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'กำลังสมัครสมาชิก' : 'สมัครสมาชิก'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p><a href='/login' className='text-blue-500'>เข้าสู่ระบบ</a></p>
                </div>
            </motion.div>
        </div>
    )
}
