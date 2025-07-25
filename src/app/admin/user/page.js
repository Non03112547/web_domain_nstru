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
        </div>
    )
}
