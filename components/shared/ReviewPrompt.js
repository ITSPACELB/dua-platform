// Google review prompt (shown after 20 prayers)

const [showReview, setShowReview] = useState(false)

useEffect(() => {
  if (user && stats.totalPrayersGiven >= 20) {
    fetch('/api/reviews/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuth().token}`
      },
      body: JSON.stringify({userId: user.id})
    })
    .then(res => res.json())
    .then(data => {
      if (data.shouldAskReview) {
        setShowReview(true)
      }
    })
  }
}, [user, stats])

// UI: Modal
{showReview && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-sm">
      <div className="text-4xl text-center mb-4">⭐</div>
      <h3 className="text-lg font-bold text-center mb-3">
        هل أعجبتك المنصة؟
      </h3>
      <p className="text-sm text-stone-600 text-center mb-4">
        ساعدنا بتقييمك على Google لنصل لمزيد من المؤمنين
      </p>
      
      <div className="flex gap-3">
        <a 
          href="https://g.page/r/..." 
          target="_blank"
          className="flex-1 bg-emerald-600 text-white py-2 rounded text-center"
          onClick={() => setShowReview(false)}
        >
          تقييم الآن
        </a>
        <button 
          onClick={() => setShowReview(false)}
          className="px-4 text-stone-600"
        >
          لاحقاً
        </button>
      </div>
    </div>
  </div>
)}