'use client'
import { useState, useEffect } from 'react';

export default function RequestsTab({ adminRole }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, answered, expired
  const [typeFilter, setTypeFilter] = useState('all'); // all, general, deceased, sick
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRequests();
  }, [currentPage, statusFilter, typeFilter]);

  const loadRequests = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    fetch(`/api/admin/requests?page=${currentPage}&limit=20&status=${statusFilter}&type=${typeFilter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequests(data.requests);
          setTotalPages(data.pagination.totalPages);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Requests load error:', err);
        setLoading(false);
      });
  };

  const handleDeleteRequest = (requestId) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا الطلب؟')) {
      return;
    }

    const token = localStorage.getItem('token');
    
    fetch('/api/admin/requests', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حذف الطلب بنجاح');
          loadRequests();
        } else {
          alert('❌ ' + (data.error || 'فشل الحذف'));
        }
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ حدث خطأ أثناء الحذف');
      });
  };

  const getTypeLabel = (type) => {
    const types = {
      general: { label: 'دعاء عام', icon: '🤲', color: 'emerald' },
      deceased: { label: 'للمتوفى', icon: '🕊️', color: 'stone' },
      sick: { label: 'للمريض', icon: '🏥', color: 'blue' }
    };
    return types[type] || types.general;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { label: 'نشط', color: 'green', icon: '🟢' },
      answered: { label: 'مستجاب', color: 'amber', icon: '✨' },
      expired: { label: 'منتهي', color: 'stone', icon: '⏰' }
    };
    
    const badge = statuses[status] || statuses.active;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-${badge.color}-100 text-${badge.color}-700 border border-${badge.color}-300`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">🙏</div>
        <p className="text-stone-600">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          🙏 إدارة طلبات الدعاء
        </h2>
        <div className="text-sm text-stone-600 bg-stone-100 px-4 py-2 rounded-lg">
          إجمالي: <span className="font-bold text-purple-600">{requests.length > 0 ? requests[0]?.totalCount || requests.length : 0}</span> طلب
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">📊 الحالة:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل', icon: '📋' },
                { value: 'active', label: 'نشط', icon: '🟢' },
                { value: 'answered', label: 'مستجاب', icon: '✨' },
                { value: 'expired', label: 'منتهي', icon: '⏰' }
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    statusFilter === status.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{status.icon}</span>
                  <span>{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">🎯 النوع:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل', icon: '📋' },
                { value: 'general', label: 'دعاء عام', icon: '🤲' },
                { value: 'deceased', label: 'للمتوفى', icon: '🕊️' },
                { value: 'sick', label: 'للمريض', icon: '🏥' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    setTypeFilter(type.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    typeFilter === type.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-stone-600 text-lg">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          requests.map((request) => {
            const typeInfo = getTypeLabel(request.type);
            
            return (
              <div key={request.id} className="bg-white border border-stone-200 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{typeInfo.icon}</span>
                        <div>
                          <h3 className="font-bold text-stone-800 text-lg">
                            {request.type === 'deceased' && request.deceasedName}
                            {request.type === 'sick' && (request.isNamePrivate ? 'مريض (اسم خاص)' : request.sickPersonName)}
                            {request.type === 'general' && request.requesterName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                              {typeInfo.label}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-stone-600">
                          <span className="font-semibold">👤 الطالب:</span>
                          <span>{request.requesterName}</span>
                        </div>
                        
                        {request.type === 'deceased' && (
                          <>
                            {request.deceasedMotherName && (
                              <div className="flex items-center gap-2 text-stone-600">
                                <span className="font-semibold">👩 اسم الأم:</span>
                                <span>{request.deceasedMotherName}</span>
                              </div>
                            )}
                            {request.relation && (
                              <div className="flex items-center gap-2 text-stone-600">
                                <span className="font-semibold">🔗 الصلة:</span>
                                <span>{request.relation}</span>
                              </div>
                            )}
                          </>
                        )}

                        {request.type === 'sick' && !request.isNamePrivate && request.sickPersonMotherName && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <span className="font-semibold">👩 اسم الأم:</span>
                            <span>{request.sickPersonMotherName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-stone-600">
                          <span className="font-semibold">⏰ التاريخ:</span>
                          <span>{new Date(request.createdAt).toLocaleString('ar-EG')}</span>
                        </div>

                        {request.expiresAt && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <span className="font-semibold">⏳ ينتهي:</span>
                            <span>{new Date(request.expiresAt).toLocaleString('ar-EG')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex flex-col items-end gap-4">
                      {/* Prayer Count */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-lg p-4 text-center min-w-[120px]">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          {request.totalPrayers}
                        </div>
                        <div className="text-xs text-stone-600 font-semibold">
                          دعا له
                        </div>
                      </div>

                      {/* Actions */}
                      {adminRole === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          🗑️ حذف الطلب
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors font-semibold"
          >
            ← السابق
          </button>
          <span className="text-sm text-stone-600 font-semibold">
            صفحة <span className="text-purple-600 text-lg">{currentPage}</span> من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors font-semibold"
          >
            التالي →
          </button>
        </div>
      )}
    </div>
  );
}