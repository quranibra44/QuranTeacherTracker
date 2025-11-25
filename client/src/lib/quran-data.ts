// Simplified Quran Data for Mapping Pages to Surah and Juz
// Based on standard Madani 604-page Mushaf

export const getQuranContext = (page: number) => {
  if (page < 1 || page > 604) return null;
  
  const juz = Math.ceil((page - 1) / 20); // Rough approximation for Juz (usually 20 pages per Juz)
  const surah = getSurahByPage(page);

  return { juz, surah };
};

const surahStartPages: Record<number, string> = {
  1: "Al-Fatiha",
  2: "Al-Baqarah",
  50: "Ali 'Imran",
  77: "An-Nisa",
  106: "Al-Ma'idah",
  128: "Al-An'am",
  151: "Al-A'raf",
  177: "Al-Anfal",
  187: "At-Tawbah",
  208: "Yunus",
  221: "Hud",
  235: "Yusuf",
  249: "Ar-Ra'd",
  255: "Ibrahim",
  262: "Al-Hijr",
  267: "An-Nahl",
  282: "Al-Isra",
  293: "Al-Kahf",
  305: "Maryam",
  312: "Ta-Ha",
  322: "Al-Anbiya",
  332: "Al-Hajj",
  342: "Al-Mu'minun",
  350: "An-Nur",
  359: "Al-Furqan",
  367: "Ash-Shu'ara",
  377: "An-Naml",
  385: "Al-Qasas",
  396: "Al-Ankabut",
  404: "Ar-Rum",
  411: "Luqman",
  415: "As-Sajdah",
  418: "Al-Ahzab",
  428: "Saba",
  434: "Fatir",
  440: "Ya-Sin",
  446: "As-Saffat",
  453: "Sad",
  458: "Az-Zumar",
  467: "Ghafir",
  477: "Fussilat",
  483: "Ash-Shura",
  489: "Az-Zukhruf",
  496: "Ad-Dukhan",
  499: "Al-Jathiyah",
  502: "Al-Ahqaf",
  507: "Muhammad",
  511: "Al-Fath",
  515: "Al-Hujurat",
  518: "Qaf",
  520: "Adh-Dhariyat",
  523: "At-Tur",
  526: "An-Najm",
  528: "Al-Qamar",
  531: "Ar-Rahman",
  534: "Al-Waqi'ah",
  537: "Al-Hadid",
  542: "Al-Mujadila",
  545: "Al-Hashr",
  549: "Al-Mumtahanah",
  551: "As-Saff",
  553: "Al-Jumu'ah",
  554: "Al-Munafiqun",
  556: "At-Taghabun",
  558: "At-Talaq",
  560: "At-Tahrim",
  562: "Al-Mulk",
  564: "Al-Qalam",
  566: "Al-Haqqah",
  568: "Al-Ma'arij",
  570: "Nuh",
  572: "Al-Jinn",
  574: "Al-Muzzammil",
  575: "Al-Muddaththir",
  577: "Al-Qiyamah",
  578: "Al-Insan",
  580: "Al-Mursalat",
  582: "An-Naba",
  583: "An-Nazi'at",
  585: "Abasa",
  586: "At-Takwir",
  587: "Al-Infitar",
  587.5: "Al-Mutaffifin", // Logic handles simplified lookups
  589: "Al-Inshiqaq",
  590: "Al-Buruj",
  591: "At-Tariq",
  591.5: "Al-A'la",
  592: "Al-Ghashiyah",
  593: "Al-Fajr",
  594: "Al-Balad",
  595: "Ash-Shams",
  595.5: "Al-Layl",
  596: "Ad-Duha",
  596.5: "Ash-Sharh",
  597: "At-Tin",
  597.5: "Al-Alaq",
  598: "Al-Qadr",
  598.5: "Al-Bayyinah",
  599: "Az-Zalzalah",
  599.5: "Al-Adiyat",
  600: "Al-Qari'ah",
  600.5: "At-Takathur",
  601: "Al-Asr",
  601.2: "Al-Humazah",
  601.5: "Al-Fil",
  602: "Quraysh",
  602.2: "Al-Ma'un",
  602.5: "Al-Kawthar",
  603: "Al-Kafirun",
  603.2: "An-Nasr",
  603.5: "Al-Masad",
  604: "Al-Ikhlas",
  604.2: "Al-Falaq",
  604.5: "An-Nas"
};

function getSurahByPage(page: number): string {
  let currentSurah = "Al-Fatiha";
  // Find the surah with the highest start page that is <= current page
  const pages = Object.keys(surahStartPages).map(Number).sort((a, b) => a - b);
  
  for (const p of pages) {
    if (p <= page) {
      currentSurah = surahStartPages[p];
    } else {
      break;
    }
  }
  return currentSurah;
}
