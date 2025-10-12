'use client'
import { useState } from 'react';

export default function PhoneInput({ 
  value = '', 
  onChange, 
  placeholder = '+966 50 123 4567',
  disabled = false 
}) {
  // ============================================================================
  // 📱 معالجة إدخال رقم الهاتف
  // ============================================================================
  const handleChange = (e) => {
    let input = e.target.value;
    
    // إزالة كل شيء ما عدا الأرقام وعلامة +
    input = input.replace(/[^\d+]/g, '');
    
    // التأكد من أن + في البداية فقط
    if (input.includes('+')) {
      const parts = input.split('+');
      input = '+' + parts.join('').replace(/[^\d]/g, '');
    }
    
    onChange(input);
  };

  // ============================================================================
  // ✅ التحقق من صحة الرقم
  // ============================================================================
  const isValidPhone = (phone) => {
    // رقم صحيح: يبدأ بـ + ويحتوي على 10-15 رقم
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const showValidation = value.length > 0;
  const isValid = isValidPhone(value);

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="relative">
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:outline-none transition-colors ${
          showValidation
            ? isValid
              ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
              : 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-stone-300 focus:border-emerald-500 focus:ring-emerald-500'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        dir="ltr"
      />
      
      {/* أيقونة التحقق */}
      {showValidation && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <span className="text-emerald-500 text-xl">✓</span>
          ) : (
            <span className="text-red-500 text-xl">✗</span>
          )}
        </div>
      )}

      {/* رسائل المساعدة */}
      {showValidation && !isValid && (
        <p className="text-xs text-red-600 mt-1">
          الرقم يجب أن يبدأ بـ + ورمز الدولة (مثال: +966501234567)
        </p>
      )}
      
      {!showValidation && (
        <p className="text-xs text-stone-500 mt-1">
          أدخل رقم الهاتف مع رمز الدولة (مثال: +966 للسعودية)
        </p>
      )}
    </div>
  );
}