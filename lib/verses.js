// ═══════════════════════════════════════════════════════════
// مكتبة الآيات القرآنية الكاملة - يُجيب
// 108 آية دعاء + 57 غرض
// ═══════════════════════════════════════════════════════════

// ═══ قاعدة بيانات الأدعية القرآنية (108 آية) ═══
export const quranicDuas = [
  // الهداية
  { id: 1, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', reference: 'الفاتحة: 6', category: 'hidaya' },
  { id: 2, text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', reference: 'آل عمران: 8', category: 'hidaya' },
  { id: 26, text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا', reference: 'التحريم: 8', category: 'hidaya' },
  { id: 58, text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا', reference: 'التحريم: 8', category: 'hidaya' },
  
  // الفرج واليسر
  { id: 3, text: 'رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ', reference: 'الأنبياء: 83', category: 'faraj' },
  { id: 4, text: 'رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي', reference: 'طه: 25-26', category: 'yusr' },
  { id: 51, text: 'رَبَّنَا اكْشِفْ عَنَّا الْعَذَابَ إِنَّا مُؤْمِنُونَ', reference: 'الدخان: 12', category: 'faraj' },
  { id: 63, text: 'رَبِّ اشْرَحْ لِي صَدْرِي', reference: 'طه: 25', category: 'fahm' },
  { id: 64, text: 'وَيَسِّرْ لِي أَمْرِي', reference: 'طه: 26', category: 'yusr' },
  { id: 69, text: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', reference: 'الأنبياء: 87', category: 'faraj' },
  { id: 101, text: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ', reference: 'البقرة: 286', category: 'yusr' },
  
  // الرزق
  { id: 6, text: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', reference: 'القصص: 24', category: 'rizq' },
  { id: 29, text: 'رَبَّنَا أَنزِلْ عَلَيْنَا مَائِدَةً مِّنَ السَّمَاءِ', reference: 'المائدة: 114', category: 'rizq' },
  
  // المغفرة والرحمة
  { id: 8, text: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا', reference: 'آل عمران: 147', category: 'maghfira' },
  { id: 9, text: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ', reference: 'المؤمنون: 118', category: 'rahma' },
  { id: 10, text: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', reference: 'الأعراف: 23', category: 'maghfira' },
  { id: 20, text: 'وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا', reference: 'البقرة: 286', category: 'maghfira' },
  { id: 21, text: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا', reference: 'آل عمران: 16', category: 'tawba' },
  { id: 22, text: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي', reference: 'القصص: 16', category: 'maghfira' },
  { id: 24, text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', reference: 'إبراهيم: 41', category: 'maghfira' },
  { id: 34, text: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', reference: 'الكهف: 10', category: 'rahma' },
  { id: 41, text: 'رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا', reference: 'آل عمران: 193', category: 'maghfira' },
  { id: 46, text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ', reference: 'إبراهيم: 41', category: 'maghfira' },
  { id: 49, text: 'رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَّحْمَةً وَعِلْمًا فَاغْفِرْ', reference: 'غافر: 7', category: 'maghfira' },
  { id: 50, text: 'رَبَّنَا فَاغْفِرْ لِلَّذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ', reference: 'غافر: 7', category: 'tawba' },
  { id: 74, text: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً', reference: 'الكهف: 10', category: 'rahma' },
  { id: 81, text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', reference: 'الحشر: 10', category: 'maghfira_amwat' },
  { id: 93, text: 'وَاغْفِرْ لِأَبِي إِنَّهُ كَانَ مِنَ الضَّالِّينَ', reference: 'الشعراء: 86', category: 'maghfira_walid' },
  { id: 99, text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', reference: 'البقرة: 286', category: 'afw' },
  { id: 102, text: 'وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا', reference: 'البقرة: 286', category: 'afw_maghfira' },
  { id: 104, text: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ', reference: 'آل عمران: 16', category: 'iman_thabat' },
  
  // الذرية والزواج
  { id: 11, text: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً', reference: 'آل عمران: 38', category: 'zawaj' },
  { id: 12, text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', reference: 'الفرقان: 74', category: 'zawaj' },
  { id: 67, text: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ', reference: 'الأنبياء: 89', category: 'zawaj' },
  { id: 89, text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', reference: 'الفرقان: 74', category: 'dhurriyah' },
  
  // العلم
  { id: 13, text: 'رَبِّ زِدْنِي عِلْمًا', reference: 'طه: 114', category: 'ilm' },
  
  // النصر
  { id: 14, text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', reference: 'البقرة: 250', category: 'nasr' },
  { id: 59, text: 'رَبِّ انصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ', reference: 'العنكبوت: 30', category: 'nasr' },
  { id: 78, text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا', reference: 'البقرة: 250', category: 'thabat' },
  { id: 103, text: 'فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', reference: 'البقرة: 286', category: 'nasr_aadaa' },
  { id: 105, text: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', reference: 'آل عمران: 147', category: 'sabr_nasr' },
  
  // الحفظ والأمن
  { id: 15, text: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا', reference: 'الممتحنة: 5', category: 'hifz' },
  { id: 17, text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', reference: 'البقرة: 286', category: 'maghfira' },
  { id: 18, text: 'رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا', reference: 'البقرة: 286', category: 'yusr' },
  { id: 19, text: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ', reference: 'البقرة: 286', category: 'yusr' },
  { id: 44, text: 'رَبِّ اجْعَلْ هَٰذَا الْبَلَدَ آمِنًا وَاجْنُبْنِي وَبَنِيَّ أَن نَّعْبُدَ الْأَصْنَامَ', reference: 'إبراهيم: 35', category: 'hifz' },
  { id: 52, text: 'رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ', reference: 'القصص: 21', category: 'salamah' },
  { id: 53, text: 'رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظَّالِمِينَ', reference: 'الأعراف: 47', category: 'hifz' },
  { id: 71, text: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ', reference: 'المؤمنون: 97', category: 'istiaza' },
  { id: 72, text: 'وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', reference: 'المؤمنون: 98', category: 'hifz' },
  { id: 76, text: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ', reference: 'يونس: 85', category: 'fitna' },
  { id: 80, text: 'رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظَّالِمِينَ', reference: 'الأعراف: 47', category: 'hifz' },
  { id: 84, text: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا', reference: 'الممتحنة: 5', category: 'sitr' },
  
  // الصبر
  { id: 5, text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ', reference: 'الأعراف: 126', category: 'sabr' },
  { id: 55, text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ', reference: 'الأعراف: 126', category: 'sabr' },
  
  // الوالدين
  { id: 23, text: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', reference: 'الإسراء: 24', category: 'birr' },
  { id: 73, text: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', reference: 'الإسراء: 24', category: 'birr' },
  
  // الثبات والاستقامة
  { id: 25, text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً', reference: 'آل عمران: 8', category: 'istiqama' },
  { id: 57, text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', reference: 'آل عمران: 8', category: 'istiqama' },
  { id: 62, text: 'رَبِّ بِمَا أَنْعَمْتَ عَلَيَّ فَلَنْ أَكُونَ ظَهِيرًا لِّلْمُجْرِمِينَ', reference: 'القصص: 17', category: 'istiqama' },
  
  // الاستعاذة
  { id: 27, text: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ * وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', reference: 'المؤمنون: 97-98', category: 'istiaza' },
  
  // التقوى والصلاة
  { id: 28, text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي', reference: 'إبراهيم: 40', category: 'taqwa' },
  { id: 33, text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', reference: 'إبراهيم: 40', category: 'dua' },
  { id: 45, text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي', reference: 'إبراهيم: 40', category: 'salah' },
  
  // المودة
  { id: 30, text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', reference: 'الحشر: 10', category: 'mawadda' },
  { id: 82, text: 'وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا', reference: 'الحشر: 10', category: 'tasfiyah' },
  
  // التوفيق
  { id: 31, text: 'رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ', reference: 'الإسراء: 80', category: 'tawfiq' },
  
  // الشكر
  { id: 32, text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ', reference: 'النمل: 19', category: 'shukr' },
  { id: 60, text: 'رَبِّ قَدْ آتَيْتَنِي مِنَ الْمُلْكِ وَعَلَّمْتَنِي مِن تَأْوِيلِ الْأَحَادِيثِ', reference: 'يوسف: 101', category: 'shukr' },
  
  // العدل
  { id: 16, text: 'رَبِّ احْكُم بِالْحَقِّ', reference: 'الأنبياء: 112', category: 'adl' },
  { id: 54, text: 'رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالْحَقِّ', reference: 'الأعراف: 89', category: 'haqq' },
  
  // النصرة
  { id: 35, text: 'رَبَّنَا أَخْرِجْنَا مِنْ هَٰذِهِ الْقَرْيَةِ الظَّالِمِ أَهْلُهَا', reference: 'النساء: 75', category: 'nusrah' },
  { id: 79, text: 'رَبَّنَا أَخْرِجْنَا مِنْ هَٰذِهِ الْقَرْيَةِ الظَّالِمِ أَهْلُهَا', reference: 'النساء: 75', category: 'khalas' },
  
  // القبول
  { id: 36, text: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', reference: 'البقرة: 127', category: 'qabul' },
  { id: 107, text: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', reference: 'البقرة: 127', category: 'hajj' },
  
  // الإيمان
  { id: 37, text: 'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِن ذُرِّيَّتِنَا أُمَّةً مُّسْلِمَةً لَّكَ', reference: 'البقرة: 128', category: 'iman' },
  { id: 38, text: 'رَبَّنَا آمَنَّا بِمَا أَنزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ', reference: 'آل عمران: 53', category: 'iman' },
  { id: 40, text: 'رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ', reference: 'آل عمران: 193', category: 'iman' },
  { id: 43, text: 'رَبَّنَا آمَنَّا فَاكْتُبْنَا مَعَ الشَّاهِدِينَ', reference: 'المائدة: 83', category: 'iman' },
  
  // السلامة
  { id: 39, text: 'رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ', reference: 'آل عمران: 191', category: 'salamah' },
  
  // الوفاء بالوعد
  { id: 42, text: 'رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ', reference: 'آل عمران: 194', category: 'wafaa' },
  { id: 106, text: 'رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ', reference: 'آل عمران: 194', category: 'wad' },
  
  // الحكمة
  { id: 47, text: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ', reference: 'الشعراء: 83', category: 'hikmah' },
  { id: 95, text: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ', reference: 'الشعراء: 83', category: 'hikmah' },
  
  // الصدق
  { id: 48, text: 'وَاجْعَل لِّي لِسَانَ صِدْقٍ فِي الْآخِرِينَ', reference: 'الشعراء: 84', category: 'sidq' },
  { id: 91, text: 'وَاجْعَل لِّي لِسَانَ صِدْقٍ فِي الْآخِرِينَ', reference: 'الشعراء: 84', category: 'sidq' },
  { id: 96, text: 'وَاجْعَل لِّي لِسَانَ صِدْقٍ فِي الْآخِرِينَ', reference: 'الشعراء: 84', category: 'sum_ah' },
  
  // الرشاد
  { id: 75, text: 'وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', reference: 'الكهف: 10', category: 'rashad' },
  { id: 98, text: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', reference: 'الكهف: 10', category: 'hidayat_ahl' },
  
  // النجاة
  { id: 77, text: 'وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ', reference: 'يونس: 86', category: 'najah' },
  
  // التوكل
  { id: 83, text: 'رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا', reference: 'الممتحنة: 4', category: 'tawakkul' },
  
  // الأمل
  { id: 85, text: 'عَسَى اللَّهُ أَن يَجْعَلَ بَيْنَكُمْ وَبَيْنَ الَّذِينَ عَادَيْتُم مِّنْهُم مَّوَدَّةً', reference: 'الممتحنة: 7', category: 'amal' },
  
  // الإصلاح
  { id: 86, text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', reference: 'التحريم: 8', category: 'islah' },
  
  // النجاة من النار
  { id: 87, text: 'رَبَّنَا قِنَا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا', reference: 'الفرقان: 65', category: 'najah_nar' },
  { id: 88, text: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ', reference: 'الفرقان: 65', category: 'najah_nar' },
  
  // القيادة
  { id: 90, text: 'وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', reference: 'الفرقان: 74', category: 'qiyadah' },
  
  // الجنة
  { id: 92, text: 'وَاجْعَلْنِي مِن وَرَثَةِ جَنَّةِ النَّعِيمِ', reference: 'الشعراء: 85', category: 'jannah' },
  { id: 97, text: 'وَاجْعَلْنِي مِن وَرَثَةِ جَنَّةِ النَّعِيمِ', reference: 'الشعراء: 85', category: 'jannah' },
  
  // الكرامة يوم القيامة
  { id: 94, text: 'وَلَا تُخْزِنِي يَوْمَ يُبْعَثُونَ', reference: 'الشعراء: 87', category: 'karamah_qiyamah' },
  
  // التخفيف
  { id: 100, text: 'رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا', reference: 'البقرة: 286', category: 'takhfif' },
  
  // التوبة (للحج)
  { id: 108, text: 'وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ', reference: 'البقرة: 128', category: 'tawba_hajj' },
  
  // الشفاء
  { id: 68, text: 'أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ', reference: 'الأنبياء: 83', category: 'shifa' },
  
  // حسن الخاتمة
  { id: 61, text: 'تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ', reference: 'يوسف: 101', category: 'khatima' },
  
  // الفهم والفصاحة
  { id: 65, text: 'وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي', reference: 'طه: 27', category: 'fasaha' },
  { id: 66, text: 'يَفْقَهُوا قَوْلِي', reference: 'طه: 28', category: 'fahm' },
  
  // البركة
  { id: 70, text: 'رَبِّ أَنزِلْنِي مُنزَلًا مُّبَارَكًا', reference: 'المؤمنون: 29', category: 'baraka' },
  
  // العام
  { id: 7, text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', reference: 'البقرة: 201', category: 'general' },
  { id: 56, text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', reference: 'البقرة: 201', category: 'general' },
]

// ═══ أغراض الدعاء (57 غرض) ═══
export const prayerPurposes = [
  { value: 'hidaya', label: '🧭 الهداية', emoji: '🧭' },
  { value: 'faraj', label: '🌅 الفرج', emoji: '🌅' },
  { value: 'rizq', label: '💰 الرزق', emoji: '💰' },
  { value: 'nasr', label: '⚔️ النصر', emoji: '⚔️' },
  { value: 'hifz', label: '🛡️ الحفظ', emoji: '🛡️' },
  { value: 'shifa', label: '💊 الشفاء', emoji: '💊' },
  { value: 'mawadda', label: '❤️ المودة والرحمة', emoji: '❤️' },
  { value: 'zawaj', label: '💍 الزواج', emoji: '💍' },
  { value: 'yusr', label: '✨ اليسر', emoji: '✨' },
  { value: 'maghfira', label: '🤲 المغفرة', emoji: '🤲' },
  { value: 'rahma', label: '☁️ الرحمة', emoji: '☁️' },
  { value: 'sakina', label: '🕊️ السكينة', emoji: '🕊️' },
  { value: 'quwwa', label: '💪 القوة', emoji: '💪' },
  { value: 'karama', label: '👑 الكرامة', emoji: '👑' },
  { value: 'izza', label: '🦁 العزة', emoji: '🦁' },
  { value: 'khayr', label: '🌟 الخير', emoji: '🌟' },
  { value: 'baraka', label: '✨ البركة', emoji: '✨' },
  { value: 'ilm', label: '📚 العلم', emoji: '📚' },
  { value: 'sabr', label: '⏳ الصبر', emoji: '⏳' },
  { value: 'tawba', label: '🔄 التوبة', emoji: '🔄' },
  { value: 'istighfar', label: '🙏 الاستغفار', emoji: '🙏' },
  { value: 'tawfiq', label: '🎯 التوفيق', emoji: '🎯' },
  { value: 'istiqama', label: '➡️ الاستقامة', emoji: '➡️' },
  { value: 'salamah', label: '✅ السلامة', emoji: '✅' },
  { value: 'amn', label: '🔒 الأمن', emoji: '🔒' },
  { value: 'iman', label: '☪️ الإيمان', emoji: '☪️' },
  { value: 'taqwa', label: '📿 التقوى', emoji: '📿' },
  { value: 'ihsan', label: '🌺 الإحسان', emoji: '🌺' },
  { value: 'shukr', label: '🙌 الشكر', emoji: '🙌' },
  { value: 'qanaa', label: '😊 القناعة', emoji: '😊' },
  { value: 'ikhlas', label: '💎 الإخلاص', emoji: '💎' },
  { value: 'sidq', label: '✔️ الصدق', emoji: '✔️' },
  { value: 'amanah', label: '🤝 الأمانة', emoji: '🤝' },
  { value: 'adl', label: '⚖️ العدل', emoji: '⚖️' },
  { value: 'birr', label: '🌿 بر الوالدين', emoji: '🌿' },
  { value: 'silat', label: '👨‍👩‍👧‍👦 صلة الرحم', emoji: '👨‍👩‍👧‍👦' },
  { value: 'nusrah', label: '🤲 نصرة المظلوم', emoji: '🤲' },
  { value: 'huffaz', label: '📖 حفظ القرآن', emoji: '📖' },
  { value: 'hajj', label: '🕋 الحج والعمرة', emoji: '🕋' },
  { value: 'siyam', label: '🌙 الصيام', emoji: '🌙' },
  { value: 'qiyam', label: '🌃 قيام الليل', emoji: '🌃' },
  { value: 'dhikr', label: '📿 الذكر', emoji: '📿' },
  { value: 'dua', label: '🤲 الدعاء', emoji: '🤲' },
  { value: 'general', label: '🌍 دعاء عام', emoji: '🌍' },
]

// ═══ آيات حسب نوع الدعاء ═══

// آيات للدعاء الشخصي
export const personalVerses = [
  'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
  'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
  'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
]

// آيات للدعاء لصديق
export const friendVerses = [
  'الدُّعَاءُ لِلْمُؤْمِنِينَ بِظَهْرِ الْغَيْبِ مُسْتَجَابٌ',
  'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
  'وَالَّذِينَ جَاءُوا مِن بَعْدِهِمْ يَقُولُونَ رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا',
]

// آيات للمتوفين
export const deceasedVerses = [
  'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
  'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
  'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
  'رَبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ',
  'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
]

// آيات للمرضى
export const sickVerses = [
  'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
  'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ',
  'قُلْ هُوَ لِلَّذِينَ آمَنُوا هُدًى وَشِفَاءٌ',
  'أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
]

// ═══ دوال مساعدة ═══

// الحصول على آية عشوائية حسب نوع الدعاء
export function getVerseByType(type = 'personal') {
  let verses
  
  switch (type) {
    case 'personal':
      verses = personalVerses
      break
    case 'friend':
      verses = friendVerses
      break
    case 'deceased':
      verses = deceasedVerses
      break
    case 'sick':
      verses = sickVerses
      break
    default:
      verses = personalVerses
  }
  
  const randomIndex = Math.floor(Math.random() * verses.length)
  return verses[randomIndex]
}

// الحصول على آية حسب الغرض
export function getVerseByPurpose(purpose) {
  const verses = quranicDuas.filter(dua => dua.category === purpose)
  
  if (verses.length === 0) {
    // إذا لم يوجد آيات لهذا الغرض، أعطي آية عامة
    const generalDuas = quranicDuas.filter(dua => dua.category === 'general')
    const randomIndex = Math.floor(Math.random() * generalDuas.length)
    return generalDuas[randomIndex]
  }
  
  const randomIndex = Math.floor(Math.random() * verses.length)
  return verses[randomIndex]
}

// الحصول على كل الآيات حسب الغرض
export function getAllVersesByPurpose(purpose) {
  return quranicDuas.filter(dua => dua.category === purpose)
}

// الحصول على آية عشوائية من كل الآيات
export function getRandomVerse() {
  const randomIndex = Math.floor(Math.random() * quranicDuas.length)
  return quranicDuas[randomIndex]
}

// البحث في الآيات
export function searchVerses(searchText) {
  const lowerSearch = searchText.toLowerCase()
  return quranicDuas.filter(dua => 
    dua.text.includes(searchText) || 
    dua.reference.includes(searchText)
  )
}

// الحصول على غرض دعاء بالـ value
export function getPurposeByValue(value) {
  return prayerPurposes.find(p => p.value === value)
}

// تصدير جميع الآيات كقائمة واحدة
export const allVerses = quranicDuas.map(dua => dua.text)