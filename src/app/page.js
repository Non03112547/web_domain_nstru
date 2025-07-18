'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Globe,
  Clock,
  Trash2,
  RefreshCw,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Settings2
} from 'lucide-react'
import NavBar from '@/components/nav'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'

const StatusBadge = (status) => {
  const statusConfig = {
    ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'ใช้งาน' },
    EXPIRED: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'หมดอายุ' },
    TRASHED: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'ในถังขยะ' },
  }
  const config = statusConfig[status];
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  )
}


export default function Home() {

  const { data: session } = useSession()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('domains')
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [requests, setRequests] = useState([])
  const [renewalRequests, setRenewalRequests] = useState([])
  const [activeStatus, setActiveStatus] = useState('')


  // Filter states


  useEffect(() => {
    if (session) {
      fetchMyRequests()
      fetchMyRenewalRequests()
    }
  }, [session])

  const fetchMyRequests = async () => {
    try {
      const response = await fetch('/api/my-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching my requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyRenewalRequests = async () => {
    try {
      const response = await fetch('/api/renewal-requests?my=true')
      if (response.ok) {
        const data = await response.json()
        setRenewalRequests(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch renewal requests:', errorData.error)
      }
    } catch (error) {
      console.error('Error fetching renewal requests:', error)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    const request = requests.find(r => r.id === requestId)
    const isApproved = request?.status === 'APPROVED'
    const domainStatus = request?.domain_record?.status

    let confirmMessage = 'คุณต้องการลบคำขอนี้ใช่หรือไม่?'

    if (isApproved) {
      switch (domainStatus) {
        case 'ACTIVE':
          confirmMessage = 'คุณต้องการย้ายโดเมนที่ใช้งานไปยังถังขยะใช่หรือไม่?'
          break
        case 'EXPIRED':
          confirmMessage = 'คุณต้องการย้ายโดเมนที่หมดอายุไปยังถังขยะใช่หรือไม่?'
          break
        case 'TRASHED':
          confirmMessage = 'คุณต้องการลบโดเมนในถังขยะออกจากระบบถาวรใช่หรือไม่?'
          break
      }
    }

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'ดำเนินการสำเร็จ')
        fetchMyRequests()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการลบคำขอ')
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('เกิดข้อผิดพลาดในการลบคำขอ')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFilters({
      search: '',
      status: 'ALL',
      durationType: 'ALL',
      sortBy: 'requestedAt',
      sortOrder: 'desc'
    })
  }

  const handleDeleteRenewalRequest = async (requestId) => {
    if (!confirm('คุณต้องการลบคำขอต่ออายุนี้ใช่หรือไม่?')) return

    try {
      const response = await fetch(`/api/renewal-requests/${requestId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchMyRenewalRequests()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการลบคำขอต่ออายุ')
      }
    } catch (error) {
      console.error('Error deleting renewal request:', error)
      alert('เกิดข้อผิดพลาดในการลบคำขอต่ออายุ')
    }
  }

  const handleApproveRequest = async (requestId, action) => {
    const confirmMessage = action === 'approve'
      ? 'คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอนี้?'
      : 'คุณแน่ใจหรือไม่ที่จะไม่อนุมัติคำขอนี้?'

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const message = action === 'approve'
          ? 'อนุมัติคำขอสำเร็จ'
          : 'ไม่อนุมัติคำขอสำเร็จ'
        alert(message)
        fetchMyRequests()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error processing request:', error)
      alert('เกิดข้อผิดพลาดในการดำเนินการ')
    }
  }

  const handleApproveRenewalRequest = async (requestId, action) => {
    const confirmMessage = action === 'approve'
      ? 'คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอต่ออายุนี้?'
      : 'คุณแน่ใจหรือไม่ที่จะไม่อนุมัติคำขอต่ออายุนี้?'

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/renewal-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const message = action === 'approve'
          ? 'อนุมัติคำขอต่ออายุสำเร็จ'
          : 'ไม่อนุมัติคำขอต่ออายุสำเร็จ'
        alert(message)
        fetchMyRenewalRequests()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error processing renewal request:', error)
      alert('เกิดข้อผิดพลาดในการดำเนินการ')
    }
  }

  // Filter and sort domain requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.domain.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.department.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === 'ALL' || request.status === filters.status
    const matchesDurationType = filters.durationType === 'ALL' || request.durationType === filters.durationType

    return matchesSearch && matchesStatus && matchesDurationType
  }).sort((a, b) => {
    const field = filters.sortBy
    let aValue = ''
    let bValue = ''

    switch (field) {
      case 'domain':
        aValue = a.domain
        bValue = b.domain
        break
      case 'requesterName':
        aValue = a.requesterName
        bValue = b.requesterName
        break
      case 'department':
        aValue = a.department
        bValue = b.department
        break
      case 'requestedAt':
        aValue = a.requestedAt
        bValue = b.requestedAt
        break
      default:
        aValue = a.requestedAt
        bValue = b.requestedAt
    }

    if (filters.sortOrder === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  // Filter and sort renewal requests
  const filteredRenewalRequests = renewalRequests.filter(request => {
    const matchesSearch = request.domain.domainRequest.domain.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.domain.domainRequest.department.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === 'ALL' || request.status === filters.status

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    const field = filters.sortBy
    let aValue = ''
    let bValue = ''

    switch (field) {
      case 'domain':
        aValue = a.domain.domainRequest.domain
        bValue = b.domain.domainRequest.domain
        break
      case 'requesterName':
        aValue = a.user.username
        bValue = b.user.username
        break
      case 'department':
        aValue = a.domain.domainRequest.department
        bValue = b.domain.domainRequest.department
        break
      case 'requestedAt':
        aValue = a.requestedAt
        bValue = b.requestedAt
        break
      case 'newExpiryDate':
        aValue = a.newExpiryDate
        bValue = b.newExpiryDate
        break
      default:
        aValue = a.requestedAt
        bValue = b.requestedAt
    }

    if (filters.sortOrder === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  // Domain requests by status
  const pendingRequests = filteredRequests.filter(r => r.status === 'PENDING')
  const approvedRequests = filteredRequests.filter(r => r.status === 'APPROVED')
  const rejectedRequests = filteredRequests.filter(r => r.status === 'REJECTED')

  // Further categorize approved requests by domain status
  const approvedActiveRequests = approvedRequests.filter(r =>
    r.domain_record?.status === 'ACTIVE' &&
    (!r.expiresAt || new Date(r.expiresAt) > new Date())
  )
  const approvedExpiredRequests = approvedRequests.filter(r =>
    r.domain_record?.status === 'EXPIRED' ||
    (r.expiresAt && new Date(r.expiresAt) <= new Date() && r.domain_record?.status === 'ACTIVE')
  )
  const approvedTrashedRequests = approvedRequests.filter(r =>
    r.domain_record?.status === 'TRASHED'
  )

  // Renewal requests by status
  const pendingRenewalRequests = filteredRenewalRequests.filter(r => r.status === 'PENDING')
  const approvedRenewalRequests = filteredRenewalRequests.filter(r => r.status === 'APPROVED')
  const rejectedRenewalRequests = filteredRenewalRequests.filter(r => r.status === 'REJECTED')


  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    durationType: 'ALL',
    sortBy: 'requestedAt',
    sortOrder: 'desc'
  })

  const [restoreData, setRestoreData] = useState({
    durationType: 'PERMANENT',
    expiresAt: ''
  })

  const [renewalData, setRenewalData] = useState({
    domainId: '',
    newExpiryDate: '',
    reason: ''
  })

  const [requestData, setRequestData] = useState({
    domain: '',
    purpose: '',
    ipAddress: '',
    requesterName: '',
    responsibleName: '',
    department: '',
    contact: '',
    contactType: 'EMAIL',
    durationType: 'PERMANENT',
    expiresAt: ''
  })

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains')
      if (response.ok) {
        const data = await response.json()
        setDomains(data)
      } else {
        console.error('API Error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Fetch Error:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteDomain = async (domainId, domainName, isInTrash) => {
    const confirmMessage = isInTrash
      ? `คุณแน่ใจหรือไม่ที่จะลบโดเมน "${domainName}" ถาวร? การดำเนินการนี้ไม่สามารถยกเลิกได้!`
      : `คุณแน่ใจหรือไม่ที่จะย้ายโดเมน "${domainName}" ไปยังถังขยะ?`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.action === 'moved_to_trash') {
          alert(`โดเมน "${domainName}" ถูกย้ายไปยังถังขยะแล้ว`)
        } else if (result.action === 'permanently_deleted') {
          alert(`โดเมน "${domainName}" ถูกลบถาวรแล้ว`)
        }
        fetchDomains()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Delete Error:', error)
      alert('เกิดข้อผิดพลาดในการลบโดเมน')
    }
  }

  const handleRestoreDomain = async (domainId, domainName) => {
    const domain = domains.find(d => d.id === domainId)
    if (!domain) {
      alert('ไม่พบโดเมนที่ต้องการกู้คืน')
      return
    }

    setSelectedDomain(domain)
    setRestoreData({
      durationType: domain.domainRequest.durationType,
      expiresAt: domain.domainRequest.expiresAt
        ? new Date(domain.domainRequest.expiresAt).toISOString().split('T')[0]
        : ''
    })
    setShowRestoreModal(true)
  }

  const handleRestoreSubmit = async () => {
    if (!selectedDomain) return

    if (restoreData.durationType === 'TEMPORARY' && !restoreData.expiresAt) {
      alert('กรุณาระบุวันหมดอายุสำหรับโดเมนชั่วคราว')
      return
    }

    try {
      const response = await fetch(`/api/domains/${selectedDomain.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'restore',
          durationType: restoreData.durationType,
          expiresAt: restoreData.durationType === 'TEMPORARY' ? restoreData.expiresAt : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        const typeText = restoreData.durationType === 'PERMANENT' ? 'ถาวร' : 'ชั่วคราว'
        const expiryText = restoreData.durationType === 'TEMPORARY' && restoreData.expiresAt
          ? ` (หมดอายุ: ${new Date(restoreData.expiresAt).toLocaleDateString('th-TH')})`
          : ''
        alert(`โดเมน "${selectedDomain.domainRequest.domain}" ถูกกู้คืนเป็นประเภท${typeText}${expiryText}แล้ว`)

        setShowRestoreModal(false)
        setSelectedDomain(null)
        setRestoreData({ durationType: 'PERMANENT', expiresAt: '' })
        fetchDomains()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Restore Error:', error)
      alert('เกิดข้อผิดพลาดในการกู้คืนโดเมน')
    }
  }

  const handleRestoreDataChange = (field, value) => {
    setRestoreData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'durationType' && value === 'PERMANENT' && { expiresAt: '' })
    }))
  }

  const handleRestoreCancel = () => {
    setShowRestoreModal(false)
    setSelectedDomain(null)
    setRestoreData({ durationType: 'PERMANENT', expiresAt: '' })
  }

  const handleRenewDomain = (domainId, domainName) => {
    const domain = domains.find(d => d.id === domainId)
    if (!domain) {
      alert('ไม่พบโดเมนที่ต้องการต่ออายุ')
      return
    }

    setRenewalData({
      domainId,
      newExpiryDate: '',
      reason: ''
    })
    setShowRenewalModal(true)
  }

  const handleRenewalSubmit = async () => {
    if (!renewalData.domainId || !renewalData.newExpiryDate) {
      alert('กรุณาระบุข้อมูลให้ครบถ้วน')
      return
    }

    if (new Date(renewalData.newExpiryDate) <= new Date()) {
      alert('วันหมดอายุใหม่ต้องเป็นวันที่ในอนาคต')
      return
    }

    try {
      const response = await fetch('/api/renewal-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(renewalData)
      })

      if (response.ok) {
        alert('ส่งคำขอต่ออายุสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ')
        setShowRenewalModal(false)
        setRenewalData({ domainId: '', newExpiryDate: '', reason: '' })
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting renewal request:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอต่ออายุ')
    }
  }

  const handleRenewalCancel = () => {
    setShowRenewalModal(false)
    setRenewalData({ domainId: '', newExpiryDate: '', reason: '' })
  }

  const handleRequestSubmit = async () => {
    const {
      domain, purpose, ipAddress, requesterName,
      responsibleName, department, contact, durationType, expiresAt
    } = requestData

    if (!domain || !purpose || !ipAddress || !requesterName || !responsibleName || !department || !contact) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (durationType === 'TEMPORARY' && !expiresAt) {
      alert('กรุณาระบุวันหมดอายุสำหรับโดเมนชั่วคราว')
      return
    }

    if (durationType === 'TEMPORARY' && new Date(expiresAt) <= new Date()) {
      alert('วันหมดอายุต้องเป็นวันที่ในอนาคต')
      return
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...requestData,
          expiresAt: durationType === 'TEMPORARY' ? expiresAt : null
        })
      })

      if (response.ok) {
        alert('ส่งคำขอใช้โดเมนสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ')
        setShowRequestModal(false)
        setRequestData({
          domain: '',
          purpose: '',
          ipAddress: '',
          requesterName: '',
          responsibleName: '',
          department: '',
          contact: '',
          contactType: 'EMAIL',
          durationType: 'PERMANENT',
          expiresAt: ''
        })
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอ')
    }
  }

  const handleRequestCancel = () => {
    setShowRequestModal(false)
    setRequestData({
      domain: '',
      purpose: '',
      ipAddress: '',
      requesterName: '',
      responsibleName: '',
      department: '',
      contact: '',
      contactType: 'EMAIL',
      durationType: 'PERMANENT',
      expiresAt: ''
    })
  }

  const handleRequestDataChange = (field, value) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'durationType' && value === 'PERMANENT' && { expiresAt: '' })
    }))
  }

  const filteredDomains = domains.filter(domain => {
    const keyword = filters.search.toLowerCase()
    const matchesSearch =
      domain.domainRequest.domain.toLowerCase().includes(keyword) ||
      domain.domainRequest.requesterName.toLowerCase().includes(keyword) ||
      domain.domainRequest.department.toLowerCase().includes(keyword)

    const matchesStatus = filters.status === 'ALL' || domain.status === filters.status
    const matchesDuration = filters.durationType === 'ALL' || domain.domainRequest.durationType === filters.durationType

    return matchesSearch && matchesStatus && matchesDuration
  }).sort((a, b) => {
    const field = filters.sortBy
    let aValue = '', bValue = ''

    switch (field) {
      case 'domain': aValue = a.domainRequest.domain; bValue = b.domainRequest.domain; break
      case 'requesterName': aValue = a.domainRequest.requesterName; bValue = b.domainRequest.requesterName; break
      case 'department': aValue = a.domainRequest.department; bValue = b.domainRequest.department; break
      case 'requestedAt':
      default:
        aValue = a.domainRequest.requestedAt
        bValue = b.domainRequest.requestedAt
    }

    return filters.sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  const activeDomains = filteredDomains.filter(d => d.status === 'ACTIVE')
  const expiredDomains = filteredDomains.filter(d => d.status === 'EXPIRED')
  const trashedDomains = filteredDomains.filter(d => d.status === 'TRASHED')

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
  const allStatusRequests = [
    ...pendingRequests,
    ...activeDomains,
    ...rejectedRequests
  ]

  const allRenewalRequests = [
    ...pendingRenewalRequests,
    ...rejectedRenewalRequests
  ]

  const tab = activeTab === 'trashed' ? trashedDomains : activeTab === 'renewals' ? allRenewalRequests : allStatusRequests

  const P = activeTab === "domains" ? pendingRequests : pendingRenewalRequests
  const A = activeTab === "domains" ? activeDomains : []
  const R = activeTab === "domains" ? rejectedRequests : rejectedRenewalRequests
  const t = activeTab === "domains" ? "" : "การต่ออายุ"

  const handleStatusChange = (status) => {
    setActiveStatus(prevStatus => (prevStatus === status ? '' : status));
  }

  const statusFilter =
    activeTab === 'domains' && activeStatus === "PENDING" ? pendingRequests
      : activeTab === 'domains' && activeStatus === "REJECTED" ? rejectedRequests
        : activeTab === 'domains' && activeStatus === "ACTIVE" ? activeDomains
          : activeTab === 'domains' ? allStatusRequests
            : activeTab === 'renewals' && activeStatus === "PENDING" ? pendingRenewalRequests
              : activeTab === 'renewals' && activeStatus === "REJECTED" ? rejectedRenewalRequests
                : activeTab === 'renewals' ? allRenewalRequests : trashedDomains


  return (

    <div>
      {/* Navigation */}
      < NavBar />
      {/* Results Summary 
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          แสดงผล {activeTab === 'domains' ? filteredRequests.length : filteredRenewalRequests.length} จาก {activeTab === 'domains' ? requests.length : renewalRequests.length} รายการ
          {filters.search && ` | ค้นหา: "${filters.search}"`}
          {filters.status !== 'ALL' && ` | สถานะ: ${filters.status}`}
          {activeTab === 'domains' && filters.durationType !== 'ALL' && ` | ประเภท: ${filters.durationType}`}
        </p>
      </div>*/}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigator */}
        <div className="bg-white rounded-lg shadow-sm mb-2">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('domains')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'domains'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  คำขอใช้โดเมน ({allStatusRequests.length})
                </div>

              </button>

              <button
                onClick={() => handleTabChange('renewals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'renewals'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  คำขอต่ออายุ ({renewalRequests.length})
                </div>
              </button>

              <button
                onClick={() => handleTabChange('trashed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'trashed'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  คำขอที่โดนลบ ({trashedDomains.length})
                </div>
              </button>

              <button
                onClick={() => setShowRenewalModal(true)}
                className="btn-emerald px-4 my-2 rounded-lg transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                ขอต่ออายุ
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-indigo px-4 my-2 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                ขอใช้โดเมนใหม่
              </button>

            </nav>
          </div>
        </div>

        {/* status */}
        <div className="grid grid-cols-1 mx-4 p-4 bg-light" >
          <div className=" d-flex ">
            <div className="flex ">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                คำขอใช้โดเมน
              </h2>
            </div>

            {/* Summary Cards */}
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(activeTab === "domains" || activeTab === "renewals") && (
                <button
                  onClick={() => handleStatusChange('PENDING')}

                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeStatus === 'PENDING'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center ">
                      <div className="flex-shrink-0">
                        <Clock className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">รอพิจารณา{t}</p>
                        <p className="text-2xl font-semibold text-gray-900">{P.length}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {(activeTab === "domains") && (
                <button
                  onClick={() => handleStatusChange('ACTIVE')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeStatus === 'ACTIVE'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                  < div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center ">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">ใช้งาน</p>
                        <p className="text-2xl font-semibold text-gray-900">{A.length}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {(activeTab === "domains" || activeTab === "renewals") && (
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeStatus === 'REJECTED'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center ">
                      <div className="flex-shrink-0">
                        <XCircle className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">ไม่อนุมัติ{t}</p>
                        <p className="text-2xl font-semibold text-gray-900">{R.length}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>

          </div>

        </div>
        <div className='grid grid-cols-1 mx-4 bg-light'>
          {/* Results Summary */}
          <div className="mx-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              แสดงผล ค้นหา: สถานะ: ประเภท:
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">

            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
              {/* Search */}
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Filter className="w-8 h-8 mr-2 text-blue-600" />
                กรองข้อมูล
              </h3>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Search className="w-4 h-4 mr-1" />
                  ค้นหา
                </label>
                <input
                  type="text"
                  value=""
                  placeholder="ชื่อโดเมน, ผู้ขอ, หน่วยงาน..."
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  ประเภท
                </label>
                <select
                  value=""
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">ทั้งหมด</option>
                  <option value="PERMANENT">ถาวร</option>
                  <option value="TEMPORARY">ชั่วคราว</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <SortAsc className="w-4 h-4 mr-1" />
                  เรียงตาม
                </label>
                <select
                  value=""
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="requestedAt">วันที่ขอ</option>
                  <option value="domain">ชื่อโดเมน</option>
                  <option value="requesterName">ผู้ขอ</option>
                  <option value="department">หน่วยงาน</option>
                  <option value="newExpiryDate">วันหมดอายุใหม่</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1">ลำดับ</label>
                <select
                  value=""
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="desc">ใหม่ไปเก่า</option>
                  <option value="asc">เก่าไปใหม่</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* domain list*/}
        <div className="bg-white rounded-xl shadow-md p-2 mx-8 ">
          <div className='grid grid-col-1  p-4  md:grid-cols-4 text-center '>
            <div className=" items-center  mb-2">
              <h3 className="text-sm  font-semibold text-gray-700">ลำดับ</h3>
            </div>
            <p className="text-sm text-gray-600">
              <strong>ชื่อโดเมน</strong>
            </p>
            <p className="text-sm text-gray-600">
              <strong>IP Address</strong>
            </p>
            <p className="text-sm text-gray-600">
              <strong>สถานะ</strong>
            </p>
          </div>


          <div className="grid grid-col-1 gap-4 mx-4 text-center">
            {statusFilter.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1  border border-gray-300 rounded-lg p-4 shadow-sm  hover:shadow-md transition md:grid-cols-4"
              >
                <div className="items-center justify-center ">
                  <h3 className="text-sm font-semibold text-gray-700">{index + 1}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{domain.domainRequest?.domain}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  <strong> {domain.domainRequest?.ipAddress}</strong>
                </p>
                <span
                  className={`px-2 py-1 rounded-full font-medium ${domain.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {domain.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                </span>
              </motion.div>
            ))}
            {statusFilter.length === 0 && (
              <div className="text-center text-gray-500 py-4">ไม่มีข้อมูลโดเมน</div>
            )}

          </div>

        </div>
      </main >
      {/* Request Modal */}
      {
        showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ขอใช้โดเมนใหม่
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อโดเมน *
                    </label>
                    <input
                      type="text"
                      value={requestData.domain}
                      onChange={(e) => handleRequestDataChange('domain', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example.nstru.ac.th"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP Address *
                    </label>
                    <input
                      type="text"
                      value={requestData.ipAddress}
                      onChange={(e) => handleRequestDataChange('ipAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="192.168.1.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วัตถุประสงค์ *
                  </label>
                  <textarea
                    value={requestData.purpose}
                    onChange={(e) => handleRequestDataChange('purpose', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ระบุวัตถุประสงค์ในการใช้งาน"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้ขอ *
                    </label>
                    <input
                      type="text"
                      value={requestData.requesterName}
                      onChange={(e) => handleRequestDataChange('requesterName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายสมชาย ใจดี"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้รับผิดชอบ *
                    </label>
                    <input
                      type="text"
                      value={requestData.responsibleName}
                      onChange={(e) => handleRequestDataChange('responsibleName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายสมศักดิ์ รักษา"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หน่วยงาน/ภาควิชา *
                  </label>
                  <input
                    type="text"
                    value={requestData.department}
                    onChange={(e) => handleRequestDataChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ภาควิชาวิทยาการคอมพิวเตอร์"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อมูลติดต่อ *
                    </label>
                    <input
                      type="text"
                      value={requestData.contact}
                      onChange={(e) => handleRequestDataChange('contact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com หรือ 081-234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทการติดต่อ *
                    </label>
                    <select
                      value={requestData.contactType}
                      onChange={(e) => handleRequestDataChange('contactType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EMAIL">อีเมล</option>
                      <option value="PHONE">โทรศัพท์</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทการใช้งาน *
                    </label>
                    <select
                      value={requestData.durationType}
                      onChange={(e) => handleRequestDataChange('durationType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PERMANENT">ถาวร</option>
                      <option value="TEMPORARY">ชั่วคราว</option>
                    </select>
                  </div>

                  {requestData.durationType === 'TEMPORARY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วันหมดอายุ *
                      </label>
                      <input
                        type="date"
                        value={requestData.expiresAt}
                        onChange={(e) => handleRequestDataChange('expiresAt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleRequestCancel}
                  className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleRequestSubmit}
                  className="px-4 py-2 btn-emerald rounded-lg transition-colors"
                >
                  ส่งคำขอ
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}