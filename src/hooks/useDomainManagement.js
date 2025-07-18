import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useDomainManagement = () => {
    const { data: session } = useSession();
    const [domains, setDomains] = useState([]);
    const [requests, setRequests] = useState([]);
    const [renewalRequests, setRenewalRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // ฟังก์ชันดึงข้อมูลทั้งหมด
    const fetchAllData = async () => {
        if (!session) return;
        setLoading(true);
        try {
            await Promise.all([fetchDomains(), fetchMyRequests(), fetchMyRenewalRequests()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDomains = async () => {
        const response = await fetch('/api/domains');
        if (response.ok) {
            setDomains(await response.json());
        } else {
            console.error('API Error:', response.status);
        }
    };

    const fetchMyRequests = async () => {
        const response = await fetch('/api/my-requests');
        if (response.ok) {
            setRequests(await response.json());
        }
    };

    const fetchMyRenewalRequests = async () => {
        const response = await fetch('/api/renewal-requests?my=true');
        if (response.ok) {
            setRenewalRequests(await response.json());
        }
    };

    // ฟังก์ชันจัดการคำขอ (Delete, Approve)
    const handleDeleteRequest = async (requestId) => {
        if (!confirm('คุณต้องการลบคำขอนี้ใช่หรือไม่?')) return;
        try {
            const response = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('ดำเนินการสำเร็จ');
                fetchMyRequests();
            } else {
                const error = await response.json();
                alert(error.error || 'เกิดข้อผิดพลาดในการลบคำขอ');
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('เกิดข้อผิดพลาดในการลบคำขอ');
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [session]);

    return {
        domains,
        requests,
        renewalRequests,
        loading,
        fetchDomains,
        fetchMyRequests,
        fetchMyRenewalRequests,
        handleDeleteRequest,
    };
};