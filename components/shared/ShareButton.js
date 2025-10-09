// Web Share API component
// Props: {title, text, url}

const handleShare = async () => {
  // Check if Web Share API supported
  if (!navigator.share) {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url)
    alert('تم نسخ الرابط!')
    return
  }
  
  try {
    await navigator.share({title, text, url})
    
    // Track share
    await fetch('/api/tracking/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuth().token}`
      },
      body: JSON.stringify({sharedAt: Date.now()})
    })
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err)
    }
  }
}

// UI: Button
<button onClick={handleShare} className="flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-lg">
  <Share2 className="w-5 h-5" />
  شارك المنصة
</button>