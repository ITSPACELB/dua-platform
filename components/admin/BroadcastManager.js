// Broadcast message manager

// Form:
// - Title (required)
// - Message (textarea, required)
// - Target group (radio: all/verified/inactive)
// - Preview of recipients count
// - Send button

// State: title, message, targetGroup, recipientsCount

// onChange targetGroup → fetch count:
useEffect(() => {
  fetch(`/api/admin/broadcast/count?target=${targetGroup}`)
    .then(res => res.json())
    .then(data => setRecipientsCount(data.count))
}, [targetGroup])

// onSubmit:
const handleSend = async () => {
  const confirmed = confirm(`إرسال إلى ${recipientsCount} مستخدم؟`)
  if (!confirmed) return
  
  await fetch('/api/admin/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({title, message, targetGroup})
  })
  
  alert('تم الإرسال بنجاح!')
}

// History table below form (last 10 broadcasts)