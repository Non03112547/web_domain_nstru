'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Printer,
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
  Settings2,
  ClockAlert,
  CircleX,
  Server, Activity, AlertTriangle
} from 'lucide-react'
import NavBar from '@/components/nav'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'

const trashedDay = (trashExpiresAt) => {
  if (!trashExpiresAt) return null;

  const now = new Date();
  const trashDate = new Date(trashExpiresAt);

  // ตั้งเวลาเป็นเที่ยงคืนทั้งสองวัน
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(trashDate.getFullYear(), trashDate.getMonth(), trashDate.getDate());

  const diffMs = target - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// จำนวนวันที่เหลือหลังจากหมดอายุ เพื่อเปลี่ยนจาก EXPIRED -> TRASHED
const expiredDay = (expiresAt) => {
  if (!expiresAt) return null;

  const now = new Date();
  const expireDate = new Date(expiresAt);

  // บวก 30 วันหลังหมดอายุ
  const target = new Date(expireDate.getFullYear(), expireDate.getMonth(), expireDate.getDate());
  target.setDate(target.getDate() + 30);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// จำนวนวันที่เหลือก่อนหมดอายุ (ACTIVE -> EXPIRED)
const activeDay = (expiresAt) => {
  if (!expiresAt) return null;

  const now = new Date();
  const expireDate = new Date(expiresAt);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(expireDate.getFullYear(), expireDate.getMonth(), expireDate.getDate());

  const diffMs = target - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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
  const [selectedDomain, setSelectedDomain] = useState('')
  const [requests, setRequests] = useState([])
  const [renewalRequests, setRenewalRequests] = useState([])
  const [activeStatus, setActiveStatus] = useState('')
  const [policy, setPolicy] = useState(false); // false = ยังไม่ยอมรับ
  const [showPreview, setShowPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false); // ตรวจสอบว่ากำลังแก้ไขอยู่หรือไม่
  const [iDsIP, setIDsIP] = useState('')
  const [ips, setIps] = useState('')
  const [ipChanged, setIpChanged] = useState(false)


  const handleBlur = () => {
    setIsEditing(false); // เมื่อเลิกแก้ไข
    handleRequestSubmitIP()
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'TRASHED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <ClockAlert className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
        return {
          className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
          badge: 'bg-green-100 text-green-800 border border-green-200',
          text: 'ใช้งานอยู่',
          glow: 'shadow-green-100'
        };
      case 'PENDING':
        return {
          className: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
          text: 'รอการอนุมัติ',
          glow: 'shadow-yellow-100'
        };
      case 'REJECTED':
        return {
          className: 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400 text-gray-800',
          badge: 'bg-gray-300 text-gray-700 border border-gray-400',
          text: 'ไม่อนุมัติ',
          glow: 'shadow-gray-300'
        };
      case 'TRASHED':
        return {
          className: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
          badge: 'bg-red-100 text-red-800 border border-red-200',
          text: 'ไม่ใช้งาน',
          glow: 'shadow-red-100'
        };
      default:
        return {
          className: 'bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200 text-orange-800',
          badge: 'bg-orange-100 text-orange-800 border border-orange-200',
          text: 'หมดเวลาการใช้งาน',
          glow: 'shadow-orange-100'
        };
    }
  };




  const handleGenerateWord = async (id) => {
    try {
      const res = await fetch(`/api/generate-word/${id}`);
      if (!res.ok) throw new Error("ไม่สามารถสร้าง Word ได้");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `domainRequest_${id}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreview = async (id) => {
    try {
      const res = await fetch(`/api/generate-word/${id}?mode=preview`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดตัวอย่างได้");

      const contentType = res.headers.get("content-type");

      if (contentType === "application/pdf") {
        // PDF preview เท่านั้น
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url); // state สำหรับ iframe
      } else {
        throw new Error("ชนิดไฟล์ไม่รองรับ");
      }

      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setShowPreview(true);
    }
  };



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
          confirmMessage = 'คุณต้องการย้ายโดเมนที่เลยวันใช้งานไปยังถังขยะใช่หรือไม่?'
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
        setShowDetailModal(false)
        const message = action === 'approve'
          ? 'อนุมัติคำขอสำเร็จ'
          : 'ไม่อนุมัติคำขอสำเร็จ'
        alert(message)
        fetchMyRequests()
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
        window.location.reload()
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
    position: '',
    responsibleName: '',
    department: '',
    institution: '',
    contactP: '',
    contactE: '',
    responsibleContactP: '',
    responsibleContactE: '',
    machineAdminType: '',
    machineAdminName: '',
    machineAdminPosition: '',
    machineAdminContactP: '',
    machineAdminContactE: '',
    machineRoom: '',
    machinePlace: '',
    property: '',
    useType: '',
    durationType: 'PERMANENT',
    expiresAt: ''
  })

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      } else if (response.status === 401) {
        console.log("ยังไม่ได้เข้าสู่ระบบ");
        //alert('คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อน');
        //  redirect ไปหน้า login:
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
      handleRequestDataChange('machineAdminContactP', requestData.contactP);
      handleRequestDataChange('machineAdminContactE', requestData.contactE);
    }
  }, [requestData.machineAdminType])

  useEffect(() => {
    // ทุกครั้งที่เลือก domain ใหม่ → ปิด preview ไปก่อน
    setShowPreview(false);
  }, [selectedDomain?.id]);

  useEffect(() => {
    if (selectedDomain?.domainRequest) {
      setRequestData({
        domain: selectedDomain.domainRequest.domain || '',
        ipAddress: selectedDomain.domainRequest.ipAddress || '',
        machineType: selectedDomain.domainRequest.machineType || '',
        OS: selectedDomain.domainRequest.OS || '',
        otherMachineType: selectedDomain.domainRequest.otherMachineType || '',
        otherOS: selectedDomain.domainRequest.otherOS || '',
        purpose: selectedDomain.domainRequest.purpose || '',
        requesterName: selectedDomain.domainRequest.requesterName || '',
        position: selectedDomain.domainRequest.position || '',
        responsibleName: selectedDomain.domainRequest.responsibleName || '',
        department: selectedDomain.domainRequest.department || '',
        institution: selectedDomain.domainRequest.institution || '',
        contactP: selectedDomain.domainRequest.contactP || '',
        contactE: selectedDomain.domainRequest.contactE || '',
        responsibleContactP: selectedDomain.domainRequest.responsibleContactP || '',
        responsibleContactE: selectedDomain.domainRequest.responsibleContactE || '',
        machineAdminType: selectedDomain.domainRequest.machineAdminType || '',
        machineAdminName: selectedDomain.domainRequest.machineAdminName || '',
        machineAdminPosition: selectedDomain.domainRequest.machineAdminPosition || '',
        machineAdminContactP: selectedDomain.domainRequest.machineAdminContactP || '',
        machineAdminContactE: selectedDomain.domainRequest.machineAdminContactE || '',
        machineRoom: selectedDomain.domainRequest.machineRoom || '',
        machinePlace: selectedDomain.domainRequest.machinePlace || '',
        property: selectedDomain.domainRequest.property || '',
        useType: selectedDomain.domainRequest.useType || '',
        durationType: selectedDomain.domainRequest.durationType || 'PERMANENT',
        expiresAt: selectedDomain.domainRequest.expiresAt || ''
      });
    }
  }, [selectedDomain]);

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

  const handleRestoreDomain = () => {
    if (!selectedDomain?.domainRequest?.id) {
      alert('ไม่พบโดเมนที่ต้องการกู้คืน')
      return
    }
    setShowRestoreModal(true)
    setRestoreData({
      durationType: selectedDomain?.domainRequest?.durationType || '',
      expiresAt: selectedDomain?.domainRequest?.expiresAt
        ? new Date(selectedDomain.domainRequest.expiresAt).toISOString().split('T')[0]
        : ''
    })

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          durationType: restoreData.durationType,
          expiresAt: restoreData.durationType === 'TEMPORARY' ? restoreData.expiresAt : null
        })
      })

      const text = await response.text()        // อ่าน response เป็น text
      const result = text ? JSON.parse(text) : {}  // ถ้า empty → {}

      if (response.ok) {
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
        alert(`เกิดข้อผิดพลาด: ${result.error || 'ไม่ทราบสาเหตุ'}`)
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
    try {
      const response = await fetch('/api/renewal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewalData),
      });

      if (response.ok) {
        alert('ส่งคำขอต่ออายุสำเร็จ');
      } else {
        let errorMessage = 'Unknown error';
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } else {
          errorMessage = await response.text();
        }
        alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error submitting renewal request:', err);
      alert('เกิดข้อผิดพลาดในการส่งคำขอต่ออายุ');
    }
  };

  const handleRenewalCancel = () => {
    setShowRenewalModal(false)
    setRenewalData({ domainId: '', newExpiryDate: '', reason: '' })
  }

  const handleRequestSubmit = async () => {
    const {
      domain, machineType, OS, position,
      requesterName, responsibleName, department, institution, contactP, contactE, responsibleContactP, responsibleContactE,
      machineRoom, machinePlace,
      property, useType, durationType, expiresAt
    } = requestData

    if (!domain || !machineType || !OS || !requesterName || !responsibleName || !position || !department || !institution || !contactP || !responsibleContactP || !contactE || !responsibleContactE || !machineRoom || !machinePlace || !property || !useType) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (durationType === 'TEMPORARY' && !expiresAt) {
      alert('กรุณาระบุวันที่ใช้งานสำหรับโดเมนชั่วคราว')
      return
    }

    if (durationType === 'TEMPORARY' && new Date(expiresAt) <= new Date()) {
      alert('ขอใช้โดเมนถึงวันที่ต้องเป็นวันที่ในอนาคต')
      return
    }
    if (durationType === 'TEMPORARY' && new Date(expiresAt) <= new Date()) {
      alert('ขอใช้โดเมนถึงวันที่ต้องเป็นวันที่ในอนาคต')
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
          position: '',
          responsibleName: '',
          department: '',
          institution: '',
          contactP: '',
          contactE: '',
          responsibleContactP: '',
          responsibleContactE: '',
          machineAdminType: '',
          machineAdminName: '',
          machineAdminPosition: '',
          machineAdminContactP: '',
          machineAdminContactE: '',
          machineRoom: '',
          machinePlace: '',
          property: '',
          useType: '',
          durationType: 'PERMANENT',
          expiresAt: ''
        })
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอ')
    }
  }


  const handleRequestSubmitIP = async () => {
    setIpChanged(false)
    try {
      const response = await fetch("/api/requests-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: ips ?? '', // ถ้าไม่มีค่า → ส่งว่าง
          domainRequestId: iDsIP ?? ''          // ต้องมี id เพื่อให้ API อัปเดต
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setIpChanged(true)
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);

      }
    } catch (err) {
      console.error("Error submitting IP Address:", err);
      alert("เกิดข้อผิดพลาดในการบันทึก IP Address");

    }
  };
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
      contactP: '',
      contactE: '',
      responsibleContactP: '',
      responsibleContactE: '',
      machineAdminType: '',
      machineAdminName: '',
      machineAdminPosition: '',
      machineAdminContactP: '',
      machineAdminContactE: '',
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

  const trashed = [
    ...trashedDomains
  ]

  const expired = [
    ...expiredDomains
  ]

  const tab = activeTab === 'trashed' ? trashed : activeTab === 'expired' ? expired : activeTab === 'renewals' ? allRenewalRequests : allStatusRequests

  const P = activeTab === "domains" ? pendingRequests : allRenewalRequests
  const A = activeTab === "domains" ? activeDomains : []
  const R = activeTab === "domains" ? rejectedRequests : rejectedRenewalRequests
  const t = activeTab === "domains" ? "" : "การต่ออายุ"

  const handleStatusChange = (status) => {
    setActiveStatus(prevStatus => (prevStatus === status ? '' : status));
  }


  const statusFilter = activeTab === 'domains' && activeStatus === "PENDING" ? pendingRequests
    : activeTab === 'domains' && activeStatus === "REJECTED" ? rejectedRequests
      : activeTab === 'domains' && activeStatus === "ACTIVE" ? activeDomains
        : activeTab === 'domains' ? allStatusRequests
          : activeTab === "expired" ? expired
            : activeTab === "trashed" ? trashed : allRenewalRequests;


  console.log('statusFilter:', statusFilter)
  console.log("selectedDomain :", selectedDomain)
  console.log("Domains :", domains)
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
        {!session ? (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}

              {/* Action Buttons */}
              <NavBar />

              {/* Main Content */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    เกี่ยวกับบริการ
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-base">
                    เว็บไซต์นี้ให้บริการส่งคำร้องขอใช้งานโดเมนเนมภายในวิทยาลัยราชภัฏนครศรีธรรมราช
                    หากต้องการใช้บริการ กรุณาล็อกอินเข้าสู่ระบบ
                    และหากท่านยังไม่มีบัญชีผู้ใช้งาน กรุณาติดต่อสำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏนครศรีธรรมราช

                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    <h5 className="font-semibold text-gray-800">การเข้าใช้งาน</h5>
                  </div>
                  <p className="text-gray-600 text-sm">
                    ต้องล็อกอินด้วยบัญชีผู้ใช้งานที่ถูกต้อง
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-green-600 mr-2" />
                    <h5 className="font-semibold text-gray-800">โดเมนเนม</h5>
                  </div>
                  <p className="text-gray-600 text-sm">
                    ขอใช้โดเมนเนมภายในวิทยาลัย
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-yellow-800 mb-1">
                      สำหรับผู้ที่ยังไม่มีบัญชีผู้ใช้งาน
                    </h5>
                    <p className="text-yellow-700 text-sm">
                      กรุณาติดต่อ: <span className="font-medium">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</span>
                      <br />
                      มหาวิทยาลัยราชภัฏนครศรีธรรมราช
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        ) : (null)}
        {/* Tab Navigator */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-2">
              {/* Navigation Tabs */}
              <nav className="flex space-x-1" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange('domains')}
                  className={`group relative py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'domains'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 transform -translate-y-0.5'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Globe className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'domains' ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                    <span>คำขอใช้โดเมน</span>
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'domains'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                      }`}>
                      {allStatusRequests.length}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange('expired')}
                  className={`group relative py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'expired'
                    ? 'bg-orange-400 text-white shadow-lg shadow-red-200 transform -translate-y-0.5'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'expired' ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                    <span>โดเมนที่เลยวันที่ใช้งาน</span>
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'expired'
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                      }`}>
                      {expiredDomains.length}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange('trashed')}
                  className={`group relative py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'trashed'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 transform -translate-y-0.5'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Trash2 className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'trashed' ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                    <span>โดเมนที่ถูกลบ</span>
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'trashed'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-600 group-hover:bg-red-200'
                      }`}>
                      {trashedDomains.length}
                    </span>
                  </div>
                </button>
              </nav>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-4">
                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={filters.search}
                    placeholder="ค้นหาชื่อโดเมน..."
                    className="w-64 pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />

                </div>

                {/* Add New Domain Button */}
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-0.5 font-medium text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>ขอใช้โดเมนใหม่</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="mx-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PENDING Card */}
            {(activeTab === "domains") && (
              <button
                onClick={() => handleStatusChange('PENDING')}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${activeStatus === 'PENDING'
                  ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50'
                  : 'hover:shadow-lg hover:shadow-yellow-50 bg-white'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full transition-all duration-300 ${activeStatus === 'PENDING'
                        ? 'bg-yellow-100 ring-2 ring-yellow-300'
                        : 'bg-yellow-50 group-hover:bg-yellow-100'
                        }`}>
                        <Clock className={`w-6 h-6 transition-all duration-300 ${activeStatus === 'PENDING'
                          ? 'text-yellow-600 scale-110'
                          : 'text-yellow-500 group-hover:scale-105'
                          }`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium transition-colors ${activeStatus === 'PENDING'
                          ? 'text-yellow-700'
                          : 'text-gray-600 group-hover:text-yellow-600'
                          }`}>
                          รอพิจารณา
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {P.length}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${activeStatus === 'PENDING' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity duration-300`}>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500 ${activeStatus === 'PENDING' ? 'w-full' : 'w-0 group-hover:w-1/3'
                      }`}></div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 transition-opacity duration-300 ${activeStatus === 'PENDING' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}></div>
              </button>
            )}

            {/* ACTIVE Card */}
            {(activeTab === "domains") && (
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${activeStatus === 'ACTIVE'
                  ? 'ring-2 ring-green-400 shadow-lg shadow-green-100 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'hover:shadow-lg hover:shadow-green-50 bg-white'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full transition-all duration-300 ${activeStatus === 'ACTIVE'
                        ? 'bg-green-100 ring-2 ring-green-300'
                        : 'bg-green-50 group-hover:bg-green-100'
                        }`}>
                        <CheckCircle className={`w-6 h-6 transition-all duration-300 ${activeStatus === 'ACTIVE'
                          ? 'text-green-600 scale-110'
                          : 'text-green-500 group-hover:scale-105'
                          }`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium transition-colors ${activeStatus === 'ACTIVE'
                          ? 'text-green-700'
                          : 'text-gray-600 group-hover:text-green-600'
                          }`}>
                          ใช้งานอยู่
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {A.length}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${activeStatus === 'ACTIVE' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity duration-300`}>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500 ${activeStatus === 'ACTIVE' ? 'w-full' : 'w-0 group-hover:w-1/3'
                      }`}></div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5 transition-opacity duration-300 ${activeStatus === 'ACTIVE' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}></div>
              </button>
            )}

            {/* REJECTED Card */}
            {(activeTab === "domains") && (
              <button
                onClick={() => handleStatusChange('REJECTED')}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${activeStatus === 'REJECTED'
                  ? 'ring-2 ring-slate-400 shadow-lg shadow-slate-100 bg-gradient-to-br from-slate-50 to-gray-50'
                  : 'hover:shadow-lg hover:shadow-slate-50 bg-white'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full transition-all duration-300 ${activeStatus === 'REJECTED'
                        ? 'bg-slate-100 ring-2 ring-slate-300'
                        : 'bg-slate-50 group-hover:bg-slate-100'
                        }`}>
                        <XCircle className={`w-6 h-6 transition-all duration-300 ${activeStatus === 'REJECTED'
                          ? 'text-slate-600 scale-110'
                          : 'text-slate-500 group-hover:scale-105'
                          }`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium transition-colors ${activeStatus === 'REJECTED'
                          ? 'text-slate-700'
                          : 'text-gray-600 group-hover:text-slate-600'
                          }`}>
                          ไม่อนุมัติ
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {R.length}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${activeStatus === 'REJECTED' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity duration-300`}>
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-slate-400 to-gray-400 rounded-full transition-all duration-500 ${activeStatus === 'REJECTED' ? 'w-full' : 'w-0 group-hover:w-1/3'
                      }`}></div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r from-slate-400/5 to-gray-400/5 transition-opacity duration-300 ${activeStatus === 'REJECTED' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}></div>
              </button>
            )}
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


          <div className="min-h-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Domain Grid - Changed to horizontal layout */}
              <div className="space-y-4">
                {statusFilter.map((domain, index) => {
                  const statusConfig = getStatusConfig(domain.status);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      className={`
                  relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm
                  cursor-pointer transition-all duration-300
                  hover:shadow-2xl ${statusConfig.glow}
                  ${statusConfig.className}
                  group
                  w-full
                `}
                      onClick={() => {
                        setShowDetailModal(true);
                        setSelectedDomain(domain);
                      }}

                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
                      </div>

                      {/* Content - Horizontal Layout */}
                      <div className="relative p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                          {/* Index */}
                          <div className="flex items-center justify-center md:justify-start">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-white/50 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                #{String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                          </div>

                          {/* Domain Info */}
                          <div className="flex items-center space-x-3 md:col-span-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Domain</p>
                              <p className="text-lg font-bold text-gray-800 truncate">
                                {domain.domainRequest?.domain || domain.domain?.domainRequest?.domain || domain.domain || "-"}
                              </p>
                            </div>
                          </div>

                          {/* IP Address */}
                          <div className="flex items-center space-x-3">
                            <Server className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">IP Address</p>
                              <p className="text-sm font-mono text-gray-700 bg-white/50 px-2 py-1 rounded-md inline-block">
                                {domain.domainRequest?.ipAddress
                                  || domain.domain?.domainRequest?.ipAddress
                                  || domain.ipAddress
                                  || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex justify-center md:justify-end">
                            <div className={`
                        flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold
                        ${statusConfig.badge}
                      `}>
                              {getStatusIcon(domain.status)}
                              <span>{statusConfig.text}</span>
                              {domain.status === "TRASHED" ? (
                                <span>{trashedDay(domain.trashExpiresAt) !== null
                                  ? `จะลบใน ${trashedDay(domain.trashExpiresAt)} วัน`
                                  : '-'}</span>
                              ) : domain.status === "ACTIVE" ? (<span>{activeDay(domain.domainRequest?.expiresAt) !== null
                                ? `เหลืออีก ${activeDay(domain.domainRequest?.expiresAt)} วัน`
                                : '-'}</span>
                              ) : (<span>{expiredDay(domain.domainRequest?.expiresAt) !== null
                                ? `อีก ${expiredDay(domain.domainRequest?.expiresAt)} วันเตรียมโดนลบ`
                                : '-'}</span>)}
                            </div>
                          </div>

                        </div>

                        {/* Hover Effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                      </div>

                      {/* Click Ripple Effect */}
                      <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty State */}
              {statusFilter.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="mx-auto w-24 h-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Globe className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่มีข้อมูลโดเมน</h3>
                  <p className="text-gray-500">ยังไม่มีโดเมนในระบบ กรุณาเพิ่มโดเมนใหม่</p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowRequestModal(true)}
                  >
                    เพิ่มโดเมนใหม่
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </main >
      {/* Request Modal */}
      {
        showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <button
              onClick={handleRequestCancel}
              className=' btn-close transition-colors absolute  top-9 left-105  transform -translate-x-1/2 -translate-y-1/2  rounded-4xl '>
              <div >
                <CircleX
                  className='w-10 h-10 ' />
              </div>
            </button>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ขอใช้โดเมนใหม่
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
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
                    <label className="block text-sm font-medium text-black mb-2">
                      IP Address (ถ้าหากมี)
                    </label>
                    <input
                      type="text"
                      value={requestData.ipAddress}
                      onChange={(e) => handleRequestDataChange('ipAddress', e.target.value.replace(/[^\d.]/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      ประเภทเครื่อง *
                    </label>
                    <select
                      value={requestData.machineType}
                      onChange={(e) => handleRequestDataChange('machineType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" >--เลือก--</option>
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
                    <label className="block text-sm font-medium text-black mb-2">
                      ระบบปฏิบัติการ *
                    </label>
                    <select
                      value={requestData.OS}
                      onChange={(e) => handleRequestDataChange('OS', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" >--เลือก--</option>
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
                  <label className="block text-sm font-medium text-black mb-2">
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
                    <label className="block text-sm font-medium text-black mb-2">
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
                    <label className="block text-sm font-medium text-black mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    ตำแหน่งงานผู้ขอโดเมน  *
                  </label>
                  <input
                    type="text"
                    value={requestData.position}
                    onChange={(e) => handleRequestDataChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="หัวหน้าสาขา"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
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
                  <label className="block text-sm font-medium text-black mb-2">
                    คณะ/สำนัก/สถาบัน/กอง *
                  </label>
                  <input
                    type="text"
                    value={requestData.institution}
                    onChange={(e) => handleRequestDataChange('institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="คณะวิทยาศาสตร์และเทคโนโลยี"
                  />
                </div>
                <hr></hr>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <strong>ข้อมูลติดต่อ ผู้ขอโดเมน*</strong>
                    </label>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ ผู้ขอโดเมน
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"      // keyboard บนมือถือเป็นตัวเลข
                      pattern="[0-9]*"         // regex กรองเฉพาะตัวเลข
                      value={requestData.contactP}
                      onChange={(e) => {
                        handleRequestDataChange("contactP", e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=" 081-234-5678"
                    />
                    <br></br>
                    <br></br>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail ผู้ขอโดเมน
                      </label>
                      <input
                        type="text"
                        value={requestData.contactE}
                        onChange={(e) => {
                          handleRequestDataChange("contactE", e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <strong>ข้อมูลติดต่อ ผู้รับผิดชอบโดเมน *</strong>
                    </label>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ ผู้รับผิดชอบโดเมน
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"      // keyboard บนมือถือเป็นตัวเลข
                      pattern="[0-9]*"         // regex กรองเฉพาะตัวเลข
                      value={requestData.responsibleContactP}
                      onChange={(e) => {
                        handleRequestDataChange("responsibleContactP", e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="081-234-5678"
                    />
                    <br></br>
                    <br></br>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail ผู้รับผิดชอบโดเมน
                      </label>
                      <input
                        type="text"
                        value={requestData.responsibleContactE}
                        onChange={(e) => {
                          handleRequestDataChange("responsibleContactE", e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </div>
                <br></br>
                <br></br>
                <hr></hr>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    ที่ตั้งเครื่อง *
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ห้อง
                  </label>
                  <input
                    type="text"
                    value={requestData.machineRoom}
                    onChange={(e) => handleRequestDataChange('machineRoom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1930"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อาคาร
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
                  <label className="block text-sm font-medium text-black mb-2">
                    ผู้ดูแลเครื่อง *
                  </label>
                  <select
                    value={requestData.machineAdminType}
                    onChange={(e) => handleRequestDataChange('machineAdminType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" >--เลือก--</option>
                    <option value="requester">บุคคลเดียวกับผู้ขอจดทะเบียน</option>
                    <option value="MachineAdmin">มีผู้ดูแลเครื่องโดยเฉพาะคือ</option>
                  </select>
                </div>

                {requestData.machineAdminType === 'MachineAdmin' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ ผู้ดูแลเครื่อง
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminName}
                      onChange={(e) => handleRequestDataChange('machineAdminName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายสมศักดิ์ รักษา"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ตำแหน่ง ผู้ดูแลเครื่อง
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminPosition}
                      onChange={(e) => handleRequestDataChange('machineAdminPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นักวิชาการคอมพิวเตอร์"
                    />
                    <hr></hr>
                    <label className="block text-sm font-medium text-black mb-2">
                      <strong>ช่องทางการติดต่อ ผู้ดูแลเครื่อง *</strong>
                    </label>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ ผู้ดูแลเครื่อง
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminContactP}
                      onChange={(e) => {
                        handleRequestDataChange('machineAdminContactP', e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="081-234-5678"
                    />
                    <br></br>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail ผู้ดูแลเครื่อง
                    </label>
                    <input
                      type="text"
                      value={requestData.machineAdminContactE}
                      onChange={(e) => {
                        handleRequestDataChange('machineAdminContactE', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com "
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
                      ขอใช้โดเมนถึงวันที่
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

                  <div className='hidden'>
                    <label className="block text-sm font-medium text-gray-700 mb-2  ">
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
                    เหตุผลในการต่อเวลาใช้งาน
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
                  onClick={
                    handleRenewalSubmit
                  }
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
          const valueIP = requestData.ipAddress || domainData?.ipAddress || ''
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  if (ipChanged) window.location.reload();
                }
                }
                className=' btn-close transition-colors absolute  top-9 left-93  transform -translate-x-1/2 -translate-y-1/2  rounded-4xl '>
                <div >
                  <CircleX
                    className='w-10 h-10 ' />
                </div>
              </button>
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
                    <div>
                      <strong>IP Address:</strong>
                      {session?.user.role === "ADMIN" && isEditing ? (
                        <input
                          type="text"
                          className="text-blue-500 border rounded px-2 py-1"
                          value={valueIP}
                          onChange={(e) => {
                            handleRequestDataChange('ipAddress', e.target.value.replace(/[^\d.]/g, ''));
                            setIDsIP(domainData.id);
                            setIps(e.target.value);
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
                          onBlur={handleBlur} // เมื่อออกจาก input ให้บันทึกค่า
                          autoFocus
                        />

                      ) : (
                        <span
                          className={`mx-1 text-gray-700 border border-gray-300 rounded-lg cursor-pointer min-w-[120px] px-3 py-2 inline-block 
             hover:bg-gray-100 hover:shadow-sm transition-all duration-200 ease-in-out`}
                          onClick={() => setIsEditing(true)}
                        >
                          {valueIP || "Click to add IP"}
                        </span>
                      )}
                    </div>


                    <div><strong>ประเภทเครื่อง:</strong> <span className="text-blue-500">{domainData?.machineType || '-'}</span></div>
                    <div><strong>ระบบปฏิบัติการ:</strong> <span className="text-blue-500">{domainData?.OS || '-'}</span></div>
                  </div>

                  <hr className="my-4" />

                  {/* ข้อมูลผู้ขอและผู้รับผิดชอบ */}
                  <h2 className='flex items-center gap-2'><UserRound /><strong> ข้อมูลผู้ขอและผู้รับผิดชอบ</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>ชื่อผู้ขอ:</strong> <span className="text-blue-500">{domainData?.requesterName || '-'}</span></div>
                    <div><strong>ชื่อผู้รับผิดชอบ:</strong> <span className="text-blue-500">{domainData?.responsibleName || '-'}</span></div>
                    <div><strong>เบอร์โทรศัพท์ ผู้ขอ:</strong> <span className="text-blue-500">{domainData?.contactP || '-'}</span></div>
                    <div><strong>เบอร์โทรศัพท์ ผู้รับผิดชอบ:</strong> <span className="text-blue-500">{domainData?.responsibleContactP || '-'}</span></div>
                    <div><strong>E-mail ผู้ขอ:</strong> <span className="text-blue-500">{domainData?.contactE || '-'}</span></div>
                    <div><strong>E-mail ผู้รับผิดชอบ:</strong> <span className="text-blue-500">{domainData?.responsibleContactE || '-'}</span></div>
                    <div><strong>ตำแหน่งงานผู้ขอโดเมน </strong> <span className="text-blue-500">{domainData?.position || '-'}</span> </div>
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
                      <div><strong>เบอร์โทรศัพท์:</strong> <span className="text-blue-500">{domainData?.machineAdminContactP || '-'}</span></div>
                      <div><strong>E-mail:</strong> <span className="text-blue-500">{domainData?.machineAdminContactE || '-'}</span></div>
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
                    <div><strong>ใช้ถึงวันที่:</strong> {domainData?.expiresAt ? new Date(domainData.expiresAt).toLocaleDateString() : '-'}</div>
                    {selectedDomain.status === "TRASHED" && (<div><strong>ลงถังขยะวันที่:</strong> {selectedDomain.deletedAt ? new Date(selectedDomain.deletedAt).toLocaleDateString() : '-'}</div>)}
                    <div><strong>สถานะ:</strong> {selectedDomain.status === "ACTIVE"
                      ? <span className="text-green-500">ใช้งานอยู่</span>
                      : selectedDomain.status === "PENDING" ? <span className="text-yellow-500">กำลังรอการอนุมัติ</span>
                        : selectedDomain.status === "REJECTED" ? <span className="text-gray-500">ไม่อนุมัติ</span>
                          : selectedDomain.status === "EXPIRED" ? <span className="text-blue-500">หมดเวลาใช้งาน</span>
                            : <span className="text-red-500">อยู่ในถังขยะ</span> || '-'}</div>
                    <div><strong>บัญชี :</strong> {domainData?.username || domainData?.user?.username || '-'}</div>
                  </div>
                </div >

                <br></br>
                <div>
                  <div>
                    <button
                      onClick={() => {
                        if (showPreview) {
                          // ถ้ากำลังโชว์ → ปิด
                          setShowPreview(false);
                        }
                        else {
                          // ถ้ายังไม่โชว์ → เปิดและโหลด preview
                          setShowPreview(true);
                          handlePreview(selectedDomain.id);
                        }
                      }}
                      className="px-4 py-2 btn-cool-gray rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Printer /> {/* icon */}
                    </button>

                    {showPreview && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">

                          <h1 className="text-xl font-semibold text-gray-900 mb-4">
                            <strong>รายการโดเมน Preview</strong>
                          </h1>

                          {/* PDF Preview */}
                          {pdfUrl && (
                            <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
                              <h3>Preview Word</h3>
                              <iframe
                                src={pdfUrl}
                                width="100%"
                                height="400px"
                                frameBorder="0"
                                title="Word Preview PDF"
                              />
                            </div>

                          )}
                          {/* ปุ่ม */}
                          <div className="flex space-x-3 mt-6">
                            <button
                              onClick={() => setShowPreview(false)}
                              className="px-4 py-2 btn-cool-gray rounded-lg transition-colors"
                            >
                              ยกเลิก
                            </button>
                            <button
                              className="px-4 py-2 btn-indigo rounded-lg transition-colors flex items-center gap-2"
                              onClick={() => handleGenerateWord(selectedDomain.id)}
                            >
                              ดาวน์โหลด Word
                            </button>
                          </div>
                        </div>
                      </div>

                    )}
                  </div>
                  {session?.user?.role === 'ADMIN' && selectedDomain.status === "PENDING" && (
                    <div className="flex justify-start space-x-3 mt-6">
                      <button
                        onClick={() => {
                          handleApproveRequest(domainData?.id, 'approve')

                        }}
                        className="px-4 py-2 btn-emerald rounded-lg transition-colors"
                      >
                        อนุมัติคำขอ
                      </button>
                      <button
                        onClick={() => {
                          handleApproveRequest(domainData?.id, 'reject')

                        }}
                        className="px-4 py-2 btn-rose rounded-lg transition-colors"
                      >
                        ไม่อนุมัติคำขอ
                      </button>
                    </div>
                  )}
                  <div className='flex'>
                    <div className='mx-2'>
                      {session?.user?.role === 'ADMIN' &&
                        selectedDomain &&
                        (selectedDomain.status === "EXPIRED" || selectedDomain.status === "TRASHED") && (
                          <div className="space-x-3 mt-6">
                            <button
                              onClick={() => {
                                handleRestoreDomain(domainData.id);
                              }}
                              className="px-4 py-2 btn-indigo rounded-lg transition-colors"
                            >
                              <RefreshCw />
                            </button>
                          </div>
                        )}
                    </div>


                    <div className=''>
                      {session?.user?.role === 'ADMIN' && selectedDomain && selectedDomain.status !== "PENDING" && (
                        <div className="space-x-3 mt-6">
                          <button
                            onClick={() => handleDeleteDomain(
                              domainData?.id || selectedDomain?.id,           // domainId
                              domainData?.domain || selectedDomain?.domain,   // domainName
                              ['TRASHED', 'EXPIRED'].includes(domainData?.status || selectedDomain?.status) // true = ลบถาวร
                            )}
                            className="px-4 py-2 btn-rose rounded-lg transition-colors"
                            title={['TRASHED', 'EXPIRED'].includes(selectedDomain?.status) ? 'ลบถาวร' : 'ย้ายไปถังขยะ'}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      )}
                    </div>


                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        if (ipChanged) window.location.reload();
                      }
                      }

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
      {/* Restore Modal */}
      {session?.user?.role === "ADMIN" && showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative">
            {/* ปุ่มปิด */}
            <button
              onClick={handleRestoreCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <CircleX className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">กู้คืนโดเมน</h3>
            <p className="text-sm text-gray-600 mb-2">
              โดเมน:{" "}
              <span className="font-medium">
                {selectedDomain?.domainRequest?.domain || "ไม่ระบุโดเมน"}
              </span>
            </p>
            {/* useEffect สำหรับเซ็ตค่าเริ่มต้น */}
            {/* ควรใส่ useEffect ด้านบน component */}

            {/* ฟอร์มหลัก */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ยืนยันข้อมูลโดเมน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ชื่อโดเมน */}
                <div>

                  <label className="block text-sm font-medium text-black mb-2">ชื่อโดเมน *</label>
                  <input
                    type="text"
                    value={requestData.domain}
                    onChange={(e) => handleRequestDataChange('domain', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example.nstru.ac.th"
                  />
                </div>

                {/* IP Address */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">IP Address</label>
                  <input
                    type="text"
                    value={requestData.ipAddress}
                    onChange={(e) => handleRequestDataChange('ipAddress', e.target.value.replace(/[^\d.]/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="192.168.1.1"
                  />
                </div>

                {/* ประเภทเครื่อง */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">ประเภทเครื่อง *</label>
                  <select
                    value={requestData.machineType}
                    onChange={(e) => handleRequestDataChange('machineType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">--เลือก--</option>
                    <option>PC/Mac</option>
                    <option>Unix Workstation</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                  {requestData.machineType === 'other' && (
                    <input
                      type="text"
                      value={requestData.otherMachineType}
                      onChange={(e) => handleRequestDataChange('otherMachineType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* ระบบปฏิบัติการ */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">ระบบปฏิบัติการ *</label>
                  <select
                    value={requestData.OS}
                    onChange={(e) => handleRequestDataChange('OS', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">--เลือก--</option>
                    <option>Linux</option>
                    <option>Unix</option>
                    <option>MS Windows</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                  {requestData.OS === 'other' && (
                    <input
                      type="text"
                      value={requestData.otherOS}
                      onChange={(e) => handleRequestDataChange('otherOS', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* วัตถุประสงค์และการใช้งาน */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">วัตถุประสงค์ *</label>
                <select
                  value={requestData.property}
                  onChange={(e) => handleRequestDataChange('property', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">--เลือก--</option>
                  <option value="InNSTRU">ใช้งานเฉพาะเครือข่ายภายในมหาวิทยาลัยราชภัฏนครศรีธรรมราช (Intranet)</option>
                  <option value="InOutNSTRU">ใช้งานทั้งภายในและภายนอกมหาวิทยาลัย</option>
                </select>

                <label className="block text-sm font-medium text-black mb-2 mt-2">การใช้งาน *</label>
                <select
                  value={requestData.useType}
                  onChange={(e) => handleRequestDataChange('useType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">--เลือก--</option>
                  <option value="NoSever">ใช้ทั่วไปโดยไม่ได้เป็นเซอร์ฟเวอร์</option>
                  <option value="Sever">ใช้เป็นเซอร์ฟเวอร์ให้บริการ</option>
                </select>
                {requestData.useType === 'Sever' && (
                  <textarea
                    value={requestData.purpose}
                    onChange={(e) => handleRequestDataChange('purpose', e.target.value)}
                    rows={3}
                    placeholder="ระบุวัตถุประสงค์ในการใช้เป็นเซอร์ฟเวอร์ให้บริการ"
                    className="w-full px-3 py-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* ข้อมูลผู้ขอและผู้รับผิดชอบ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">ชื่อผู้ขอโดเมน *</label>
                  <input
                    type="text"
                    value={requestData.requesterName}
                    onChange={(e) => handleRequestDataChange('requesterName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">ชื่อผู้รับผิดชอบโดเมน *</label>
                  <input
                    type="text"
                    value={requestData.responsibleName}
                    onChange={(e) => handleRequestDataChange('responsibleName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ตำแหน่ง แผนก คณะ */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">ตำแหน่งงานผู้ขอโดเมน *</label>
                <input
                  type="text"
                  value={requestData.position}
                  onChange={(e) => handleRequestDataChange('position', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">ภาควิชา/ฝ่าย/แผนก *</label>
                <input
                  type="text"
                  value={requestData.department}
                  onChange={(e) => handleRequestDataChange('department', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">คณะ/สำนัก/สถาบัน/กอง *</label>
                <input
                  type="text"
                  value={requestData.institution}
                  onChange={(e) => handleRequestDataChange('institution', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ข้อมูลติดต่อ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">เบอร์โทรศัพท์ ผู้ขอโดเมน *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={requestData.contactP}
                    onChange={(e) => handleRequestDataChange('contactP', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-black mt-2 mb-2">E-mail ผู้ขอโดเมน</label>
                  <input
                    type="email"
                    value={requestData.contactE}
                    onChange={(e) => handleRequestDataChange('contactE', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">เบอร์โทรศัพท์ ผู้รับผิดชอบโดเมน *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={requestData.responsibleContactP}
                    onChange={(e) => handleRequestDataChange('responsibleContactP', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-black mt-2 mb-2">E-mail ผู้รับผิดชอบโดเมน</label>
                  <input
                    type="email"
                    value={requestData.responsibleContactE}
                    onChange={(e) => handleRequestDataChange('responsibleContactE', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ที่ตั้งเครื่อง */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">ห้อง *</label>
                <input
                  type="text"
                  value={requestData.machineRoom}
                  onChange={(e) => handleRequestDataChange('machineRoom', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-black mt-2 mb-2">อาคาร *</label>
                <input
                  type="text"
                  value={requestData.machinePlace}
                  onChange={(e) => handleRequestDataChange('machinePlace', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ผู้ดูแลเครื่อง */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">ผู้ดูแลเครื่อง *</label>
                <select
                  value={requestData.machineAdminType}
                  onChange={(e) => handleRequestDataChange('machineAdminType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">--เลือก--</option>
                  <option value="requester">บุคคลเดียวกับผู้ขอจดทะเบียน</option>
                  <option value="MachineAdmin">มีผู้ดูแลเครื่องโดยเฉพาะ</option>
                </select>
              </div>

              {requestData.machineAdminType === 'MachineAdmin' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">ชื่อผู้ดูแลเครื่อง</label>
                  <input
                    type="text"
                    value={requestData.machineAdminName}
                    onChange={(e) => handleRequestDataChange('machineAdminName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-black mb-2">ตำแหน่งผู้ดูแลเครื่อง</label>
                  <input
                    type="text"
                    value={requestData.machineAdminPosition}
                    onChange={(e) => handleRequestDataChange('machineAdminPosition', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-black mb-2">เบอร์โทรศัพท์ผู้ดูแลเครื่อง</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={requestData.machineAdminContactP}
                    onChange={(e) => handleRequestDataChange('machineAdminContactP', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-black mb-2">E-mail ผู้ดูแลเครื่อง</label>
                  <input
                    type="email"
                    value={requestData.machineAdminContactE}
                    onChange={(e) => handleRequestDataChange('machineAdminContactE', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* ประเภทการใช้งาน */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-black mb-2">ประเภทการใช้งาน *</label>
                <select
                  value={requestData.durationType}
                  onChange={(e) => handleRequestDataChange('durationType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERMANENT">ถาวร</option>
                  <option value="TEMPORARY">ชั่วคราว</option>
                </select>
                {requestData.durationType === 'TEMPORARY' && (
                  <input
                    type="date"
                    value={requestData.expiresAt}
                    onChange={(e) => handleRequestDataChange('expiresAt', e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                )}
              </div>
              <button
                onClick={handleRequestSubmit}
                className={`px-4 py-2 btn-emerald rounded-lg`}
              >
                กู้คืน
              </button>
              <div>

              </div>
              {/* Policy */}
              <div className="mt-4">
                <label className="text-red-500">
                  <input type="checkbox" checked={policy} onChange={handlePolicyChange} className="mr-2 scale-125" />
                  **ข้าพเจ้าจะปฏิบัติตามระเบียบ พ.ร.บ. ว่าด้วยการกระทำผิดทางคอมพิวเตอร์ พ.ศ.2550 และเงื่อนไขการใช้บริการ
                </label>
              </div>

              {/* ปุ่ม Action */}
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={handleRestoreCancel} className="px-4 py-2 btn-cool-gray rounded-lg">ยกเลิก</button>
                <button
                  onClick={policy ? handleRestoreSubmit : () => alert("กรุณายอมรับนโยบายก่อนส่งคำขอ")}
                  className={`px-4 py-2 btn-emerald rounded-lg`}
                >
                  กู้คืน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}