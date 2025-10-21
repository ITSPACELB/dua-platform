// Ads management component

// Two sections:
// 1. Banner ad (text + link + toggle)
// 2. Image ad (upload + preview + link)

// Banner section:
<div className="bg-white p-6 rounded-lg mb-6">
  <h3 className="text-lg font-bold mb-4">إعلان البانر العلوي</h3>
  <input 
    type="text" 
    placeholder="نص الإعلان"
    value={bannerText}
    onChange={e => setBannerText(e.target.value)}
  />
  <input type="text" placeholder="رابط (اختياري)" />
  <label className="flex items-center gap-2 mt-2">
    <input type="checkbox" checked={bannerActive} />
    تفعيل البانر
  </label>
  <button onClick={handleSaveBanner} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded">
    حفظ
  </button>
</div>

// Image section: similar with file upload