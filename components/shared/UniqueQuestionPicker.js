// Props: {onSelectQuestion, onAnswerSubmit, availableQuestions}

// QUESTIONS array:
const UNIQUE_QUESTIONS = [
  {id: 'father', label: 'اسم والدك', placeholder: 'أحمد'},
  {id: 'grandfather', label: 'اسم جدك لأب', placeholder: 'محمد'},
  {id: 'nickname', label: 'كنيتك', placeholder: 'أبو عبدالله'},
  {id: 'birthDay', label: 'يوم ميلادك', type: 'number'},
  {id: 'country', label: 'بلدك', placeholder: 'مصر'},
  {id: 'region', label: 'منطقتك', placeholder: 'المعادي'},
  {id: 'firstSchool', label: 'أول مدرسة', placeholder: 'مدرسة النور'},
  {id: 'motherCity', label: 'مدينة ميلاد والدتك', placeholder: 'الإسكندرية'}
]

// UI: Dropdown to select question → Input field → Submit button
// Font-size: text-base → text-lg
// Colors: stone-700, emerald-600