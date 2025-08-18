'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Users,
    Plus,
    Trash2,
    Shield,
    User,
    Calendar,
    AlertCircle,
    Copy,
    Key,
    RotateCcw,
    Search,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react'
import NavBar from '@/components/nav'
import Link from 'next/link'


export default function UsersManagementPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddUser, setShowAddUser] = useState(false)
    const [newUser, setNewUser] = useState({
        username: '',
        role: 'USER',
        positionId: ''
    })
    const [generatedPassword, setGeneratedPassword] = useState('')

    const [filters, setFilters] = useState({
        search: '',
        role: 'ALL',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })

    useEffect(() => {
        if (session?.user.role !== 'ADMIN') {
            router.push('/')
            return
        }
        fetchUsers()
        fetchPositions()
    }, [session, router])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPositions = async () => {
        try {
            const response = await fetch('/api/admin/positions')
            if (response.ok) {
                const data = await response.json()
                setPositions(data)
            }
        } catch (error) {
            console.error('Error fetching positions:', error)
        }
    }

    const handleAddUser = async (e) => {
        e.preventDefault()

        if (!newUser.username.trim()) {
            alert('กรุณากรอก username')
            return
        }

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: newUser.username.trim(),
                    role: newUser.role,
                    positionId: newUser.positionId || null
                })
            })

            if (response.ok) {
                const result = await response.json()
                setGeneratedPassword(result.password)
                setNewUser({ username: '', role: 'USER', positionId: '' })
                fetchUsers()
            } else {
                const error = await response.json()
                alert(error.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้')
            }
        } catch (error) {
            console.error('Error adding user:', error)
            alert('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้')
        }
    }

    const handleDeleteUser = async (userId, username) => {
        if (session?.user.id === userId) {
            alert('คุณไม่สามารถลบตัวเองได้')
            return
        }

        if (!confirm(`คุณต้องการลบผู้ใช้ "${username}" ใช่หรือไม่?`)) return

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchUsers()
            } else {
                const error = await response.json()
                alert(error.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('เกิดข้อผิดพลาดในการลบผู้ใช้')
        }
    }

    const handleResetPassword = async (userId, username) => {
        if (!confirm(`คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้ "${username}" ใช่หรือไม่?`)) return

        try {
            const response = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                const result = await response.json()
                alert(`รีเซ็ตรหัสผ่านสำเร็จ!\n\nรหัสผ่านใหม่: ${result.newPassword}\n\nกรุณาเก็บรหัสผ่านนี้ไว้และแจ้งให้ผู้ใช้ทราบ`)
                navigator.clipboard.writeText(result.newPassword)
            } else {
                const error = await response.json()
                alert(error.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน')
            }
        } catch (error) {
            console.error('Error resetting password:', error)
            alert('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert('คัดลอกแล้ว!')
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const closeAddUserForm = () => {
        setShowAddUser(false)
        setNewUser({ username: '', role: 'USER', positionId: '' })
        setGeneratedPassword('')
    }

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

    const filteredUsers = users
        .filter((user) => {
            const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase())
            const matchesRole = filters.role === 'ALL' || user.role === filters.role
            return matchesSearch && matchesRole
        })
        .sort((a, b) => {
            const field = filters.sortBy
            let aValue = ''
            let bValue = ''

            switch (field) {
                case 'username':
                    aValue = a.username
                    bValue = b.username
                    break
                case 'role':
                    aValue = a.role
                    bValue = b.role
                    break
                case 'createdAt':
                    aValue = a.createdAt
                    bValue = b.createdAt
                    break
                default:
                    aValue = a.createdAt
                    bValue = b.createdAt
            }

            return filters.sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
        })

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        )
    }

    // 🧩 ส่วนที่เหลือเหมือนเดิม (UI rendering, form, user list)

    return (
        <div>
            {/* RENDER COMPONENTS HERE */}
            <div className="min-h-screen bg-gray-50">
                {/* Navigation */}
                <NavBar />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Filter Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-600" />
                            กรองข้อมูล
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Search className="w-4 h-4 mr-1" />
                                    ค้นหา
                                </label>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    placeholder="ชื่อผู้ใช้..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Role Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-1" />
                                    บทบาท
                                </label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">ทั้งหมด</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>



                            {/* Sort Order */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    {filters.sortOrder === 'desc' ?
                                        <SortDesc className="w-4 h-4 mr-1" /> :
                                        <SortAsc className="w-4 h-4 mr-1" />
                                    }
                                    ลำดับ
                                </label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="desc">ใหม่ไปเก่า</option>
                                    <option value="asc">เก่าไปใหม่</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                แสดงผล {filteredUsers.length} จาก {users.length} รายการ
                                {filters.search && ` | ค้นหา: "${filters.search}"`}
                                {filters.role !== 'ALL' && ` | บทบาท: ${filters.role}`}
                            </p>
                        </div>
                    </div>

                    {/* Users Management */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                รายการผู้ใช้ ({filteredUsers.length})
                            </h2>
                            <button
                                onClick={() => setShowAddUser(true)}
                                className="btn-emerald px-4 py-2 rounded-lg flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มผู้ใช้
                            </button>
                        </div>

                        {/* Add User Form */}
                        {showAddUser && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6"
                            >
                                <h3 className="text-lg font-semibold text-emerald-900 mb-4">เพิ่มผู้ใช้ใหม่</h3>

                                {generatedPassword && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-green-900 mb-2">เพิ่มผู้ใช้สำเร็จ!</h4>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-green-700">รหัสผ่าน:</span>
                                            <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono">
                                                {generatedPassword}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(generatedPassword)}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-green-600 mt-2">
                                            กรุณาเก็บรหัสผ่านนี้ไว้ เพราะจะไม่แสดงอีกครั้ง
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleAddUser} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="กรอก username"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                บทบาท
                                            </label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="USER">ผู้ใช้ทั่วไป</option>
                                                <option value="ADMIN">ผู้ดูแลระบบ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                ยศ/ตำแหน่ง
                                            </label>
                                            <select
                                                value={newUser.positionId}
                                                onChange={(e) => setNewUser({ ...newUser, positionId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">ไม่ระบุตำแหน่ง</option>
                                                {positions.map((position) => (
                                                    <option key={position.id} value={position.id}>
                                                        {position.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeAddUserForm}
                                            className="px-4 py-2 btn-cool-gray rounded-lg"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 btn-emerald rounded-lg"
                                        >
                                            เพิ่มผู้ใช้
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Users List */}
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role === 'ADMIN' ? (
                                                        <>
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            ผู้ดูแลระบบ
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="w-3 h-3 mr-1" />
                                                            ผู้ใช้ทั่วไป
                                                        </>
                                                    )}
                                                </span>
                                                {user.position && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {user.position.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {formatDate(user.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {user.id === session.user.id && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                คุณ
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleResetPassword(user.id, user.username)}
                                            className="p-2 rounded-lg btn-indigo"
                                            title="รีเซ็ตรหัสผ่าน"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            disabled={user.id === session.user.id}
                                            className={`p-2 rounded-lg ${user.id === session.user.id
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'btn-rose'
                                                }`}
                                            title={user.id === session.user.id ? 'ไม่สามารถลบตัวเองได้' : 'ลบผู้ใช้'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {users.length === 0 ? 'ไม่พบผู้ใช้ในระบบ' : 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 bg-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Key className="w-5 h-5 mr-2" />
                            คำแนะนำการใช้งาน
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">การเพิ่มผู้ใช้</h4>
                                <ul className="space-y-1">
                                    <li>• คลิก "เพิ่มผู้ใช้" และกรอกข้อมูล</li>
                                    <li>• รหัสผ่านจะถูกสร้างอัตโนมัติ</li>
                                    <li>• บันทึกรหัสผ่านให้ผู้ใช้ทราบ</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">การรีเซ็ตรหัสผ่าน</h4>
                                <ul className="space-y-1">
                                    <li>• คลิกปุ่มลูกศรหมุนเพื่อรีเซ็ต</li>
                                    <li>• รหัสผ่านใหม่จะถูกสร้างอัตโนมัติ</li>
                                    <li>• รหัสผ่านจะถูกคัดลอกไปยังคลิปบอร์ด</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">การลบผู้ใช้</h4>
                                <ul className="space-y-1">
                                    <li>• คลิกปุ่มถังขยะเพื่อลบผู้ใช้</li>
                                    <li>• ไม่สามารถลบตัวเองได้</li>
                                    <li>• การลบจะเป็นการลบถาวร</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
