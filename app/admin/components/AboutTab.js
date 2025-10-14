'use client'
import { useState, useEffect } from 'react';

export default function AboutTab() {
    const [content, setContent] = useState({
        hero_title: '',
        hero_description: '',
        mission: '',
        vision: '',
        values: [],
        stats: {
            users: 0,
            prayers: 0,
            requests: 0
        },
        team: [],
        contact_email: '',
        contact_phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newTeamMember, setNewTeamMember] = useState({
        name: '',
        role: '',
        bio: '',
        image: ''
    });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = () => {
        const token = localStorage.getItem('token');

        fetch('/api/admin/about', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setContent(data.content);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Load about content error:', err);
                setLoading(false);
            });
    };

    const handleSave = () => {
        if (!confirm('هل تريد حفظ التغييرات على صفحة "من نحن"؟')) {
            return;
        }

        const token = localStorage.getItem('token');
        setSaving(true);

        fetch('/api/admin/about', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('تم حفظ التغييرات بنجاح');
                } else {
                    alert(data.error || 'فشل الحفظ');
                }
                setSaving(false);
            })
            .catch(err => {
                console.error('Save about content error:', err);
                alert('حدث خطأ أثناء الحفظ');
                setSaving(false);
            });
    };

    const addValue = () => {
        if (newValue.trim()) {
            setContent({
                ...content,
                values: [...content.values, newValue.trim()]
            });
            setNewValue('');
        }
    };

    const removeValue = (index) => {
        setContent({
            ...content,
            values: content.values.filter((_, i) => i !== index)
        });
    };

    const addTeamMember = () => {
        if (newTeamMember.name.trim() && newTeamMember.role.trim()) {
            setContent({
                ...content,
                team: [...content.team, { ...newTeamMember }]
            });
            setNewTeamMember({ name: '', role: '', bio: '', image: '' });
        }
    };

    const removeTeamMember = (index) => {
        setContent({
            ...content,
            team: content.team.filter((_, i) => i !== index)
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">Loading</div>
                <p className="text-stone-600">جاري تحميل المحتوى</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                    تعديل صفحة من نحن
                </h2>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-5xl">Edit</div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">تخصيص صفحة من نحن</h3>
                        <p className="text-cyan-100 text-sm">
                            عدل محتوى صفحة من نحن لتعريف الزوار بالمنصة ورسالتها ورؤيتها
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
                    القسم الرئيسي
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                            العنوان الرئيسي
                        </label>
                        <input
                            type="text"
                            value={content.hero_title}
                            onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                            placeholder="مثال: منصة الدعاء الجماعي"
                            maxLength={100}
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                            الوصف
                        </label>
                        <textarea
                            value={content.hero_description}
                            onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                            placeholder="وصف مختصر عن المنصة"
                            rows="4"
                            maxLength={500}
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none resize-none"
                        />
                        <p className="text-xs text-stone-500 mt-1">{content.hero_description.length}/500 حرف</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                        رسالتنا
                    </h3>
                    <textarea
                        value={content.mission}
                        onChange={(e) => setContent({ ...content, mission: e.target.value })}
                        placeholder="ما هي رسالة المنصة"
                        rows="6"
                        maxLength={1000}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none resize-none"
                    />
                    <p className="text-xs text-stone-500 mt-1">{content.mission.length}/1000 حرف</p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                        رؤيتنا
                    </h3>
                    <textarea
                        value={content.vision}
                        onChange={(e) => setContent({ ...content, vision: e.target.value })}
                        placeholder="ما هي رؤية المنصة للمستقبل"
                        rows="6"
                        maxLength={1000}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none resize-none"
                    />
                    <p className="text-xs text-stone-500 mt-1">{content.vision.length}/1000 حرف</p>
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    قيمنا
                </h3>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addValue()}
                        placeholder="أضف قيمة جديدة"
                        maxLength={100}
                        className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                    />
                    <button
                        onClick={addValue}
                        className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
                    >
                        إضافة
                    </button>
                </div>

                <div className="space-y-2">
                    {content.values.length === 0 ? (
                        <p className="text-stone-500 text-center py-8">لم تتم إضافة أي قيم بعد</p>
                    ) : (
                        content.values.map((value, index) => (
                            <div key={index} className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                                <span className="text-lg">Star</span>
                                <span className="flex-1 text-stone-800">{value}</span>
                                <button
                                    onClick={() => removeValue(index)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                                >
                                    حذف
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    فريق العمل
                </h3>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-stone-700 mb-3">إضافة عضو جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newTeamMember.name}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                            placeholder="الاسم"
                            className="px-4 py-2 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                        <input
                            type="text"
                            value={newTeamMember.role}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                            placeholder="المنصب"
                            className="px-4 py-2 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                        <input
                            type="url"
                            value={newTeamMember.image}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, image: e.target.value })}
                            placeholder="رابط الصورة اختياري"
                            className="px-4 py-2 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                        <textarea
                            value={newTeamMember.bio}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                            placeholder="نبذة مختصرة اختياري"
                            rows="1"
                            className="px-4 py-2 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none resize-none"
                        />
                    </div>
                    <button
                        onClick={addTeamMember}
                        className="mt-3 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
                    >
                        إضافة عضو
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.team.length === 0 ? (
                        <p className="text-stone-500 text-center py-8 col-span-2">لم تتم إضافة أي أعضاء بعد</p>
                    ) : (
                        content.team.map((member, index) => (
                            <div key={index} className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-cyan-200 flex items-center justify-center text-2xl">
                                            User
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-stone-800">{member.name}</h4>
                                        <p className="text-sm text-cyan-700 mb-1">{member.role}</p>
                                        {member.bio && (
                                            <p className="text-xs text-stone-600">{member.bio}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeTeamMember(index)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    معلومات التواصل
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={content.contact_email}
                            onChange={(e) => setContent({ ...content, contact_email: e.target.value })}
                            placeholder="info@yojeeb.com"
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={content.contact_phone}
                            onChange={(e) => setContent({ ...content, contact_phone: e.target.value })}
                            placeholder="+964 XXX XXX XXXX"
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-4 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {saving ? (
                    <>
                        <span className="animate-spin">Loading</span>
                        جاري الحفظ
                    </>
                ) : (
                    <>
                        <span>Save</span>
                        حفظ التغييرات
                    </>
                )}
            </button>

<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-blue-800 font-semibold mb-3">معاينة الصفحة</p>
                
                    <a
                
                    href="/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    افتح صفحة من نحن
                </a>
            </div>
        </div>
    );
}