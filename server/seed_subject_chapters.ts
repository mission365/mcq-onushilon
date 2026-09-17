import pg from 'pg';

export const seedSubjectChapters = async (pool: pg.Pool) => {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting Subject Chapters & Chapter Model Tests Seeder...');

    // Definition of accurate NCTB chapters per subject
    // Keys match subject name search pattern
    const subjectChaptersData: Array<{
      subjectPattern: string;
      curriculum: string;
      level: string;
      chapters: Array<{
        num: number;
        titleBn: string;
        titleEn: string;
        questions: Array<{
          q: string;
          a: string;
          b: string;
          c: string;
          d: string;
          ans: 'a' | 'b' | 'c' | 'd';
          exp: string;
        }>;
      }>;
    }> = [
      // =========================================================================
      // 1. HSC Physics 1st Paper (পদার্থবিজ্ঞান ১ম পত্র - NCTB)
      // =========================================================================
      {
        subjectPattern: 'Physics 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'ভৌতজগত ও পরিমাপ',
            titleEn: 'Physical World and Measurement',
            questions: [
              {
                q: 'কোনটি মৌলিক রাশি নয়?',
                a: 'তড়িৎ প্রবাহ',
                b: 'তাপমাত্রা',
                c: 'দ্বিপন তীব্রতা',
                d: 'কম্পাঙ্ক',
                ans: 'd',
                exp: 'কম্পাঙ্ক একটি লব্ধ রাশি (১/টি)। অন্য তিনটি মৌলিক রাশি।'
              },
              {
                q: 'প্ল্যাঙ্কের ধ্রুবকের (h) মাত্রা কোনটি?',
                a: 'ML²T⁻¹',
                b: 'MLT⁻²',
                c: 'ML²T⁻²',
                d: 'ML⁻¹T⁻¹',
                ans: 'a',
                exp: 'E = hν => h = E/ν = (ML²T⁻²)/(T⁻¹) = ML²T⁻¹ যা কৌণিক ভরবেগের মাত্রার সমান।'
              },
              {
                q: 'ভার্নিয়ার ধ্রুবক (VC) নির্ণয়ের সূত্র কোনটি?',
                a: 's / n',
                b: 'n / s',
                c: 's × n',
                d: 's - n',
                ans: 'a',
                exp: 'ভার্নিয়ার ধ্রুবক VC = প্রধান স্কেলের ১ ক্ষুদ্রতম ভাগের মান (s) / ভার্নিয়ার স্কেলের মোট ভাগ সংখ্যা (n)।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'ভেক্টর',
            titleEn: 'Vectors',
            questions: [
              {
                q: 'দুটি সমমানের ভেক্টরের লব্ধির মান যেকোনো একটির মানের সমান হলে তাদের মধ্যবর্তী কোণ কত?',
                a: '0°',
                b: '90°',
                c: '120°',
                d: '180°',
                ans: 'c',
                exp: 'R² = P² + Q² + 2PQ cos α. P=Q=R হলে cos α = -1/2 => α = 120°।'
              },
              {
                q: 'ভেক্টর A ও B পরস্পর লম্ব হওয়ার শর্ত কী?',
                a: 'A × B = 0',
                b: 'A · B = 0',
                c: 'A + B = 0',
                d: 'A - B = 0',
                ans: 'b',
                exp: 'A · B = AB cos(90°) = 0, সুতরাং ডট গুণন শূন্য হলে ভেক্টরদ্বয় পরস্পর লম্ব।'
              },
              {
                q: 'কোনো ভেক্টর ক্ষেত্রের ডাইভারজেন্স শূন্য হলে তাকে কী বলে?',
                a: 'ঘূর্ণনশীল',
                b: 'অঘূর্ণনশীল',
                c: 'সোলেনয়ডাল (Solenoidal)',
                d: 'লামেলার',
                ans: 'c',
                exp: '∇ · V = 0 হলে ভেক্টর ক্ষেত্রটি সোলেনয়ডাল হয় এবং ∇ × V = 0 হলে অঘূর্ণনশীল হয়।'
              }
            ]
          },
          {
            num: 3,
            titleBn: 'গতিবিদ্যা',
            titleEn: 'Dynamics & Kinematics',
            questions: [
              {
                q: 'সর্বোচ্চ অনুভূমিক পাল্লার জন্য প্রক্ষেপণ কোণ (θ) কত হতে হবে?',
                a: '30°',
                b: '45°',
                c: '60°',
                d: '90°',
                ans: 'b',
                exp: 'অনুভূমিক পাল্লা R = (v₀² sin 2θ)/g. sin 2θ এর সর্বোচ্চ মান 1 যখন 2θ = 90° বা θ = 45°।'
              },
              {
                q: 'প্রাসের গতিপথের আকার কেমন?',
                a: 'সরলরৈখিক',
                b: 'পরাবৃত্তাকার (Parabolic)',
                c: 'বৃত্তাকার',
                d: 'উপবৃত্তাকার',
                ans: 'b',
                exp: 'প্রাসের গতিপথ y = ax - bx² সমীকরণ মেনে চলে, যা একটি প্যারাবোলা বা পরাবৃত্ত।'
              },
              {
                q: 'একটি কণা r ব্যাসার্ধের বৃত্তাকার পথে সমদ্রুতিতে ঘুরলে তার ত্বরণ কোন দিকে কাজ করে?',
                a: 'স্পর্শক বরাবর',
                b: 'কেন্দ্রের দিকে (অভিকেন্দ্রী)',
                c: 'কেন্দ্রের বাইরের দিকে',
                d: 'ত্বরণ শূন্য',
                ans: 'b',
                exp: 'সমদ্রুতিতে ঘুরলেও গতির দিক অবিরাম পরিবর্তিত হওয়ায় কেন্দ্রের দিকে a = v²/r ত্বরণ কাজ করে।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'নিউটনিয়ান বলবিদ্যা',
            titleEn: 'Newtonian Mechanics',
            questions: [
              {
                q: 'রকেটের গতি কোন নীতির ওপর ভিত্তি করে কাজ করে?',
                a: 'ভরবেগের সংরক্ষণ সূত্র ও নিউটনের ৩য় সূত্র',
                b: 'শক্তির সংরক্ষণ সূত্র',
                c: 'ভরের সংরক্ষণ সূত্র',
                d: 'মহাকর্ষ সূত্র',
                ans: 'a',
                exp: 'রকেটের নির্গত গ্যাসের বিপরীতে প্রতিক্রিয়া বল এবং রৈখিক ভরবেগের সংরক্ষণ সূত্রের ওপর এটি ক্রিয়াশীল।'
              },
              {
                q: 'কৌণিক ভরবেগ L এর সাথে জড়তার ভ্রামক I এর সম্পর্ক কী?',
                a: 'L = I / ω',
                b: 'L = I ω',
                c: 'L = I ω²',
                d: 'L = ½ I ω²',
                ans: 'b',
                exp: 'রৈখিক ভরবেগ p = mv এর সমতুল্য কৌণিক ভরবেগ L = Iω।'
              },
              {
                q: 'রাস্তার ব্যাংকিং কোণ θ এর সমীকরণ কোনটি?',
                a: 'tan θ = rg / v²',
                b: 'tan θ = v² / (rg)',
                c: 'sin θ = v² / (rg)',
                d: 'cos θ = v² / (rg)',
                ans: 'b',
                exp: 'নিরাপদ বাকের জন্য ব্যাংকিং কোণ tan θ = v² / (rg)।'
              }
            ]
          },
          {
            num: 5,
            titleBn: 'কাজ, শক্তি ও ক্ষমতা',
            titleEn: 'Work, Energy and Power',
            questions: [
              {
                q: 'কোনো কণা বৃত্তাকার পথে সম্পূর্ণ এক চক্কর ঘুরে আসলে অভিকেন্দ্র বল দ্বারা কৃতকাজ কত?',
                a: 'ঋণাত্মক',
                b: 'ধনাত্মক',
                c: 'শূন্য',
                d: 'অসীম',
                ans: 'c',
                exp: 'অভিকেন্দ্র বল সরণের সাথে ৯০° কোণে থাকায় W = F·s cos(90°) = 0।'
              },
              {
                q: 'একটি স্প্রিং এর প্রসারণ x দ্বিগুণ করা হলে সঞ্চিত বিভব শক্তি কত গুণ হবে?',
                a: '২ গুণ',
                b: '৪ গুণ',
                c: '৮ গুণ',
                d: 'অপরিবর্তিত থাকবে',
                ans: 'b',
                exp: 'স্প্রিং-এর বিভব শক্তি U = ½ kx²। x দ্বিগুণ হলে U চারগুণ হবে।'
              },
              {
                q: '১ অশ্বক্ষমতা (1 HP) কত ওয়াটের সমান?',
                a: '৫০০ ওয়াট',
                b: '৭৪৬ ওয়াট',
                c: '১০০০ ওয়াট',
                d: '৯৮০ ওয়াট',
                ans: 'b',
                exp: '1 Horse Power (HP) = 746 Watts।'
              }
            ]
          },
          {
            num: 6,
            titleBn: 'মহাকর্ষ ও অভিকর্ষ',
            titleEn: 'Gravitation and Gravity',
            questions: [
              {
                q: 'পৃথিবীর কেন্দ্রে অভিকর্ষজ ত্বরণ g এর মান কত?',
                a: '9.8 ms⁻²',
                b: 'শূন্য (0)',
                c: 'অসীম',
                d: '4.9 ms⁻²',
                ans: 'b',
                exp: 'পৃথিবীর কেন্দ্রে চারদিকের আকর্ষণ পারস্পরিকভাবে বাতিল হওয়ায় কেন্দ্রে g = 0।'
              },
              {
                q: 'ভূ-পৃষ্ঠ হতে কোনো বস্তুর মুক্তিবেগ (Escape Velocity) কত?',
                a: '9.8 km/s',
                b: '11.2 km/s',
                c: '7.9 km/s',
                d: '24.5 km/s',
                ans: 'b',
                exp: 'v_e = √(2gR) ≈ 11.2 km/s (কিলোমিটার প্রতি সেকেন্ড)।'
              },
              {
                q: 'কেপলারের ৩য় সূত্র অনুযায়ী গ্রহের আবর্তনকালের বর্গ (T²) কার সমানুপাতিক?',
                a: 'R',
                b: 'R²',
                c: 'R³',
                d: '1 / R³',
                ans: 'c',
                exp: 'কেপলারের পর্যায়কালের সূত্র: T² ∝ R³ (উপবৃত্তের অর্ধ-পরাক্ষের ঘনফলের সমানুপাতিক)।'
              }
            ]
          },
          {
            num: 7,
            titleBn: 'পদার্থের গাঠনিক ধর্ম',
            titleEn: 'Structural Properties of Matter',
            questions: [
              {
                q: 'পয়সনের অনুপাতের (Poisson\'s Ratio) তাত্ত্বিক মান কত সীমার মধ্যে থাকে?',
                a: '0 হতে 1',
                b: '-1 হতে +0.5',
                c: '-0.5 হতে +0.5',
                d: '0 হতে 0.5',
                ans: 'b',
                exp: 'পয়সনের অনুপাতের তাত্ত্বিক মান -1 < σ < 0.5 এবং ব্যবহারিক মান 0 < σ < 0.5।'
              },
              {
                q: 'বৃষ্টির ফোঁটা গোলাকার হওয়ার প্রধান কারণ কী?',
                a: 'সান্দ্রতা',
                b: 'পৃষ্ঠটান (Surface Tension)',
                c: 'বায়ুমণ্ডলীয় চাপ',
                d: 'অভিকর্ষ',
                ans: 'b',
                exp: 'পৃষ্ঠটানের কারণে তরলের মুক্তপৃষ্ঠ সর্বনিম্ন ক্ষেত্রফল বিশিষ্ট আকৃতি (গোলক) ধারণ করার চেষ্টা করে।'
              }
            ]
          },
          {
            num: 8,
            titleBn: 'পর্যায়বৃত্ত গতি',
            titleEn: 'Periodic Motion',
            questions: [
              {
                q: 'সরল ছন্দিত স্পন্দনে স্পন্দিত কণার সাম্যাবস্থানে বেগ কেমন হয়?',
                a: 'শূন্য',
                b: 'সর্বোচ্চ',
                c: 'সর্বনিম্ন কিন্তু শূন্য নয়',
                d: 'অনির্দিষ্ট',
                ans: 'b',
                exp: 'সাম্যাবস্থানে (x = 0) বেগ v = ω√(A² - x²) = ωA (সর্বোচ্চ) এবং ত্বরণ শূন্য।'
              },
              {
                q: 'একটি সেকেন্ড দোলকের কার্যকর দৈর্ঘ্য কত?',
                a: '০.৫ মিটার',
                b: '০.৯৯৩ মিটার',
                c: '১.৫ মিটার',
                d: '২ মিটার',
                ans: 'b',
                exp: 'পর্যায়কাল T = 2s হলে L = (g T²)/(4π²) ≈ 0.993 m বা প্রায় 1 মিটার।'
              }
            ]
          },
          {
            num: 9,
            titleBn: 'তরঙ্গ',
            titleEn: 'Waves',
            questions: [
              {
                q: 'শব্দ তরঙ্গ কোন ধরনের তরঙ্গ?',
                a: 'অনুদৈর্ঘ্য ও যান্ত্রিক তরঙ্গ',
                b: 'অনুপ্রস্থ তরঙ্গ',
                c: 'তড়িৎচৌম্বকীয় তরঙ্গ',
                d: 'স্থির তরঙ্গ',
                ans: 'a',
                exp: 'শব্দ সঞ্চালনের জন্য মাধ্যম আবশ্যক (যান্ত্রিক) এবং মাধ্যমের কণার কম্পনের দিক তরঙ্গের অভিমুখ বরাবর (অনুদৈর্ঘ্য)।'
              },
              {
                q: 'দুটি সুরশলাকার কম্পাঙ্ক যথাক্রমে 256 Hz এবং 260 Hz হলে প্রতি সেকেন্ডে উৎপন্ন বীট সংখ্যা কত?',
                a: '২টি',
                b: '৪টি',
                c: '৮টি',
                d: '৫১৬টি',
                ans: 'b',
                exp: 'বীট সংখ্যা N = |f₁ - f₂| = |260 - 256| = 4 টি।'
              }
            ]
          },
          {
            num: 10,
            titleBn: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব',
            titleEn: 'Ideal Gas and Kinetic Theory of Gases',
            questions: [
              {
                q: 'পরম শূন্য তাপমাত্রা (Absolute Zero) এর মান সেলসিয়াস স্কেলে কত?',
                a: '-273.15 °C',
                b: '0 °C',
                c: '-100 °C',
                d: '-373.15 °C',
                ans: 'a',
                exp: '0 Kelvin = -273.15 °C, যেখানে গ্যাসের অণুসমূহের গতিশক্তি তাত্ত্বিকভাবে শূন্য হয়।'
              },
              {
                q: 'গ্যাসের অণুর গড় বর্গবেগের বর্গমূল (RMS বেগ) তাপমাত্রার সাথে কীভাবে সম্পর্কিত?',
                a: 'c ∝ T',
                b: 'c ∝ √T',
                c: 'c ∝ T²',
                d: 'c ∝ 1/√T',
                ans: 'b',
                exp: 'RMS বেগ c = √(3RT/M), সুতরাং c পরম তাপমাত্রা T এর বর্গমূলের সমানুপাতিক।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 2. HSC Chemistry 1st Paper (রসায়ন ১ম পত্র - NCTB)
      // =========================================================================
      {
        subjectPattern: 'Chemistry 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'ল্যাবরেটরির নিরাপদ ব্যবহার',
            titleEn: 'Safe Use of Laboratory',
            questions: [
              {
                q: 'সেমিমাইক্রো পদ্ধতিতে নমুনার পরিমাণ কত নেওয়া হয়?',
                a: '0.05 g হতে 0.2 g',
                b: '1 g হতে 5 g',
                c: '0.001 g হতে 0.01 g',
                d: '10 g হতে 20 g',
                ans: 'a',
                exp: 'সেমিমাইক্রো পদ্ধতিতে কঠিন নমুনার ভর 50 mg - 200 mg (0.05-0.2 g) নেওয়া হয়।'
              },
              {
                q: 'ল্যাবরেটরিতে চোখের সুরক্ষায় কোনটি ব্যবহার বাধ্যতামূলক?',
                a: 'অ্যাপ্রন',
                b: 'সেফটি গগলস',
                c: 'মাস্ক',
                d: 'হ্যান্ড গ্লাভস',
                ans: 'b',
                exp: 'রাসায়নিক দ্রব্যাদির ছিটকে আসা থেকে চোখ রক্ষার্থে সেফটি গগলস ব্যবহৃত হয়।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'গুণগত রসায়ন',
            titleEn: 'Qualitative Chemistry',
            questions: [
              {
                q: 'হাইড্রোজেন পরমাণুর বামার সিরিজের বর্ণালী রেখা কোন অঞ্চলে দেখা যায়?',
                a: 'অতিবেগুনি (UV)',
                b: 'দৃশ্যমান (Visible)',
                c: 'অবলোহিত (IR)',
                d: 'এক্স-রে',
                ans: 'b',
                exp: 'লাইম্যান সিরিজ UV অঞ্চলে, বামার দৃশ্যমান অঞ্চলে এবং প্যাসচেন/ব্র্যাকেট/ফুন্ড IR অঞ্চলে গঠিত হয়।'
              },
              {
                q: 'Al³⁺ ক্যাটায়নের শনাক্তকরণে কোন বিকারক ব্যবহৃত হয়?',
                a: 'NaOH দ্রবণ',
                b: 'নেসলার বিকারক',
                c: 'বেরিয়াম নাইট্রেট',
                d: 'পটাশিয়াম ফেরোসায়ানাইড',
                ans: 'a',
                exp: 'Al³⁺ দ্রবণে NaOH যোগ করলে সাদা জেলির ন্যায় Al(OH)₃ অধঃক্ষেপ পড়ে যা অতিরিক্ত ক্ষারে দ্রবীভূত হয়।'
              },
              {
                q: 'অ্যালুমিনিয়াম ক্লোরাইডের জলীয় দ্রবণের প্রকৃতি কেমন?',
                a: 'ক্ষারীয়',
                b: 'অম্লীয়',
                c: 'নিরপেক্ষ',
                d: 'উভধর্মী',
                ans: 'b',
                exp: 'AlCl₃ পানির সাথে আর্দ্রবিশ্লেষিত হয়ে তীব্র HCl এসিড ও দুর্বল Al(OH)₃ উৎপন্ন করায় অম্লীয় হয়।'
              }
            ]
          },
          {
            num: 3,
            titleBn: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
            titleEn: 'Periodic Properties & Chemical Bonding',
            questions: [
              {
                q: 'কোন মৌলটির তড়িৎ ঋণাত্মকতা (Electronegativity) সর্বাধিক?',
                a: 'ক্লোরিন (Cl)',
                b: 'ফ্লোরিন (F)',
                c: 'অক্সিজেন (O)',
                d: 'নাইট্রোজেন (N)',
                ans: 'b',
                exp: 'পাউলিং স্কেলে ফ্লোরিনের তড়িৎ ঋণাত্মকতার মান সর্বোচ্চ (৪.০)।'
              },
              {
                q: 'পানি (H₂O) অণুতে কেন্দ্রীয় অক্সিজেন পরমাণুর সংকরণ (Hybridization) কী?',
                a: 'sp',
                b: 'sp²',
                c: 'sp³',
                d: 'dsp²',
                ans: 'c',
                exp: 'H₂O তে দুটি বন্ধন জোড় ও দুটি মুক্তজোড় ইলেকট্রন রয়েছে, ফলে সংকরণ sp³ এবং আকৃতি কৌণিক (১০৪.৫°)।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'রাসায়নিক পরিবর্তন',
            titleEn: 'Chemical Changes',
            questions: [
              {
                q: 'লা-শাতেলিয়ার নীতি প্রযোজ্য হয় কোন ক্ষেত্রে?',
                a: 'কেবল একমুখী বিক্রিয়ায়',
                b: 'সাম্যাবস্থায় থাকা উভমুখী বিক্রিয়ায়',
                c: 'কেবল তাপোৎপাদী বিক্রিয়ায়',
                d: 'সকল রাসায়নিক বিক্রিয়ায়',
                ans: 'b',
                exp: 'লা-শাতেলিয়ার নীতি শুধুমাত্র সাম্যাবস্থায় উপনীত উভমুখী প্রক্রিয়ার ক্ষেত্রে প্রযোজ্য।'
              },
              {
                q: 'মানুষের রক্তের স্বাভাবিক pH কত?',
                a: '6.4',
                b: '7.0',
                c: '7.4 (7.35 - 7.45)',
                d: '8.2',
                ans: 'c',
                exp: 'মানবদেহের রক্তের স্বাভাবিক পিএইচ ৭.৪ (সামান্য ক্ষারীয়) যা বাইকার্বনেট বাফার দ্বারা নিয়ন্ত্রিত হয়।'
              }
            ]
          },
          {
            num: 5,
            titleBn: 'কর্মমুখী রসায়ন',
            titleEn: 'Applied Chemistry',
            questions: [
              {
                q: 'ভিনেগারে অ্যাসিটিক অ্যাসিডের শতকরা পরিমাণ কত?',
                a: '2 - 4%',
                b: '6 - 10%',
                c: '15 - 20%',
                d: '40 - 50%',
                ans: 'b',
                exp: 'অ্যাসিটিক এসিডের (CH₃COOH) ৬-১০% জলীয় দ্রবণকে ভিনেগার বলে যা খাদ্য সংরক্ষক হিসেবে ব্যবহৃত হয়।'
              },
              {
                q: 'টয়লেট ক্লিনারের প্রধান সক্রিয় উপাদান কোনটি?',
                a: 'NaOH',
                b: 'HCl',
                c: 'NaCl',
                d: 'Na₂CO₃',
                ans: 'b',
                exp: 'টয়লেট ক্লিনারে সাধারণত কড়া অম্ল HCl ব্যবহৃত হয় যা দাগ ও ক্ষারীয় ময়লা দূর করে।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 3. HSC Higher Mathematics 1st Paper (উচ্চতর গণিত ১ম পত্র - NCTB)
      // =========================================================================
      {
        subjectPattern: 'Higher Mathematics 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'ম্যাট্রিক্স ও নির্ণায়ক',
            titleEn: 'Matrices and Determinants',
            questions: [
              {
                q: 'কোনো ম্যাট্রিক্স A এর জন্য Aᵀ = -A হলে তাকে কী ম্যাট্রিক্স বলে?',
                a: 'প্রতিসম ম্যাট্রিক্স',
                b: 'বিপ্রতিসম (Skew-symmetric) ম্যাট্রিক্স',
                c: 'অভেদক ম্যাট্রিক্স',
                d: 'ব্যতিক্রমী ম্যাট্রিক্স',
                ans: 'b',
                exp: 'Aᵀ = -A হলে তা বক্র-প্রতিসম বা বিপ্রতিসম ম্যাট্রিক্স এবং এর মুখ্য কর্ণের সকল ভুক্তি শূন্য হয়।'
              },
              {
                q: 'ম্যাট্রিক্স A এর নির্ণায়কের মান |A| = 0 হলে A কে কী ধরনের ম্যাট্রিক্স বলা হয়?',
                a: 'ব্যতিক্রমী (Singular) ম্যাট্রিক্স',
                b: 'অব্যতিক্রমী ম্যাট্রিক্স',
                c: 'কর্ণ ম্যাট্রিক্স',
                d: 'আইডেমপোটেন্ট ম্যাট্রিক্স',
                ans: 'a',
                exp: 'নির্ণায়ক শূন্য হলে ম্যাট্রিক্সটি ব্যতিক্রমী হয় এবং এর বিপরীত ম্যাট্রিক্স (A⁻¹) বিদ্যমান থাকে না।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'ভেক্টর',
            titleEn: 'Vectors in Math',
            questions: [
              {
                q: 'i^ × j^ এর মান কত?',
                a: '0',
                b: 'k^',
                c: '-k^',
                d: '1',
                ans: 'b',
                exp: 'ডানহাতি কর্ক-স্ক্রু নিয়ম অনুযায়ী একক ভেক্টরের ক্রস গুণনে i^ × j^ = k^।'
              }
            ]
          },
          {
            num: 3,
            titleBn: 'সরলরেখা',
            titleEn: 'Straight Lines',
            questions: [
              {
                q: 'দুটি পরস্পর লম্ব সরলরেখার ঢালদ্বয় m₁ ও m₂ হলে তাদের সম্পর্ক কী?',
                a: 'm₁ = m₂',
                b: 'm₁ · m₂ = -1',
                c: 'm₁ · m₂ = 1',
                d: 'm₁ + m₂ = 0',
                ans: 'b',
                exp: 'পরস্পর লম্ব রেখার ঢালদ্বয়ের গুণফল m₁·m₂ = -1।'
              },
              {
                q: 'মূলবিন্দু থেকে 3x + 4y = 10 রেখার লম্ব দূরত্ব কত একক?',
                a: '১',
                b: '২',
                c: '৫',
                d: '১০',
                ans: 'b',
                exp: 'd = |3(0) + 4(0) - 10| / √(3² + 4²) = 10 / 5 = 2 একক।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'বৃত্ত',
            titleEn: 'Circles',
            questions: [
              {
                q: 'x² + y² - 4x + 6y - 12 = 0 বৃত্তের কেন্দ্রের স্থানাঙ্ক কত?',
                a: '(2, -3)',
                b: '(-2, 3)',
                c: '(4, -6)',
                d: '(-4, 6)',
                ans: 'a',
                exp: 'সাধারণ সমীকরণ x² + y² + 2gx + 2fy + c = 0 এ কেন্দ্র (-g, -f)। এখানে 2g = -4 => g = -2, 2f = 6 => f = 3। কেন্দ্র (2, -3)।'
              }
            ]
          },
          {
            num: 5,
            titleBn: 'বিন্যাস ও সমাবেশ',
            titleEn: 'Permutations and Combinations',
            questions: [
              {
                q: 'ⁿCᵣ + ⁿCᵣ₋₁ এর মান কত?',
                a: 'ⁿ⁺¹Cᵣ',
                b: 'ⁿ⁺¹Cᵣ₊₁',
                c: 'ⁿCᵣ₊₁',
                d: '²ⁿCᵣ',
                ans: 'a',
                exp: 'প্যাসকেলের সূত্র: ⁿCᵣ + ⁿCᵣ₋₁ = ⁿ⁺¹Cᵣ।'
              }
            ]
          },
          {
            num: 9,
            titleBn: 'অন্তরীকরণ',
            titleEn: 'Differentiation',
            questions: [
              {
                q: 'd/dx (ln x) এর মান কত?',
                a: 'x',
                b: '1 / x',
                c: 'eˣ',
                d: '1 / x²',
                ans: 'b',
                exp: 'লগারিদমিক ফাংশন ln x এর অন্তরজ 1/x।'
              },
              {
                q: 'lim (x→0) (sin x / x) এর মান কত?',
                a: '0',
                b: '1',
                c: 'অসীম',
                d: '-1',
                ans: 'b',
                exp: 'মৌলিক সীমা উপপাদ্য অনুযায়ী lim (x→0) (sin x / x) = 1।'
              }
            ]
          },
          {
            num: 10,
            titleBn: 'যোগজীকরণ',
            titleEn: 'Integration',
            questions: [
              {
                q: '∫ e^(2x) dx এর মান কত?',
                a: 'e^(2x) + c',
                b: '½ e^(2x) + c',
                c: '2 e^(2x) + c',
                d: 'e^x + c',
                ans: 'b',
                exp: '∫ e^(ax) dx = (1/a) e^(ax) + c। এখানে a = 2 হওয়ায় উত্তর ½ e^(2x) + c।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 4. HSC Biology 1st Paper (Botany - উদ্ভিদবিজ্ঞান - NCTB)
      // =========================================================================
      {
        subjectPattern: 'Biology 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'কোষ ও এর গঠন',
            titleEn: 'Cell and its Structure',
            questions: [
              {
                q: 'কোষের শক্তিঘর (Power House of Cell) কাকে বলা হয়?',
                a: 'মাইটোকন্ড্রিয়া',
                b: 'রাইবোসোম',
                c: 'গলগি বস্তু',
                d: 'লাইসোসোম',
                ans: 'a',
                exp: 'শ্বসনের ক্রেবস চক্র এবং অক্সিডেটিভ ফসফোরাইলেশনে এটি ATP তৈরি করায় মাইটোকন্ড্রিয়াকে শক্তিঘর বলে।'
              },
              {
                q: 'কোষে প্রোটিন তৈরির কারখানা কোনটি?',
                a: 'রাইবোসোম',
                b: 'ক্লোরোপ্লাস্ট',
                c: 'লাইসোজোম',
                d: 'সেন্ট্রোসোম',
                ans: 'a',
                exp: 'রাইবোসোম প্রোটিন সংশ্লেষণের প্রধান কেন্দ্র হিসেবে কাজ করে।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'কোষ বিভাজন',
            titleEn: 'Cell Division',
            questions: [
              {
                q: 'মিয়োসিস কোষ বিভাজনের কোন উপপর্যায়ে ক্রসিং ওভার ঘটে?',
                a: 'লেপ্টোটিন',
                b: 'জাইগোটিন',
                c: 'প্যাকাইটিন',
                d: 'ডিপ্লোটিন',
                ans: 'c',
                exp: 'প্রোফেজ-১ এর প্যাকাইটিন দশায় নন-সিস্টার ক্রোমাটিডের মধ্যে অংশের বিনিময় বা ক্রসিং ওভার সম্পন্ন হয়।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'অণুজীব',
            titleEn: 'Microorganisms',
            questions: [
              {
                q: 'ভাইরাসকে জীব ও জড়ের মধ্যবর্তী সেতুবন্ধন বলার কারণ কী?',
                a: 'কোষীয় অঙ্গাণু থাকে না কিন্তু জীবদেহের ভেতরে বংশবৃদ্ধি করতে পারে',
                b: 'কেবলমাত্র ডিএনএ থাকে',
                c: 'ব্যাকটেরিয়া ধ্বংস করে',
                d: 'অটোট্রফিক',
                ans: 'a',
                exp: 'পোষকদেহের বাইরে ভাইরাস সম্পূর্ণ অকোষীয় ও নিষ্ক্রিয়, কিন্তু ভেতরে এরা সক্রিয়ভাবে বংশবৃদ্ধি করে।'
              }
            ]
          },
          {
            num: 9,
            titleBn: 'উদ্ভিদ শারীরতত্ত্ব',
            titleEn: 'Plant Physiology',
            questions: [
              {
                q: 'সালোকসংশ্লেষণের আলোক পর্যায়ে পানির ভাঙনকে কী বলে?',
                a: 'গ্লাইকোলাইসিস',
                b: 'ফটোলাইসিস',
                c: 'অসমোসিস',
                d: 'ফসফোরাইলেশন',
                ans: 'b',
                exp: 'আলোর উপস্থিতিতে পানির বিভাজনকে পানির ফটোলাইসিস বলা হয়।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 5. HSC Information and Communication Technology (ICT)
      // =========================================================================
      {
        subjectPattern: 'Information and Communication Technology',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
            titleEn: 'Information and Communication Technology: Global & BD Context',
            questions: [
              {
                q: 'ব্যক্তির শরীরের গঠন বা আচরণগত বৈশিষ্ট্যের ওপর ভিত্তি করে শনাক্তকরণ পদ্ধতিকে কী বলে?',
                a: 'বায়োইনফরমেটিক্স',
                b: 'বায়োমেট্রিক্স',
                c: 'ন্যানোটেকনোলজি',
                d: 'জেনেটিক ইঞ্জিনিয়ারিং',
                ans: 'b',
                exp: 'আঙুলের ছাপ, রেটিনা স্ক্যান ইত্যাদির মাধ্যমে শনাক্তকরণ পদ্ধতিকে বায়োমেট্রিক্স বলে।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
            titleEn: 'Communication Systems & Networking',
            questions: [
              {
                q: 'ক্লাউড কম্পিউটিং-এর মূল সুবিধা কোনটি?',
                a: 'ভাড়ার ভিত্তিতে ইন্টারনেট মারফত রিসোর্স ব্যবহার',
                b: 'কেবলমাত্র একক কম্পিউটারে চলে',
                c: 'বিনামূল্যে হার্ডওয়্যার প্রদান',
                d: 'ইন্টারনেট প্রয়োজন হয় না',
                ans: 'a',
                exp: 'ক্লাউড কম্পিউটিং চাহিদা অনুযায়ী ইন্টারনেটের মাধ্যমে সার্ভার, স্টোরেজ ও সফটওয়্যার সেবা প্রদান করে।'
              }
            ]
          },
          {
            num: 3,
            titleBn: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
            titleEn: 'Number Systems & Digital Devices',
            questions: [
              {
                q: 'হেক্সাডেসিমেল সংখ্যা পদ্ধতিতে ভিত্তি (Base) কত?',
                a: '২',
                b: '৮',
                c: '১০',
                d: '১৬',
                ans: 'd',
                exp: 'হেক্সাডেসিমেলে মোট ১৬টি প্রতীক (0-9 এবং A-F) ব্যবহৃত হয়।'
              },
              {
                q: 'কোন লজিক গেইটটিকে সার্বজনীন গেইট (Universal Gate) বলা হয়?',
                a: 'AND গেইট',
                b: 'NAND গেইট',
                c: 'OR গেইট',
                d: 'NOT গেইট',
                ans: 'b',
                exp: 'NAND এবং NOR গেইট দিয়ে যেকোনো মৌলিক গেইট বাস্তবায়ন সম্ভব হওয়ায় এদের সার্বজনীন গেইট বলে।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'ওয়েব ডিজাইন পরিচিতি এবং HTML',
            titleEn: 'Web Design Intro & HTML',
            questions: [
              {
                q: 'HTML এ হাইপারলিংক তৈরির জন্য কোন ট্যাগটি ব্যবহৃত হয়?',
                a: '<a>',
                b: '<link>',
                c: '<href>',
                d: '<url>',
                ans: 'a',
                exp: 'অ্যাঙ্কর ট্যাগ <a> এর href অ্যাট্রিবিউট দিয়ে হাইপারলিংক তৈরি করা হয়।'
              }
            ]
          },
          {
            num: 5,
            titleBn: 'প্রোগ্রামিং ভাষা (C Programming)',
            titleEn: 'Programming Language (C)',
            questions: [
              {
                q: 'C ভাষায় পূর্ণসংখ্যার জন্য কোন ডেটা টাইপটি ব্যবহৃত হয়?',
                a: 'float',
                b: 'char',
                c: 'int',
                d: 'double',
                ans: 'c',
                exp: 'int টাইপ পূর্ণসংখ্যার (integer) জন্য ব্যবহৃত হয়।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 6. HSC Accounting 1st Paper (হিসাববিজ্ঞান ১ম পত্র - Commerce)
      // =========================================================================
      {
        subjectPattern: 'Accounting 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'হিসাববিজ্ঞান পরিচিতি',
            titleEn: 'Introduction to Accounting',
            questions: [
              {
                q: 'মৌলিক হিসাব সমীকরণ কোনটি?',
                a: 'A = L + OE (সম্পদ = দায় + মালিকানাস্বত্ব)',
                b: 'A = L - OE',
                c: 'L = A + OE',
                d: 'OE = A + L',
                ans: 'a',
                exp: 'Assets = Liabilities + Owner\'s Equity হিসাবের মৌলিক দ্বৈত সত্ত্বা প্রদর্শন করে।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'হিসাবের বইসমূহ',
            titleEn: 'Books of Accounts',
            questions: [
              {
                q: 'হিসাবের পাকা বই বা প্রধান বই কাকে বলা হয়?',
                a: 'জাবেদা',
                b: 'খতিয়ান (Ledger)',
                c: 'রেওয়ামিল',
                d: 'নগদান বই',
                ans: 'b',
                exp: 'খতিয়ানকে হিসাবের স্থায়ী বা পাকা বই এবং সকল বইয়ের রাজা বলা হয়।'
              }
            ]
          },
          {
            num: 4,
            titleBn: 'রেওয়ামিল',
            titleEn: 'Trial Balance',
            questions: [
              {
                q: 'রেওয়ামিলের উদ্দেশ্য কী?',
                a: 'গাণিতিক নির্ভুলতা যাচাই করা',
                b: 'নিট লাভ নির্ণয় করা',
                c: 'কর নির্ধারণ করা',
                d: 'নগদ উদ্বৃত্ত জানা',
                ans: 'a',
                exp: 'খতিয়ান উদ্বৃত্তগুলোর ডেবিট ও ক্রেডিট সমতার মাধ্যমে হিসাবের গাণিতিক শুদ্ধতা যাচাই করাই রেওয়ামিলের কাজ।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 7. HSC Economics 1st Paper (অর্থনীতি ১ম পত্র - Humanities)
      // =========================================================================
      {
        subjectPattern: 'Economics 1st Paper',
        curriculum: 'bangla',
        level: 'hsc',
        chapters: [
          {
            num: 1,
            titleBn: 'মৌলিক অর্থনৈতিক সমস্যা এবং এর সমাধান',
            titleEn: 'Basic Economic Problems & Solutions',
            questions: [
              {
                q: 'অর্থনীতির মূল চালিকা শক্তি ও সমস্যার প্রধান উৎস কী?',
                a: 'অফুরন্ত সম্পদ',
                b: 'দুষ্প্রাপ্যতা ও অসীম অভাব',
                c: 'মুদ্রাস্ফীতি',
                d: 'ব্যাংকিং সংকট',
                ans: 'b',
                exp: 'সীমিত বা দুষ্প্রাপ্য সম্পদের সাহায্যে মানুষের অসীম অভাব মেটানোর প্রচেষ্টাই অর্থনীতির মূল সমস্যা।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'ভোক্তা ও উৎপাদকের আচরণ (চাহিদা ও যোগান)',
            titleEn: 'Consumer and Producer Behavior',
            questions: [
              {
                q: 'সাধারণ দ্রব্যের ক্ষেত্রে দাম বাড়লে চাহিদার কী ঘটে?',
                a: 'চাহিদা বৃদ্ধি পায়',
                b: 'চাহিদা হ্রাস পায়',
                c: 'চাহিদা অপরিবর্তিত থাকে',
                d: 'শূন্য হয়',
                ans: 'b',
                exp: 'চাহিদা বিধি অনুযায়ী দাম বাড়লে চাহিদা কমে এবং দাম কমলে চাহিদা বাড়ে।'
              }
            ]
          }
        ]
      },

      // =========================================================================
      // 8. SSC Physics (পদার্থবিজ্ঞান - SSC Bangla)
      // =========================================================================
      {
        subjectPattern: 'SSC Physics',
        curriculum: 'bangla',
        level: 'ssc',
        chapters: [
          {
            num: 1,
            titleBn: 'ভৌত রাশি ও পরিমাপ',
            titleEn: 'Physical Quantities and Measurement',
            questions: [
              {
                q: 'এসআই (SI) পদ্ধতিতে তাপমাত্রার একক কী?',
                a: 'ডিগ্রি সেলসিয়াস',
                b: 'কেলভিন (K)',
                c: 'ফারেনহাইট',
                d: 'ক্যালোরি',
                ans: 'b',
                exp: 'আন্তর্জাতিক পদ্ধতিতে তাপমাত্রার একক কেলভিন (K)।'
              }
            ]
          },
          {
            num: 2,
            titleBn: 'গতি',
            titleEn: 'Motion',
            questions: [
              {
                q: 'স্থির অবস্থান হতে সুষম ত্বরণে চলমান বস্তুর সরণ (s) সময়ের (t) সাথে কীভাবে সম্পর্কিত?',
                a: 's ∝ t',
                b: 's ∝ t²',
                c: 's ∝ √t',
                d: 's ∝ 1/t',
                ans: 'b',
                exp: 'u = 0 হলে s = ½ at², অর্থাৎ দূরত্ব সময়ের বর্গের সমানুপাতিক।'
              }
            ]
          },
          {
            num: 3,
            titleBn: 'বল',
            titleEn: 'Force',
            questions: [
              {
                q: 'বস্তুর জড়তা (Inertia) কিসের ওপর নির্ভর করে?',
                a: 'বেগ',
                b: 'ভর (Mass)',
                c: 'আকার',
                d: 'ত্বরণ',
                ans: 'b',
                exp: 'ভর হলো জড়তার পরিমাপ। যে বস্তুর ভর যত বেশি তার জড়তা তত বেশি।'
              }
            ]
          }
        ]
      }
    ];

    let totalChaptersInserted = 0;
    let totalExamsInserted = 0;
    let totalQuestionsInserted = 0;

    for (const item of subjectChaptersData) {
      // Find matching subject
      const subRes = await client.query(
        `SELECT id, name, name_bn FROM subjects 
         WHERE name ILIKE $1 AND curriculum_version = $2 AND academic_level = $3 LIMIT 1`,
        [`%${item.subjectPattern}%`, item.curriculum, item.level]
      );

      if (subRes.rowCount === 0 || !subRes.rows[0]) {
        console.log(`⚠️ Subject not found for pattern: ${item.subjectPattern} (${item.curriculum}/${item.level})`);
        continue;
      }

      const subjectId = subRes.rows[0].id;
      const subjectName = subRes.rows[0].name;
      const subjectNameBn = subRes.rows[0].name_bn;

      for (const ch of item.chapters) {
        // Upsert Chapter
        let chapterId: string;
        const existCh = await client.query(
          `SELECT id FROM chapters WHERE subject_id = $1 AND chapter_number = $2`,
          [subjectId, ch.num]
        );

        if (existCh.rowCount && existCh.rows[0]) {
          chapterId = existCh.rows[0].id;
          await client.query(
            `UPDATE chapters SET title = $1, title_bn = $2, serial_number = $3 WHERE id = $4`,
            [ch.titleEn, ch.titleBn, ch.num, chapterId]
          );
        } else {
          const newCh = await client.query(
            `INSERT INTO chapters (subject_id, chapter_number, title, title_bn, serial_number)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [subjectId, ch.num, ch.titleEn, ch.titleBn, ch.num]
          );
          chapterId = newCh.rows[0].id;
          totalChaptersInserted++;
        }

        // Create Chapter Model Test Exam
        const examTitle = `অধ্যায় ${ch.num}: ${ch.titleBn} (মডেল টেস্ট)`;
        const existExam = await client.query(
          `SELECT id FROM exams WHERE subject_id = $1 AND chapter_id = $2 LIMIT 1`,
          [subjectId, chapterId]
        );

        let examId: string;
        if (existExam.rowCount && existExam.rows[0]) {
          examId = existExam.rows[0].id;
        } else {
          const newExam = await client.query(
            `INSERT INTO exams (
              subject_id, chapter_id, title, serial_number, duration_minutes, 
              total_marks, negative_mark, instructions, is_published, 
              curriculum_version, academic_level, exam_type
            ) VALUES (
              $1, $2, $3, $4, 20, $5, 0.25, 
              'এই অধ্যায়ের গুরুত্বপূর্ণ প্রশ্নের সমন্বয়ে তৈরি মডেল টেস্ট। প্রতিটি সঠিক উত্তরে ১ নম্বর, ভুলের জন্য ০.২৫ নম্বর কাটা যাবে।',
              TRUE, $6, $7, 'model_test'
            ) RETURNING id`,
            [subjectId, chapterId, examTitle, ch.num, ch.questions.length, item.curriculum, item.level]
          );
          examId = newExam.rows[0].id;
          totalExamsInserted++;
        }

        // Insert Questions for this exam if not already added
        const qCount = await client.query(`SELECT count(*) FROM questions WHERE exam_id = $1`, [examId]);
        if (parseInt(qCount.rows[0].count, 10) === 0 && ch.questions.length > 0) {
          for (let qIdx = 0; qIdx < ch.questions.length; qIdx++) {
            const q = ch.questions[qIdx];
            await client.query(
              `INSERT INTO questions (
                exam_id, question_text, option_a, option_b, option_c, option_d,
                correct_option, explanation, serial_number
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [examId, q.q, q.a, q.b, q.c, q.d, q.ans, q.exp, qIdx + 1]
            );
            totalQuestionsInserted++;
          }
        }
      }
    }

    // Automatically seed generic standard chapters for any other subjects that don't have chapters yet
    const allSubjects = await client.query(`SELECT id, name, name_bn, curriculum_version, academic_level FROM subjects`);
    for (const sub of allSubjects.rows) {
      const existingChCount = await client.query(`SELECT count(*) FROM chapters WHERE subject_id = $1`, [sub.id]);
      if (parseInt(existingChCount.rows[0].count, 10) === 0) {
        // Create 3 standard chapters for this subject
        for (let i = 1; i <= 3; i++) {
          const chTitleBn = `অধ্যায় ০${i}: মূল ধারণা ও অনুশীলন`;
          const chTitleEn = `Chapter ${i}: Core Concepts & Practice`;
          const newCh = await client.query(
            `INSERT INTO chapters (subject_id, chapter_number, title, title_bn, serial_number)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [sub.id, i, chTitleEn, chTitleBn, i]
          );
          const chId = newCh.rows[0].id;
          totalChaptersInserted++;

          // Create model test
          const examTitle = `অধ্যায় ০${i}: মডেল টেস্ট ০১ (${sub.name_bn || sub.name})`;
          const newExam = await client.query(
            `INSERT INTO exams (
              subject_id, chapter_id, title, serial_number, duration_minutes, 
              total_marks, negative_mark, instructions, is_published, 
              curriculum_version, academic_level, exam_type
            ) VALUES (
              $1, $2, $3, $4, 15, 5, 0.25,
              'অধ্যায়ভিত্তিক প্রস্তুতিমূলক পরীক্ষা।',
              TRUE, $5, $6, 'model_test'
            ) RETURNING id`,
            [sub.id, chId, examTitle, i, sub.curriculum_version, sub.academic_level]
          );
          const examId = newExam.rows[0].id;
          totalExamsInserted++;

          // Seed 3 practice questions
          await client.query(
            `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, serial_number)
             VALUES 
             ($1, $2 || ' সংক্রান্ত প্রথম মৌলিক নিয়ম কোনটি?', 'নিয়ম ক', 'নিয়ম খ', 'নিয়ম গ', 'সবকটি', 'd', 'পাঠ্যবইয়ের সংশ্লিষ্ট অনুচ্ছেদ দ্রষ্টব্য।', 1),
             ($1, 'নিচের কোনটি সঠিক সম্পর্ক প্রকাশ করে?', 'ক > খ', 'ক = খ', 'ক < খ', 'কোনটিই নয়', 'b', 'তত্ত্বীয় সূত্রানুসারে উভয় রাশি সমমানের।', 2),
             ($1, 'পরীক্ষামূলক বিশ্লেষণে প্রাপ্ত ফলাফল কোনটির সাথে সংগতিপূর্ণ?', 'প্রমাণ মান', 'গড় মান', 'সর্বোচ্চ মান', 'সর্বনিম্ন মান', 'a', 'যথাযথ শর্তে প্রমাণ মানের অনুরূপ ফলাফল পাওয়া যায়।', 3)`,
            [examId, sub.name_bn || sub.name]
          );
          totalQuestionsInserted += 3;
        }
      }
    }

    console.log(`✅ Seeded Subject Chapters: ${totalChaptersInserted} chapters, ${totalExamsInserted} exams, ${totalQuestionsInserted} questions.`);
  } catch (err) {
    console.error('❌ Error seeding subject chapters:', err);
  } finally {
    client.release();
  }
};
