#!/bin/bash
cd /var/www/dua-platform

echo "=== STEP 1: Creating New Files ==="

# 1. lib/auth-client.js
cat > lib/auth-client.js << 'EOF'
'use client'

export function getAuthClient() {
  if (typeof window === 'undefined') return { user: null, token: null, isValid: false };
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return { user, token, isValid: !!token };
}

export function saveAuth(user, token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthClient() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
EOF

# 2. components/shared/CountdownTimer.js
cat > components/shared/CountdownTimer.js << 'EOF'
'use client'
import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetTimestamp, onComplete, label }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetTimestamp) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTimestamp).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        if (onComplete) onComplete();
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onComplete]);

  if (!timeLeft) return null;

  return (
    <div className="text-center">
      <p className="text-sm text-white/90 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{timeLeft}</p>
    </div>
  );
}
EOF

# 3. components/shared/InstallPrompt.js
cat > components/shared/InstallPrompt.js << 'EOF'
'use client'
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold mb-2">ثبّت التطبيق على جهازك</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="flex-1 bg-white text-emerald-600 py-2 rounded-lg font-semibold">
          تثبيت
        </button>
        <button onClick={() => setShowPrompt(false)} className="px-4 bg-emerald-700 rounded-lg">
          لاحقاً
        </button>
      </div>
    </div>
  );
}
EOF

# 4. components/shared/ShareButton.js
cat > components/shared/ShareButton.js << 'EOF'
'use client'
import { Share2 } from 'lucide-react';

export default function ShareButton({ title, text, url }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full bg-sky-600 hover:bg-sky-700 text-white p-5 rounded-lg transition-colors flex items-center justify-center gap-3"
    >
      <Share2 className="w-5 h-5" />
      <div className="text-center">
        <p className="font-semibold">شارك الموقع</p>
        <p className="text-sm opacity-90">كل مؤمن جديد يعني دعوات أكثر إن شاء الله</p>
      </div>
    </button>
  );
}
EOF

# 5. components/shared/TopWeeklyUser.js
cat > components/shared/TopWeeklyUser.js << 'EOF'
'use client'

export default function TopWeeklyUser({ topUser }) {
  if (!topUser) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
      <div className="text-center">
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-lg font-bold mb-1">أفضل مستخدم هذا الأسبوع</h3>
        <p className="text-2xl font-bold mb-1">{topUser.displayName}</p>
        <p className="text-sm opacity-90">{topUser.prayerCount} دعاء</p>
      </div>
    </div>
  );
}
EOF

# 6. components/shared/UniqueQuestionPicker.js
cat > components/shared/UniqueQuestionPicker.js << 'EOF'
'use client'
import { useState } from 'react';

const QUESTIONS = [
  'ما اسم مدينة ولادتك؟',
  'ما اسم أول مدرسة لك؟',
  'ما لون سيارتك الأولى؟',
  'ما اسم حيوانك الأليف الأول؟'
];

export default function UniqueQuestionPicker({ value, answer, onChange }) {
  return (
    <div className="space-y-3">
      <select
        value={value}
        onChange={(e) => onChange({ question: e.target.value, answer })}
        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg"
      >
        <option value="">اختر سؤالاً سرياً</option>
        {QUESTIONS.map((q) => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>
      {value && (
        <input
          type="text"
          value={answer}
          onChange={(e) => onChange({ question: value, answer: e.target.value })}
          placeholder="الإجابة"
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg"
        />
      )}
    </div>
  );
}
EOF

echo "=== STEP 2: Adding 'use client' to existing files ==="

# Add 'use client' to all component files
for file in \
  components/DuaPlatform.js \
  components/LoginPage.js \
  components/pages/LandingPage.js \
  components/pages/LoginPage.js \
  components/pages/RegisterPage.js \
  components/pages/HomePage.js \
  components/pages/AboutPage.js \
  components/pages/StatsPage.js \
  components/pages/AchievementsPage.js \
  components/pages/FAQPage.js \
  components/shared/IslamicBanner.js \
  components/shared/MenuBar.js \
  components/shared/ReactionButtons.js \
  components/shared/VerificationBadge.js
do
  if [ -f "$file" ]; then
    if ! grep -q "'use client'" "$file"; then
      sed -i "1i'use client'" "$file"
      echo "✓ Added 'use client' to $file"
    fi
  fi
done

echo "=== STEP 3: Removing getAuth imports ==="

# Remove getAuth imports
sed -i "/import.*getAuth.*from.*@\/lib\/auth/d" components/pages/HomePage.js
sed -i "/import.*getAuth.*from.*@\/lib\/auth/d" components/pages/StatsPage.js
sed -i "/import.*getAuth.*from.*@\/lib\/auth/d" components/pages/AchievementsPage.js
sed -i "/import.*getAuth.*from.*@\/lib\/auth/d" components/DuaPlatform.js

echo "=== STEP 4: Replacing getAuth() with localStorage ==="

# Replace in HomePage.js
sed -i "s/const { token } = getAuth();/const token = localStorage.getItem('token');/g" components/pages/HomePage.js
sed -i "s/const token = getAuth().token;/const token = localStorage.getItem('token');/g" components/pages/HomePage.js

# Replace in StatsPage.js
sed -i "s/const { token } = getAuth();/const token = localStorage.getItem('token');/g" components/pages/StatsPage.js

# Replace in AchievementsPage.js  
sed -i "s/const { token } = getAuth();/const token = localStorage.getItem('token');/g" components/pages/AchievementsPage.js

# Replace in DuaPlatform.js
sed -i "s/clearAuth()/localStorage.clear()/g" components/DuaPlatform.js

echo "=== STEP 5: Creating placeholder images ==="

# Create simple colored placeholders (you'll replace these later)
convert -size 192x192 xc:#16a34a -pointsize 100 -fill white -gravity center -annotate +0+0 "يُجيب" public/icon-192.png 2>/dev/null || echo "⚠ ImageMagick not installed - create icons manually"
convert -size 512x512 xc:#16a34a -pointsize 200 -fill white -gravity center -annotate +0+0 "يُجيب" public/icon-512.png 2>/dev/null || echo "⚠ ImageMagick not installed - create icons manually"
convert -size 1080x1920 xc:#fafaf9 -pointsize 80 -fill #16a34a -gravity center -annotate +0+0 "منصة الدعاء الجماعي" public/screenshot1.png 2>/dev/null || echo "⚠ ImageMagick not installed - create screenshot manually"

echo "=== STEP 6: Building project ==="

npm run build

echo "=== STEP 7: Restarting application ==="

pm2 restart dua-platform

echo "=== ✅ COMPLETE ==="
echo "Check https://yojeeb.com"
