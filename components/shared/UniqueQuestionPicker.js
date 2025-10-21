'use client'

// ============================================================================
// 📋 قائمة الأسئلة السرية المتاحة
// ============================================================================
const QUESTIONS = [
  'ما اسم والدك؟',
  'ما اسم جدك لأب؟',
  'ما كنيتك؟',
  'ما اسم أخيك الأكبر؟',
  'كم أخ لديك؟',
  'كم أخت لديك؟',
  'ما هو عملك؟',
  'ما هي شهادتك الدراسية؟',
  'ما اسم مدينة ولادتك؟',
  'ما اسم أول مدرسة لك؟',
  'ما لون سيارتك الأولى؟',
  'ما اسم حيوانك الأليف الأول؟',
  'ما اسم أقرب صديق لك في الطفولة؟'
];

export default function UniqueQuestionPicker({ 
  selectedQuestion = '',
  onQuestionChange,
  questionAnswer = '',
  onAnswerChange,
  existingQuestions = [],
  availableQuestions = [],
  disabled = false,
  isLogin = false
}) {
  // ============================================================================
  // 📋 تصفية الأسئلة المتاحة
  // ============================================================================
  const getAvailableQuestions = () => {
    if (isLogin && availableQuestions.length > 0) {
      // في تسجيل الدخول: إظهار الأسئلة المتاحة فقط
      return availableQuestions;
    }
    
    if (existingQuestions.length > 0) {
      // في التسجيل: استثناء الأسئلة المستخدمة
      return QUESTIONS.filter(q => !existingQuestions.includes(q));
    }
    
    // جميع الأسئلة متاحة
    return QUESTIONS;
  };

  const questions = getAvailableQuestions();

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="space-y-4">
      {/* اختيار السؤال */}
      <div>
        <label className="block text-stone-700 font-medium mb-2">
          {isLogin ? 'اختر سؤالك السري' : 'اختر سؤالاً سرياً للتمييز'}
        </label>
        <select
          value={selectedQuestion}
          onChange={(e) => onQuestionChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">-- اختر سؤالاً --</option>
          {questions.map((q, idx) => (
            <option key={idx} value={q}>{q}</option>
          ))}
        </select>
        
        {!isLogin && existingQuestions.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ بعض الأسئلة مستخدمة من قبل - اختر سؤالاً مختلفاً
          </p>
        )}
      </div>

      {/* إدخال الإجابة */}
      {selectedQuestion && (
        <div>
          <label className="block text-stone-700 font-medium mb-2">
            الإجابة
          </label>
          <input
            type="text"
            value={questionAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="أدخل الإجابة"
            disabled={disabled}
            className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          <p className="text-xs text-stone-500 mt-1">
            💡 احفظ الإجابة - ستحتاجها لتسجيل الدخول
          </p>
        </div>
      )}

      {/* ملاحظة مهمة */}
      {!isLogin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 text-center">
            🔐 هذا السؤال سيُستخدم للتمييز بينك وبين من لديهم نفس اسمك واسم والدتك
          </p>
        </div>
      )}
    </div>
  );
}