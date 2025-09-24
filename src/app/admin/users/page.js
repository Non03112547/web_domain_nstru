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
    SortDesc,
    Globe2,
    UserRoundPlus,
    UserRoundPen
} from 'lucide-react'
import NavBar from '@/components/nav'
import Link from 'next/link'

export default function UsersManagementPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [users, setUsers] = useState([])
    const [requestUser, setRequestUser] = useState([])
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
    const [activeTab, setActiveTab] = useState('list')

    useEffect(() => {
        if (session?.user.role !== 'ADMIN') {
            router.push('/')
            return
        }
        fetchUsers()
        fetchSignUpUsers()
        fetchPositions()
    }, [session, router])

    // Fetch Users
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

    // Fetch SignUp Users
    const fetchSignUpUsers = async () => {
        try {
            const response = await fetch('/api/admin/signUpUsers')
            if (response.ok) {
                const data = await response.json()
                setRequestUser(data.users)
            }
        } catch (error) {
            console.error('Error fetching signUp users:', error)
        }
    }

    // Fetch Positions
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

    // Add User
    const handleAddUser = async (e) => {
        e.preventDefault()
        if (!newUser.username.trim()) return alert('กรุณากรอก username')

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Delete User
    const handleDeleteUser = async (userId, username) => {
        if (session?.user.id === userId) return alert('คุณไม่สามารถลบตัวเองได้')
        if (!confirm(`คุณต้องการลบผู้ใช้ "${username}" ใช่หรือไม่?`)) return

        try {
            const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
            if (response.ok) fetchUsers()
            else {
                const error = await response.json()
                alert(error.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('เกิดข้อผิดพลาดในการลบผู้ใช้')
        }
    }

    // Reset Password
    const handleResetPassword = async (userId, username) => {
        if (!confirm(`คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้ "${username}" ใช่หรือไม่?`)) return
        try {
            const response = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            if (response.ok) {
                const result = await response.json()
                alert(`รีเซ็ตรหัสผ่านสำเร็จ!\nรหัสผ่านใหม่: ${result.newPassword}`)
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

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

    const closeAddUserForm = () => {
        setShowAddUser(false)
        setNewUser({ username: '', role: 'USER', positionId: '' })
        setGeneratedPassword('')
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setFilters({ search: '', role: 'ALL', sortBy: 'createdAt', sortOrder: 'desc' })
    }

    if (!session)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p>กรุณาเข้าสู่ระบบ</p>
                    <Link href="/login" className="btn-indigo px-4 py-2 rounded-lg">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        )

    if (session.user.role !== 'ADMIN')
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                    <Link href="/" className="btn-indigo px-4 py-2 rounded-lg">
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        )

    const filteredUsers = users
        .filter((user) =>
            user.username.toLowerCase().includes(filters.search.toLowerCase()) &&
            (filters.role === 'ALL' || user.role === filters.role)
        )
        .sort((a, b) => (filters.sortOrder === 'asc'
            ? new Date(a[filters.sortBy]) - new Date(b[filters.sortBy])
            : new Date(b[filters.sortBy]) - new Date(a[filters.sortBy])
        ))

    const filteredSignUpUsers = requestUser
        .filter((user) =>
            user.username.toLowerCase().includes(filters.search.toLowerCase()) &&
            (filters.role === 'ALL' || user.role === filters.role)
        )
        .sort((a, b) => {
            const fieldA = a[filters.sortBy];
            const fieldB = b[filters.sortBy];

            if (!isNaN(Date.parse(fieldA)) && !isNaN(Date.parse(fieldB))) {
                return filters.sortOrder === 'asc'
                    ? new Date(fieldA) - new Date(fieldB)
                    : new Date(fieldB) - new Date(fieldA);
            }

            return filters.sortOrder === 'asc'
                ? String(fieldA).localeCompare(String(fieldB))
                : String(fieldB).localeCompare(String(fieldA));
        });

    const tabData = activeTab === 'list' ? filteredUsers : filteredSignUpUsers

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

    const handleApproveRequest = async (userID, action) => {
        const confirmMessage = action === 'approve'
            ? 'คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอนี้?'
            : 'คุณแน่ใจหรือไม่ที่จะไม่อนุมัติคำขอนี้?'

        if (!confirm(confirmMessage)) return

        try {
            const response = await fetch(`/api/admin/signUpUsers/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            })

            if (response.ok) {
                const message = action === 'approve'
                    ? 'อนุมัติบัญชีสำเร็จ'
                    : 'ลบคำขอใช้บัญชีสำเร็จ'
                alert(message)
                window.location.reload()
            } else {
                const error = await response.json()
                alert(`เกิดข้อผิดพลาด: ${error.error}`)
            }
        } catch (error) {
            console.error('Error processing request:', error)
            alert('เกิดข้อผิดพลาดในการดำเนินการ')
        }
    }

    console.log("tabData " + tabData)

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Compact Filter Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Search */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <Search className="w-3 h-3" /> ค้นหา
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="ชื่อผู้ใช้..."
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> บทบาท
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="ALL">ทั้งหมด</option>
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                {filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />} ลำดับ
                            </label>
                            <select
                                value={filters.sortOrder}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="desc">ใหม่ไปเก่า</option>
                                <option value="asc">เก่าไปใหม่</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <p className="text-xs text-gray-600 mt-2">
                        แสดงผล {filteredUsers.length} จาก {users.length} รายการ
                        {filters.search && ` | ค้นหา: "${filters.search}"`}
                        {filters.role !== 'ALL' && ` | บทบาท: ${filters.role}`}
                    </p>
                </div>

                {/* Tabs */}
                <nav className="flex space-x-1 mb-6">
                    <button
                        onClick={() => handleTabChange('list')}
                        className={`py-3 px-6 rounded-lg font-medium text-sm ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <UserRoundPen className="w-4 h-4" />
                            <span>รายการผู้ใช้</span>
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{filteredUsers.length}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => handleTabChange('signUp')}
                        className={`py-3 px-6 rounded-lg font-medium text-sm ${activeTab === 'signUp' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <UserRoundPlus className="w-4 h-4" />
                            <span>รายการสมัครบัญชีผู้ใช้</span>
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{filteredSignUpUsers.length}</span>
                        </div>
                    </button>
                </nav>

                {/* User List */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    {activeTab === 'list' && (
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">รายการผู้ใช้ ({filteredUsers.length})</h2>
                            <button
                                onClick={() => setShowAddUser(true)}
                                className="btn-emerald px-4 py-2 rounded-lg flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้ใช้
                            </button>
                        </div>
                    )}

                    {/* Add User Form */}
                    {showAddUser && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-emerald-900 mb-4">เพิ่มผู้ใช้ใหม่</h3>
                            {generatedPassword && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-green-900 mb-2">เพิ่มผู้ใช้สำเร็จ!</h4>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-700">รหัสผ่าน:</span>
                                        <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono">{generatedPassword}</code>
                                        <button onClick={() => copyToClipboard(generatedPassword)} className="text-green-600 hover:text-green-700"><Copy className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2">Username</label>
                                        <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="กรอก username" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2">บทบาท</label>
                                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                            <option value="USER">ผู้ใช้ทั่วไป</option>
                                            <option value="ADMIN">ผู้ดูแลระบบ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2">ตำแหน่ง</label>
                                        <select value={newUser.positionId} onChange={(e) => setNewUser({ ...newUser, positionId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                            <option value="">ไม่ระบุตำแหน่ง</option>
                                            {positions.map((pos) => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={closeAddUserForm} className="px-4 py-2 btn-cool-gray rounded-lg">ยกเลิก</button>
                                    <button type="submit" className="px-4 py-2 btn-emerald rounded-lg">เพิ่มผู้ใช้</button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab Data */}
                    <div className="grid gap-4">
                        {activeTab === "list" && tabData.map((user) => (
                            <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            {user.position && <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{user.position?.name}</span>}
                                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(user.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {user.id !== session.user.id && (
                                        <>
                                            <button onClick={() => handleResetPassword(user.id, user.username)} className="p-2 rounded-lg btn-indigo"><RotateCcw className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteUser(user.id, user.username)} className="p-2 rounded-lg btn-rose"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                    {user.id === session.user.id && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">คุณ</span>}
                                </div>
                            </motion.div>
                        ))}
                        {activeTab !== "list" && tabData.map((user) => (
                            <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            {user.position && <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{user.position?.name}</span>}
                                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(user.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {user.id !== session.user.id && (
                                        <>
                                            <button onClick={() => handleApproveRequest(user.id, "approve")} className="p-2 rounded-lg btn-indigo"><Plus className="w-4 h-4" /></button>
                                            <button onClick={() => handleApproveRequest(user.id, "delete")} className="p-2 rounded-lg btn-rose"><Plus className="w-4 h-4" /></button>
                                        </>
                                    )}
                                    {user.id === session.user.id && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">คุณ</span>}
                                </div>
                            </motion.div>


                        ))}

                        {tabData.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">ไม่พบข้อมูล</p>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    )
}
