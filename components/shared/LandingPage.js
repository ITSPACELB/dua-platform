'use client'
import { Users, Heart, CheckCircle, Sparkles } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import { TOTAL_USERS } from '../constants/messages';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <IslamicBanner />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          
          {/* البطاقة الرئيسية */}
          <div className="bg-white rounded-lg shadow-lg border border-stone-200 p-8 mb-6">
            
            {/* الأيقونة */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>

            {/* العنوان */}
            <h1 className="text-3xl font-bold text-stone-800 mb-4 text-center">
              منصة الدعاء الجماعي
            </h1>
            
            {/* الآية */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <p className="text-stone-700 leading-relaxed text-lg text-center" style={{fontFamily: 'Traditional Arabic, serif'}}>
                ﴿ وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ<br/>
                أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ﴾
              </p>
              <p className="text-stone-500 text-sm text-center mt-2">البقرة: 186</p>
            </div>
            
            {/* الوصف */}
            <div className="space-y-3 mb-6">
              <p className="text-stone-700 text-lg leading-relaxed text-center">
                <strong className="text-emerald-600">دعاء واحد</strong> قد يغير حياة إنسان
              </p>
              <p className="text-stone-700 text-lg leading-relaxed text-center">
                وقد <strong className="text-emerald-600">يغير حياتك</strong> إن شاء الله
              </p>
            </div>

            {/* عداد المستخدمين */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-lg p-5 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Users className="w-6 h-6 text-emerald-600" />
                <div className="text-center">
                  <p className="text-emerald-700 font-bold text-2xl">
                    {TOTAL_USERS.toLocaleString()} مؤمن
                  </p>
                  <p className="text-emerald-600 text-sm">من حول العالم</p>
                </div>
              </div>
            </div>

            {/* المميزات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-stone-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🤲</div>
                <h3 className="font-semibold text-stone-800 mb-1">اطلب الدعاء</h3>
                <p className="text-sm text-stone-600">
                  آلاف المؤمنين يدعون لك
                </p>
              </div>

              <div className="bg-stone-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💚</div>
                <h3 className="font-semibold text-stone-800 mb-1">ادعُ للآخرين</h3>
                <p className="text-sm text-stone-600">
                  كن سبب فرج لإنسان
                </p>
              </div>

              <div className="bg-stone-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold text-stone-800 mb-1">نظام التوثيق</h3>
                <p className="text-sm text-stone-600">
                  ميزات خاصة للمتفاعلين
                </p>
              </div>
            </div>

            {/* أمثلة واقعية */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-5 mb-6">
              <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
                بشائر حقيقية
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700">
                    <strong>أحمد:</strong> "دعا لي 47 مؤمن، وتيسرت حاجتي بفضل الله خلال يومين!"
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700">
                    <strong>فاطمة:</strong> "طلبت الدعاء لوالدي المريض، والحمد لله تحسنت حالته"
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700">
                    <strong>محمد:</strong> "دعوت لـ 200 شخص، وشعرت بسكينة لم أشعر بها من قبل"
                  </p>
                </div>
              </div>
            </div>

            {/* زر البدء */}
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              ابدأ الآن إن شاء الله ✨
            </button>

            <p className="text-center text-sm text-stone-500 mt-4">
              مجاني تماماً • لا يتطلب بريد إلكتروني
            </p>
          </div>

          {/* كيف يعمل */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-stone-800 mb-4 text-center">
              كيف يعمل؟
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">سجّل باسمك واسم والدتك</h3>
                  <p className="text-sm text-stone-600">بسيط وسريع، بدون تعقيدات</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">اطلب الدعاء عند الحاجة</h3>
                  <p className="text-sm text-stone-600">احتفظ بحاجتك في قلبك، الله يعلم ما تريد</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">يصلك إشعار كل 30 دقيقة</h3>
                  <p className="text-sm text-stone-600">عندما يطلب أحد الدعاء، ادعُ له من قلبك</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">إذا تحققت حاجتك</h3>
                  <p className="text-sm text-stone-600">نُخبر كل من دعا لك بالبشرى ليفرحوا معك 💚</p>
                </div>
              </div>
            </div>
          </div>

          {/* اقتباس تحفيزي */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 text-white text-center mb-6">
            <p className="text-lg leading-relaxed mb-2">
              "ما من مسلم يدعو لأخيه بظهر الغيب<br/>
              إلا قال الملك: ولك بمثل"
            </p>
            <p className="text-emerald-200 text-sm">رواه مسلم</p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-stone-500">
            <p>منصة الدعاء الجماعي © 2025</p>
            <p className="mt-1">
              فكرة وتطوير: <span className="text-emerald-600 font-semibold">حيدر الغافقي 🌿</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}