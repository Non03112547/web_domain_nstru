'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  UserRound,
  ShieldUser,
  HardDrive,
  Flag,
  FileChartColumn,
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
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [requests, setRequests] = useState([])
  const [renewalRequests, setRenewalRequests] = useState([])
  const [activeStatus, setActiveStatus] = useState('')
  const [policy, setPolicy] = useState(false); // false = ยังไม่ยอมรับ

  const fetchRenewalRequests = async () => {
    try {
      const isAdmin = session?.user?.role === 'ADMIN'; // หรือดึงจาก context / state
      const url = isAdmin
        ? '/api/renewal-requests'         // ✅ admin เห็นทั้งหมด
        : '/api/renewal-requests?my=true'; // ✅ user เห็นเฉพาะของตัวเอง

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRenewalRequests(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch:', errorData.error);
      }
    } catch (err) {
      console.error('Error fetching:', err);
    }
  }
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
      const response = await fetch('/api/renewal-requests?my=true');
      const text = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error' };
        }
        console.error('Failed to fetch renewal requests:', errorData.error);
        return;
      }

      if (!text) {
        console.error('Response body is empty');
        return;
      }

      const data = JSON.parse(text);
      setRenewalRequests(data);
    } catch (error) {
      console.error('Error fetching renewal requests:', error);
    }
  }



  const handlePolicyChange = (e) => {
    setPolicy(e.target.checked);
  };



  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    durationType: 'ALL',
    sortBy: 'requestedAt',
    sortOrder: 'desc'
  })
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
    machineType: '',
    OS: '',
    otherMachineType: '',
    otherOS: '',
    purpose: '',
    ipAddress: '',
    requesterName: '',
    responsibleName: '',
    department: '',
    institution: '',
    contact: '',
    contactType: 'EMAIL',
    responsibleContact: '',
    responsibleContactType: 'EMAIL',
    machineAdminType: '',
    machineAdminName: '',
    machineAdminPosition: '',
    machineAdminContact: '',
    machineAdminContactType: 'EMAIL',
    machineRoom: '',
    machinePlace: '',
    property: '',
    useType: '',
    durationType: 'PERMANENT',
    expiresAt: ''
  })
  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');

      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      } else if (response.status === 401) {
        alert('คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อน');
        // หรือ redirect ไปหน้า login ก็ได้ เช่น:
        // window.location.href = '/auth/login';
      } else if (response.status === 403) {
        alert('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains()
  }, [])

  useEffect(() => {
    if (requestData.machineAdminType !== 'MachineAdmin') {
      handleRequestDataChange('machineAdminName', requestData.requesterName);
      handleRequestDataChange('machineAdminPosition', requestData.department);
      handleRequestDataChange('machineAdminContact', requestData.contact);
      handleRequestDataChange('machineAdminContactType', requestData.contactType);
    }
  }, [requestData.machineAdminType])


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

  const handleSelect = async (domainId, domainName) => {
    const domain = domains.find(d => d.id === domainId)
    if (!domain) {
      alert('ไม่พบโดเมนที่ต้องการเลือก')
      return
    }
    setSelectedDomain(domain)
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
      domain, machineType, OS,
      requesterName, responsibleName, department, institution, contact, responsibleContact,
      machineRoom, machinePlace,
      property, useType, durationType, expiresAt
    } = requestData

    if (!domain || !machineType || !OS || !requesterName || !responsibleName || !department || !institution || !contact || !responsibleContact || !machineRoom || !machinePlace || !property || !useType) {
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
          machineType: '',
          OS: '',
          otherMachineType: '',
          otherOS: '',
          purpose: '',
          ipAddress: '',
          requesterName: '',
          responsibleName: '',
          department: '',
          institution: '',
          contact: '',
          contactType: 'EMAIL',
          responsibleContact: '',
          responsibleContactType: 'EMAIL',
          machineAdminType: '',
          machineAdminName: '',
          machineAdminPosition: '',
          machineAdminContact: '',
          machineAdminContactType: 'EMAIL',
          machineRoom: '',
          machinePlace: '',
          property: '',
          useType: '',
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
      machineType: '',
      OS: '',
      otherMachineType: '',
      otherOS: '',
      purpose: '',
      ipAddress: '',
      requesterName: '',
      responsibleName: '',
      department: '',
      institution: '',
      contact: '',
      contactType: 'EMAIL',
      responsibleContact: '',
      responsibleContactType: 'EMAIL',
      machineAdminType: '',
      machineAdminName: '',
      machineAdminPosition: '',
      machineAdminContact: '',
      machineAdminContactType: 'EMAIL',
      machineRoom: '',
      machinePlace: '',
      property: '',
      useType: '',
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

  const allRenewalRequests = renewalRequests

  const trashedExpired = [
    ...expiredDomains,
    ...trashedDomains
  ]
  const tab = activeTab === 'trashedExpired' ? trashedExpired : activeTab === 'renewals' ? allRenewalRequests : allStatusRequests

  const P = activeTab === "domains" ? pendingRequests : allRenewalRequests
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
            : activeTab === 'renewals' && activeStatus === "PENDING" ? allRenewalRequests
              : activeTab === 'renewals' && activeStatus === "REJECTED" ? rejectedRenewalRequests
                : activeTab === 'renewals' ? allRenewalRequests : trashedExpired;

  console.log('statusFilter:', statusFilter)
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
      </div> GOOD*/ }
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
                  คำขอต่ออายุ ({allRenewalRequests.length})
                </div>
              </button>

              <button
                onClick={() => handleTabChange('trashedExpired')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'trashedExpired'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  โดเมนที่โดนลบและหมดอายุ ({trashedDomains.length + expiredDomains.length})
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
                  value={filters.search}
                  placeholder="ชื่อโดเมน, ผู้ขอ, หน่วยงาน..."
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  ประเภท
                </label>
                <select
                  value={filters.durationType}
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, durationType: e.target.value }))}
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
                  value={filters.sortBy}
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
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
                  value={filters.sortOrder}
                  className="w-full px-3 py-1 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
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


          <div className="grid grid-cols-1 gap-4 mx-4 text-center">
            {statusFilter.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1  border border-gray-300 rounded-lg p-4 shadow-sm  hover:shadow-md transition md:grid-cols-4"
                onClick={() => { setShowDetailModal(true); setSelectedDomain(domain); }}
              >
                <div className="items-center justify-center ">
                  <h3 className="text-sm font-semibold text-gray-700">{index + 1}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{domain.domainRequest?.domain || domain.domain?.domainRequest?.domain || domain.domain || "-"}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  <strong> {domain.domainRequest?.ipAddress || domain.domain?.domainRequest?.ipAddress || domain.ipAddress || "-"}</strong>
                </p>
                <span
                  className={`px-2 py-1 rounded-full font-medium ${domain.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : domain.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {domain.status === 'ACTIVE' ? 'ใช้งานอยู่' : domain.status === 'PENDING' ? 'รอการอนุมัติ' : 'ไม่ใช้งาน'}
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
                      IP Address (ถ้าหากมี)
                    </label>
                    <input
                      type="text"
                      value={requestData.ipAddress}
                      onChange={(e) => handleRequestDataChange('ipAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทเครื่อง
                    </label>
                    <select
                      value={requestData.machineType}
                      onChange={(e) => handleRequestDataChange('machineType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value=" " >--เลือก--</option>
                      <option>PC/Mac</option>
                      <option>Unix Workstation</option>
                      <option value="other"> อื่นๆ </option>
                    </select>
                    {requestData.machineType === "other" && (
                      <input
                        type="text"
                        value={requestData.otherMachineType}
                        onChange={(e) => handleRequestDataChange('otherMachineType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ระบบปฏิบัติการ
                    </label>
                    <select
                      value={requestData.OS}
                      onChange={(e) => handleRequestDataChange('OS', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value=" " >--เลือก--</option>
                      <option>Linux</option>
                      <option>Unix</option>
                      <option>MS Windows</option>
                      <option value="other"> อื่นๆ </option>
                    </select>
                    {requestData.OS === "other" && (
                      <input
                        type="text"
                        value={requestData.otherOS}
                        onChange={(e) => handleRequestDataChange('otherOS', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                </div>
                <br></br>
                <br></br>
                <hr></hr>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วัตถุประสงค์ *
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คุณสมบัติ
                  </label>
                  <select
                    value={requestData.property}
                    onChange={(e) => handleRequestDataChange('property', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" >--เลือก--</option>
                    <option value="InNSTRU">ใช้งานเฉพาะเครือข่ายภายในมหาวิทยาลัยราชภัฏนครศรีธรรมราช (Intranet)</option>
                    <option value="InOutNSTRU">ใช้งานเฉพาะเครือข่ายภายในและภายนอกมหาวิทยาลัยราชภัฏนครศรีธรรมราช</option>
                  </select>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    การใช้งาน
                  </label>
                  <select
                    value={requestData.useType}
                    onChange={(e) => handleRequestDataChange('useType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" >--เลือก--</option>
                    <option value="NoSever" >ใช้ทั่วไปโดยไม่ได้เป็นเซอร์ฟเวอร์</option>
                    <option value="Sever">ใช้เป็นเซอร์ฟเวอร์ให้บริการ (โปรดระบุ) </option>
                  </select>
                  {requestData.useType === 'Sever' && (
                    <textarea
                      value={requestData.purpose}
                      onChange={(e) => handleRequestDataChange('purpose', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="ระบุวัตถุประสงค์ในการใช้เป็นเซอร์ฟเวอร์ให้บริการ"
                    />)
                  }

                </div>
                <br></br>
                <br></br>
                <hr></hr>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้ขอโดเมน *
                    </label>
                    <input
                      type="text"
                      value={requestData.requesterName}
                      onChange={(e) => handleRequestDataChange('requesterName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายสมหมาย รักชาติ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้รับผิดชอบโดเมน *
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อมูลติดต่อ ผู้ขอโดเมน *
                    </label>
                    <input
                      type="text"
                      value={requestData.contact}
                      onChange={(e) => {
                        const value = e.target.value;

                        // อัปเดตค่าข้อมูลที่กรอก
                        handleRequestDataChange('contact', value);

                        // ตรวจสอบว่าเป็นตัวเลขอย่างเดียวหรือไม่
                        const isPhone = /^[0-9\s\-+()]+$/.test(value);
                        const contactType = isPhone ? 'PHONE' : 'EMAIL';

                        // อัปเดต contactType อัตโนมัติ
                        handleRequestDataChange('contactType', contactType);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com หรือ 081-234-5678"
                    />

                    <div className='hidden'>
                      <input
                        type="text"
                        value={requestData.contactType === 'PHONE' ? 'โทรศัพท์' : 'อีเมล'}
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อมูลติดต่อ ผู้รับผิดชอบโดเมน *
                    </label>
                    <input
                      type="text"
                      value={requestData.responsibleContact}
                      onChange={(e) => {
                        const value = e.target.value;

                        // อัปเดตค่าข้อมูลที่กรอก
                        handleRequestDataChange('responsibleContact', value);

                        // ตรวจสอบว่าเป็นตัวเลขอย่างเดียวหรือไม่
                        const isPhone = /^[0-9\s\-+()]+$/.test(value);
                        const responsibleContactType = isPhone ? 'PHONE' : 'EMAIL';

                        // อัปเดต contactType อัตโนมัติ
                        handleRequestDataChange('responsibleContactType', responsibleContactType);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com หรือ 081-234-5678"
                    />

                    <div className='hidden'>
                      <input
                        type="text"
                        value={requestData.contactType === 'PHONE' ? 'โทรศัพท์' : 'อีเมล'}
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ภาควิชา/ฝ่าย/แผนก  *
                  </label>
                  <input
                    type="text"
                    value={requestData.department}
                    onChange={(e) => handleRequestDataChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ภาควิชาวิทยาการคอมพิวเตอร์"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คณะ/สำนัก/สถาบัน/กอง :   *
                  </label>
                  <input
                    type="text"
                    value={requestData.institution}
                    onChange={(e) => handleRequestDataChange('institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="คณะวิทยาศาสตร์และเทคโนโลยี"
                  />
                </div>
                <br></br>
                <br></br>
                <hr></hr>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ที่ตั้งเครื่อง
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ห้อง *
                  </label>
                  <input
                    type="text"
                    value={requestData.machineRoom}
                    onChange={(e) => handleRequestDataChange('machineRoom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1930"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อาคาร *
                  </label>
                  <input
                    type="text"
                    value={requestData.machinePlace}
                    onChange={(e) => handleRequestDataChange('machinePlace', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="19"
                  />
                </div>
                <br></br>
                <br></br>
                <hr></hr>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ผู้ดูแลเครื่อง
                  </label>
                  <select
                    value={requestData.machineAdminType}
                    onChange={(e) => handleRequestDataChange('machineAdminType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value=" " >--เลือก--</option>
                    <option value="requester">บุคคลเดียวกับผู้ขอจดทะเบียน</option>
                    <option value="MachineAdmin">มีผู้ดูแลเครื่องโดยเฉพาะคือ</option>
                  </select>
                </div>

                {requestData.machineAdminType === 'MachineAdmin' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ ผู้ดูแลเครื่อง *
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminName}
                      onChange={(e) => handleRequestDataChange('machineAdminName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายสมศักดิ์ รักษา"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ตำแหน่ง ผู้ดูแลเครื่อง *
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminPosition}
                      onChange={(e) => handleRequestDataChange('machineAdminPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นักวิชาการคอมพิวเตอร์"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ช่องทางการติดต่อ ผู้ดูแลเครื่อง *
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminContact}
                      onChange={(e) => {
                        const value = e.target.value;

                        // อัปเดตค่าข้อมูลที่กรอก
                        handleRequestDataChange('machineAdminContact', value);

                        // ตรวจสอบว่าเป็นตัวเลขอย่างเดียวหรือไม่
                        const machineisPhone = /^[0-9\s\-+()]+$/.test(value);
                        const machineAdminContactType = machineisPhone ? 'PHONE' : 'EMAIL';

                        // อัปเดต contactType อัตโนมัติ
                        handleRequestDataChange('machineAdminContactType', machineAdminContactType);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com หรือ 081-234-5678"
                    />
                  </div>) : (
                  <></>
                )}
                <br></br>
                <br></br>
                <hr></hr>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันหมดอายุ
                    </label>
                    <input
                      type="date"
                      value={requestData.expiresAt}
                      onChange={(e) => {
                        const date = e.target.value;
                        handleRequestDataChange('expiresAt', date);

                        // ตั้ง durationType ตามว่ามีวันที่หรือไม่
                        const newDurationType = date ? 'TEMPORARY' : 'PERMANENT';
                        handleRequestDataChange('durationType', newDurationType);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทการใช้งาน (อัตโนมัติ)
                    </label>
                    <input
                      type="text"
                      value={requestData.durationType === 'TEMPORARY' ? 'ชั่วคราว' : 'ถาวร'}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <br></br>
              <hr></hr>
              <br></br>
              <div className="grid  gap-4">
                <label className='text-red-500'>
                  <input type="checkbox" name="policy" value="yes" onChange={handlePolicyChange}
                    checked={policy} className='scale-150 mr-2 ' />
                  <span>
                    **ทั้งนี้ข้าพเจ้าจะปฏิบัติตามระเบียบ พ.ร.บ. ว่าด้วยการกระทำผิดทางคอมพิวเตอร์ พ.ศ.2550
                    อย่างเคร่งครัดและพร้อมให้ข้อมูลต่างๆกับทางผู้ดูแลระบบสารสนเทศของมหาวิทยาลัยได้ในกรณีมีการร้องขอข้อมูล
                    ข้าพเจ้าเข้าใจเงื่อนไขในการขอใช้บริการดังกล่าว จึงลงลายมือชื่อไว้เป็นหลักฐาน
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleRequestCancel}
                  className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                {policy ? (
                  <button
                    onClick={() => {
                      handleRequestSubmit();
                    }}
                    className="px-4 py-2 btn-emerald rounded-lg transition-colors"
                  >
                    ส่งคำขอ
                  </button>
                ) : (
                  <button
                    onClick={() => alert("กรุณายอมรับนโยบายก่อนส่งคำขอ")}
                    className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                  >
                    ส่งคำขอ
                  </button>)}

              </div>
            </div>
          </div>
        )
      }
      {/* Renewal Modal */}
      {
        showRenewalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ขอต่ออายุโดเมน
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกโดเมนที่ต้องการต่ออายุ *
                  </label>
                  <select
                    value={renewalData.domainId}
                    onChange={(e) => setRenewalData(prev => ({ ...prev, domainId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกโดเมน --</option>
                    {[...activeDomains, ...expiredDomains, ...trashedDomains]
                      .filter(domain => domain.domainRequest.durationType !== 'PERMANENT') // ไม่แสดงโดเมนถาวร
                      .map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domainRequest.domain}
                          {domain.status === 'EXPIRED' ? ' (หมดอายุ)' : ''}
                          {domain.status === 'TRASHED' ? ' (ในถังขยะ)' : ''}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันหมดอายุใหม่ *
                  </label>
                  <input
                    type="date"
                    value={renewalData.newExpiryDate}
                    onChange={(e) => setRenewalData(prev => ({ ...prev, newExpiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เหตุผลในการต่ออายุ
                  </label>
                  <textarea
                    value={renewalData.reason}
                    onChange={(e) => setRenewalData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ระบุเหตุผล (ไม่บังคับ)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleRenewalCancel}
                  className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    handleRenewalSubmit;
                    window.location.reload();
                  }}
                  className="px-4 py-2 btn-emerald rounded-lg transition-colors"
                >
                  ส่งคำขอ
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/*show detail model */}
      {
        showDetailModal && selectedDomain && (() => {
          const domainData = selectedDomain.domainRequest || selectedDomain.domain?.domainRequest || selectedDomain;
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-4">
                    <strong>รายการโดเมน</strong>
                  </h1>
                </div>
                <div className="space-y-4">

                  {/* ข้อมูลโดเมน */}
                  <h2 className='flex items-center gap-2'><ClipboardList /><strong> ข้อมูลโดเมน</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>ชื่อโดเมน:</strong> <span className="text-blue-500">{domainData?.domain || '-'}</span></div>
                    <div><strong>IP Address:</strong> <span className="text-blue-500">{domainData?.ipAddress || '-'}</span></div>
                    <div><strong>ระบบปฏิบัติการ:</strong> <span className="text-blue-500">{domainData?.OS || '-'}</span></div>
                  </div>

                  <hr className="my-4" />

                  {/* ข้อมูลผู้ขอและผู้รับผิดชอบ */}
                  <h2 className='flex items-center gap-2'><UserRound /><strong> ข้อมูลผู้ขอและผู้รับผิดชอบ</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>ชื่อผู้ขอ:</strong> <span className="text-blue-500">{domainData?.requesterName || '-'}</span></div>
                    <div><strong>ชื่อผู้รับผิดชอบ:</strong> <span className="text-blue-500">{domainData?.responsibleName || '-'}</span></div>
                    <div><strong>ข้อมูลติดต่อผู้ขอ:</strong> <span className="text-blue-500">{domainData?.contact || '-'}</span></div>
                    <div><strong>ข้อมูลติดต่อผู้รับผิดชอบ:</strong> <span className="text-blue-500">{domainData?.responsibleContact || '-'}</span></div>
                    <div><strong>ภาควิชา/ฝ่าย/แผนก:</strong> <span className="text-blue-500">{domainData?.department || '-'}</span></div>
                    <div><strong>คณะ/สำนัก/สถาบัน/กอง:</strong> <span className="text-blue-500">{domainData?.institution || '-'}</span></div>
                  </div>

                  <hr className="my-4" />

                  {/* ที่ตั้งเครื่อง */}
                  <h2 className='flex items-center gap-2'><HardDrive /><strong> ที่ตั้งเครื่อง</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>อาคาร:</strong> <span className="text-blue-500">{domainData?.machinePlace || '-'}</span></div>
                    <div><strong>ห้อง:</strong> <span className="text-blue-500">{domainData?.machineRoom || '-'}</span></div>
                  </div>

                  <hr className="my-4" />

                  {/* ผู้ดูแลเครื่อง */}
                  <h2 className='flex items-center gap-2'><ShieldUser /><strong> ผู้ดูแลเครื่อง</strong></h2>
                  {(domainData?.machineAdminType === 'requester') ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><strong>ผู้ดูแลเครื่อง:</strong> <span className="text-blue-500">บุคคลเดียวกับผู้ขอจดทะเบียน</span></div>
                    </div>

                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><strong>ผู้ดูแลเครื่อง:</strong> <span className="text-blue-500">มีผู้ดูแลเครื่องโดยเฉพาะคือ</span></div>
                      <div><strong>ชื่อผู้ดูแลเครื่อง:</strong> <span className="text-blue-500">{domainData?.machineAdminName || '-'}</span></div>
                      <div><strong>ตำแหน่ง:</strong> <span className="text-blue-500">{domainData?.machineAdminPosition || '-'}</span></div>
                      <div><strong>ช่องทางติดต่อ:</strong> <span className="text-blue-500">{domainData?.machineAdminContact || '-'}</span></div>
                    </div>
                  )}
                  <hr className="my-4" />

                  {/* วัตถุประสงค์ */}
                  <h2 className='flex items-center gap-2'><Flag /><strong> วัตถุประสงค์</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>คุณสมบัติ:</strong> <span className="text-blue-500">{domainData?.property === "InNSTRU"
                      ? "ใช้งานเฉพาะเครือข่ายภายในมหาวิทยาลัยราชภัฏนครศรีธรรมราช (Intranet)"
                      : "ใช้งานเฉพาะเครือข่ายภายในและภายนอกมหาวิทยาลัยราชภัฏนครศรีธรรมราช" || '-'}</span></div>
                    <div><strong>การใช้งาน:</strong> <span className="text-blue-500">{domainData?.useType === "NoSever"
                      ? "ใช้ทั่วไปโดยไม่ได้เป็นเซอร์ฟเวอร์"
                      : "ใช้เป็นเซอร์ฟเวอร์ให้บริการ " + "( " + domainData?.purpose + " )" || '-'}</span></div>
                  </div>

                  <hr className="my-4" />

                  {/* รายละเอียดการขอ */}
                  <h2 className='flex items-center gap-2'><FileChartColumn /><strong> รายละเอียด</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>วันที่ขอ:</strong> {domainData?.requestedAt ? new Date(domainData.requestedAt).toLocaleString() : '-'}</div>
                    <div><strong>ระยะเวลาใช้งาน:</strong> {domainData?.durationType === "PERMANENT" ? "ถาวร" : "ชั่วคราว" || '-'}</div>
                    <div><strong>วันหมดอายุ:</strong> {domainData?.expiresAt ? new Date(domainData.expiresAt).toLocaleDateString() : '-'}</div>
                    <div><strong>สถานะ:</strong> {selectedDomain.status === "ACTIVE"
                      ? <span className="text-green-500">ใช้งานอยู่</span>
                      : selectedDomain.status === "PENDING" ? <span className="text-yellow-500">กำลังรอการอนุมัติ</span>
                        : selectedDomain.status === "REJECTED" ? <span className="text-gray-500">ไม่อนุมัติ</span>
                          : selectedDomain.status === "EXPIRED" ? <span className="text-blue-500">หมดอายุ</span>
                            : <span className="text-red-500">อยู่ในถังขยะ</span> || '-'}</div>
                    <div><strong>บัญชี :</strong> {domainData?.username || domainData?.user?.username || '-'}</div>
                  </div>
                </div >
                <br></br>
                <div>
                  {session?.user?.role === 'ADMIN' && selectedDomain.status === "PENDING" && (
                    <div className="flex justify-start space-x-3 mt-6">
                      <button
                        onClick={() => {
                          handleApproveRequest(domainData?.id, 'approve') || handleApproveRenewalRequest(domainData?.id, 'approve');
                          window.location.reload();
                        }}
                        className="px-4 py-2 btn-emerald rounded-lg transition-colors"
                      >
                        อนุมัติคำขอ
                      </button>
                      <button
                        onClick={() => {
                          handleApproveRequest(domainData?.id, 'reject') || handleApproveRenewalRequest(domainData?.id, 'reject');
                          window.location.reload();
                        }}
                        className="px-4 py-2 btn-rose rounded-lg transition-colors"
                      >
                        ไม่อนุมัติคำขอ
                      </button>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>

              </div >
            </div >

          )
        })()
      }

    </div >
  );
}