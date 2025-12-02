import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search,
  Eye,
  Check,
  X,
  Trash2,
  Edit,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  Loader,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
// 📚 لوحة إدارة المكتبة - AdminLibraryPanel الاحترافية
// ════════════════════════════════════════════════════════════

export default function AdminLibraryPanel() {
  const [activeTab, setActiveTab] = useState('requests'); // requests | books
  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(null);

  // ════════════════════════════════════════════════════════════
  // 🔄 جلب البيانات عند التحميل
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'books') {
      fetchBooks();
    }
  }, [activeTab]);

  // ════════════════════════════════════════════════════════════
  // 📥 جلب طلبات النشر
  // ════════════════════════════════════════════════════════════
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/library/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 📚 جلب الكتب المنشورة
  // ════════════════════════════════════════════════════════════
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/library?active=all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // ✅ الموافقة على طلب
  // ════════════════════════════════════════════════════════════
  const handleApprove = async (requestId) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/library/requests`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: requestId,
          status: 'approved',
          admin_notes: adminNotes 
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم الموافقة على الطلب ونشر الكتاب بنجاح!');
        fetchRequests();
        fetchBooks();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ حدث خطأ في الاتصال');
    }
  };

  // ════════════════════════════════════════════════════════════
  // ❌ رفض طلب
  // ════════════════════════════════════════════════════════════
  const handleReject = async (requestId) => {
    const reason = prompt('الرجاء إدخال سبب الرفض:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/library/requests`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: requestId,
          status: 'rejected',
          admin_notes: reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم رفض الطلب');
        fetchRequests();
        setSelectedRequest(null);
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ حدث خطأ في الاتصال');
    }
  };

  // ════════════════════════════════════════════════════════════
  // 📚 نشر كتاب من طلب معتمد
  // ════════════════════════════════════════════════════════════
  const handlePublishFromRequest = async (request) => {
    setShowPublishModal(request);
  };

  const confirmPublish = async (bookFileUrl) => {
    if (!bookFileUrl.trim()) {
      alert('الرجاء إدخال رابط الكتاب');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/library/requests/${showPublishModal.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ book_file_url: bookFileUrl })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم نشر الكتاب بنجاح!');
        setShowPublishModal(null);
        fetchRequests();
        fetchBooks();
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('❌ حدث خطأ في الاتصال');
    }
  };

  // ════════════════════════════════════════════════════════════
  // 🗑️ حذف كتاب
  // ════════════════════════════════════════════════════════════
  const handleDeleteBook = async (bookId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/library?id=${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم حذف الكتاب بنجاح');
        fetchBooks();
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('❌ حدث خطأ في الاتصال');
    }
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 عرض حالة الطلب
  // ════════════════════════════════════════════════════════════
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      published: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    const labels = {
      pending: '⏳ قيد المراجعة',
      approved: '✅ تمت الموافقة',
      rejected: '❌ مرفوض',
      published: '📚 منشور'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 واجهة طلبات النشر
  // ════════════════════════════════════════════════════════════
  const renderRequests = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">لا توجد طلبات حالياً</p>
        </div>
      );
    }

    // تصنيف الطلبات
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const approvedRequests = requests.filter(r => r.status === 'approved');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');

    return (
      <div className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="text-yellow-800 text-sm font-bold mb-1">قيد المراجعة</div>
            <div className="text-3xl font-bold text-yellow-900">{pendingRequests.length}</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="text-green-800 text-sm font-bold mb-1">معتمدة</div>
            <div className="text-3xl font-bold text-green-900">{approvedRequests.length}</div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="text-red-800 text-sm font-bold mb-1">مرفوضة</div>
            <div className="text-3xl font-bold text-red-900">{rejectedRequests.length}</div>
          </div>
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-4">
          {requests.map(request => (
            <div
              key={request.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    📖 {request.book_title}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ✍️ {request.book_author}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📂 {request.book_category} • 🌐 {request.book_language === 'ar' ? 'العربية' : request.book_language}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              {/* معلومات المقدم */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-blue-900 mb-2">👤 معلومات المقدم:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{request.requester_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a href={`tel:${request.requester_phone}`} className="text-blue-700 hover:underline font-medium">
                      {request.requester_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <a href={`mailto:${request.requester_email}`} className="text-blue-700 hover:underline font-medium">
                      {request.requester_email}
                    </a>
                  </div>
                </div>
                {request.is_author && (
                  <div className="mt-2 bg-amber-100 border border-amber-300 rounded px-3 py-1 inline-block">
                    <span className="text-amber-900 text-sm font-bold">✍️ المؤلف نفسه</span>
                  </div>
                )}
              </div>

              {/* الوصف */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">📝 الوصف:</p>
                <p className="text-gray-800 leading-relaxed">{request.book_description}</p>
              </div>

              {/* سبب النشر (إن وجد) */}
              {request.reason_for_publishing && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-bold text-purple-900 mb-2">💡 سبب النشر:</p>
                  <p className="text-purple-800">{request.reason_for_publishing}</p>
                </div>
              )}

              {/* التاريخ */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                <span>تاريخ الطلب: {new Date(request.created_at).toLocaleString('ar')}</span>
              </div>

              {/* الأزرار حسب الحالة */}
              <div className="flex flex-wrap gap-3">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      موافقة
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 min-w-[150px] bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      رفض
                    </button>
                  </>
                )}
                
                {request.status === 'approved' && (
                  <button
                    onClick={() => handlePublishFromRequest(request)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    نشر الكتاب الآن
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 واجهة الكتب المنشورة
  // ════════════════════════════════════════════════════════════
  const renderBooks = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">لا توجد كتب منشورة حالياً</p>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة كتاب يدوياً
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* زر إضافة */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-700">
            <span className="font-bold text-2xl">{books.length}</span> كتاب منشور
          </div>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة كتاب يدوياً
          </button>
        </div>

        {/* قائمة الكتب */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div
              key={book.id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Cover Placeholder */}
              <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-green-600" />
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">✍️ {book.author}</p>
                <p className="text-gray-500 text-xs mb-3">📂 {book.category}</p>
                
                <div className="flex gap-2">
                  {book.file_url && (
                    <a
                      href={book.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      فتح
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 الواجهة الرئيسية
  // ════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          إدارة المكتبة
        </h2>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 mb-6 overflow-hidden shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-4 font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📝 طلبات النشر
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="mr-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-4 font-bold transition-all ${
              activeTab === 'books'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📚 الكتب المنشورة
            {books.length > 0 && (
              <span className="mr-2 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                {books.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'books' && renderBooks()}
      </div>

      {/* Modal تفاصيل الطلب */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">{selectedRequest.book_title}</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-1">المؤلف:</p>
                <p className="text-gray-900 text-lg">{selectedRequest.book_author}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-gray-700 mb-1">الوصف:</p>
                <p className="text-gray-900 leading-relaxed">{selectedRequest.book_description}</p>
              </div>

              {selectedRequest.reason_for_publishing && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">سبب النشر:</p>
                  <p className="text-gray-900">{selectedRequest.reason_for_publishing}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-bold text-blue-900 mb-2">معلومات الاتصال:</p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>الاسم:</strong> {selectedRequest.requester_name}</p>
                  <p className="text-sm"><strong>الهاتف:</strong> {selectedRequest.requester_phone}</p>
                  <p className="text-sm"><strong>البريد:</strong> {selectedRequest.requester_email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  ملاحظات الأدمن (اختياري):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none resize-none"
                  placeholder="أضف ملاحظات إذا لزم الأمر..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  ✅ موافقة
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  ❌ رفض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal نشر الكتاب */}
      {showPublishModal && (
        <PublishBookModal
          request={showPublishModal}
          onClose={() => setShowPublishModal(null)}
          onConfirm={confirmPublish}
        />
      )}

      {/* Modal إضافة كتاب يدوياً */}
      {showAddBookModal && (
        <AddBookModal
          onClose={() => setShowAddBookModal(false)}
          onSuccess={() => {
            setShowAddBookModal(false);
            fetchBooks();
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 📚 Modal نشر الكتاب
// ════════════════════════════════════════════════════════════
function PublishBookModal({ request, onClose, onConfirm }) {
  const [bookFileUrl, setBookFileUrl] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">📚 نشر الكتاب</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="font-bold text-green-900 mb-1">{request.book_title}</p>
          <p className="text-green-800 text-sm">✍️ {request.book_author}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            رابط الكتاب (Google Drive / Dropbox):
          </label>
          <input
            type="url"
            value={bookFileUrl}
            onChange={(e) => setBookFileUrl(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
            placeholder="https://drive.google.com/..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirm(bookFileUrl)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            نشر الآن
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ➕ Modal إضافة كتاب يدوياً - النسخة الاحترافية
// ════════════════════════════════════════════════════════════
function AddBookModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'دينية - عامة',
    language: 'ar',
    file_url: '',
    cover_url: '',
    pages: '',
    size_mb: ''
  });

  const categories = [
    'دينية - عامة',
    'دينية - قرآن وتفسير',
    'دينية - حديث',
    'دينية - فقه',
    'دينية - عقيدة',
    'دينية - سيرة',
    'دينية - أدعية وأذكار',
    'تربوية',
    'ثقافية',
    'علمية',
    'أدبية',
    'تاريخية',
    'أخرى'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // إذا كان هناك ملف صورة، نرفعه أولاً
      let coverUrl = formData.cover_url || null;
      
      if (formData.coverFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('cover', formData.coverFile);
        
        const uploadResponse = await fetch('/api/upload/book-cover', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });
        
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          coverUrl = uploadData.url;
        }
      }
      
      // إضافة الكتاب
      const response = await fetch('/api/admin/library', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          category: formData.category,
          language: formData.language,
          file_url: formData.file_url,
          cover_url: coverUrl,
          pages: formData.pages ? parseInt(formData.pages) : null,
          size_mb: formData.size_mb ? parseFloat(formData.size_mb) : null,
          active: true
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم إضافة الكتاب بنجاح!');
        onSuccess();
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('❌ حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        
        {/* Header - ثابت */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <Plus className="w-8 h-8" />
            <h3 className="text-2xl font-bold">إضافة كتاب جديد</h3>
          </div>
          <p className="text-white/90 text-sm mt-2">املأ المعلومات لإضافة كتاب للمكتبة</p>
        </div>

        {/* Content - قابل للـ scroll */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="add-book-form">
            
            {/* معلومات أساسية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-lg">معلومات الكتاب</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عنوان الكتاب <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="حصن المسلم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اسم المؤلف <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="سعيد بن علي القحطاني"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  وصف الكتاب <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none transition-all"
                  placeholder="وصف مختصر عن محتوى الكتاب..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    التصنيف <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اللغة <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white transition-all"
                  >
                    <option value="ar">العربية 🇸🇦</option>
                    <option value="en">English 🇬🇧</option>
                    <option value="fr">Français 🇫🇷</option>
                    <option value="other">أخرى 🌍</option>
                  </select>
                </div>
              </div>
            </div>

            {/* الروابط */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-lg">روابط الكتاب</h4>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رابط الكتاب <span className="text-red-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.file_url}
                  onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="https://drive.google.com/file/d/..."
                />
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-900 text-sm font-bold mb-1">📌 خيارات الرفع المدعومة:</p>
                  <div className="text-blue-800 text-xs space-y-1">
                    <p>✅ Google Drive (مُنصح به)</p>
                    <p>✅ Dropbox</p>
                    <p>✅ OneDrive</p>
                    <p>✅ أي رابط مباشر آخر</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  صورة الغلاف <span className="text-gray-500 text-xs">(اختياري)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, coverFile: e.target.files[0]})}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 إذا لم تختر صورة، سنستخدم صورة افتراضية جميلة
                </p>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                <FileText className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-lg">معلومات إضافية <span className="text-gray-500 text-sm">(اختياري)</span></h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    عدد الصفحات
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({...formData, pages: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    حجم الملف (MB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.size_mb}
                    onChange={(e) => setFormData({...formData, size_mb: e.target.value})}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    placeholder="5.2"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - ثابت */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="add-book-form"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                إضافة الكتاب
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}