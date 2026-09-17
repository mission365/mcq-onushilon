import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Enable uuid extension if available
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        google_id VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        email_verified_at TIMESTAMPTZ,
        curriculum_version VARCHAR(20) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Schema updates for existing databases
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_version VARCHAR(20) DEFAULT NULL;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_level VARCHAR(20) DEFAULT 'hsc';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stream VARCHAR(20) DEFAULT 'science';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_curriculum VARCHAR(20);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMPTZ;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;`);

    // 2. Subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        unlock_price NUMERIC(10, 2) DEFAULT 299,
        curriculum_version VARCHAR(20) DEFAULT 'bangla',
        academic_level VARCHAR(20) DEFAULT 'hsc',
        stream VARCHAR(20) DEFAULT 'common',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS curriculum_version VARCHAR(20) DEFAULT 'bangla';`);
    await client.query(`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS academic_level VARCHAR(20) DEFAULT 'hsc';`);
    await client.query(`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS stream VARCHAR(20) DEFAULT 'common';`);

    // 3. Payment settings table (singleton)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        bkash_number VARCHAR(50),
        bkash_account_name VARCHAR(255),
        nagad_number VARCHAR(50) DEFAULT '01800000000',
        nagad_account_name VARCHAR(255) DEFAULT 'MCQ Onushilon (Personal)',
        price_bangla NUMERIC(10, 2) DEFAULT 499,
        price_english NUMERIC(10, 2) DEFAULT 699,
        price_british NUMERIC(10, 2) DEFAULT 1200,
        price_ib NUMERIC(10, 2) DEFAULT 1500,
        payment_instructions TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS nagad_number VARCHAR(50) DEFAULT '01800000000';`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS nagad_account_name VARCHAR(255) DEFAULT 'MCQ Onushilon (Personal)';`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS price_bangla NUMERIC(10, 2) DEFAULT 499;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS price_english NUMERIC(10, 2) DEFAULT 699;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS price_british NUMERIC(10, 2) DEFAULT 1200;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS price_ib NUMERIC(10, 2) DEFAULT 1500;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS original_price_bangla NUMERIC(10, 2) DEFAULT 999;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS original_price_english NUMERIC(10, 2) DEFAULT 1299;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS original_price_british NUMERIC(10, 2) DEFAULT 2000;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS original_price_ib NUMERIC(10, 2) DEFAULT 2500;`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS discount_title VARCHAR(255) DEFAULT 'সীমিত সময়ের মেগা অফার!';`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS discount_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days');`);
    await client.query(`ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS discount_active BOOLEAN DEFAULT TRUE;`);

    // Ensure default row exists
    await client.query(`
      INSERT INTO payment_settings (id, bkash_number, bkash_account_name, nagad_number, nagad_account_name, price_bangla, price_english, price_british, price_ib, payment_instructions)
      VALUES (
        'default',
        '01700000000',
        'MCQ Onushilon (Personal)',
        '01800000000',
        'MCQ Onushilon (Personal)',
        499,
        699,
        1200,
        1500,
        '১. উপরে প্রদর্শিত বিকাশ বা নগদ পার্সোনাল নম্বরে সেন্ড মানি (Send Money) করুন।\n২. পেমেন্ট সম্পন্ন হওয়ার পর প্রাপ্ত Transaction ID (TrxID) সংরক্ষণ করুন।\n৩. নিচে আপনার প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন। অ্যাডমিন অনুমোদনের সাথে সাথে আনলিমিটেড এক্সেস চালু হবে।'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Exams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        serial_number INTEGER NOT NULL DEFAULT 1,
        duration_minutes INTEGER NOT NULL DEFAULT 30,
        total_marks INTEGER NOT NULL DEFAULT 25,
        negative_mark NUMERIC(5, 2) DEFAULT 0.25,
        instructions TEXT,
        is_published BOOLEAN DEFAULT FALSE,
        curriculum_version VARCHAR(20) DEFAULT 'bangla',
        academic_level VARCHAR(20) DEFAULT 'hsc',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS curriculum_version VARCHAR(20) DEFAULT 'bangla';`);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS academic_level VARCHAR(20) DEFAULT 'hsc';`);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50) DEFAULT 'model_test';`);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS board_name VARCHAR(100);`);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_year INTEGER;`);

    // 4.1 Chapters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        chapter_number INTEGER NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        title_bn VARCHAR(255) NOT NULL,
        description TEXT,
        serial_number INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);`);
    await client.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_exams_chapter_id ON exams(chapter_id);`);

    // 5. Questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        stimulus TEXT,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option VARCHAR(1) NOT NULL,
        explanation TEXT,
        serial_number INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Subject Access table (unlocked subjects per user)
    await client.query(`
      CREATE TABLE IF NOT EXISTS subject_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'BDT',
        gateway VARCHAR(50) DEFAULT 'bkash',
        payment_method VARCHAR(50) DEFAULT 'manual',
        trx_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        unlocked_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, subject_id)
      );
    `);

    // 7. Attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        score NUMERIC(8, 2) DEFAULT 0,
        total_attempted INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        started_at TIMESTAMPTZ DEFAULT NOW(),
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Attempt answers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attempt_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        selected_option VARCHAR(1),
        is_correct BOOLEAN DEFAULT FALSE
      );
    `);

    // 9. Manual payment requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS manual_payment_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        subject_name VARCHAR(255),
        gateway VARCHAR(50) DEFAULT 'bkash',
        payment_method VARCHAR(50) DEFAULT 'manual',
        amount NUMERIC(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'BDT',
        sender_bkash_number VARCHAR(50),
        receiver_bkash_number VARCHAR(50),
        receiver_name VARCHAR(255),
        transaction_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'submitted',
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE manual_payment_requests ALTER COLUMN subject_id DROP NOT NULL;`);
    await client.query(`ALTER TABLE manual_payment_requests ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'curriculum_subscription';`);
    await client.query(`ALTER TABLE manual_payment_requests ADD COLUMN IF NOT EXISTS curriculum_version VARCHAR(20) DEFAULT 'bangla';`);
    await client.query(`ALTER TABLE manual_payment_requests ADD COLUMN IF NOT EXISTS sender_number VARCHAR(50);`);

    // 10. Payment sessions table (automated bKash)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        subject_name VARCHAR(255),
        amount NUMERIC(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'BDT',
        merchant_invoice_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        bkash_payment_id VARCHAR(100),
        bkash_url TEXT,
        callback_url TEXT,
        callback_status VARCHAR(50),
        transaction_status VARCHAR(100),
        trx_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        finalized_at TIMESTAMPTZ
      );
    `);

    // 11. Password reset OTPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        email VARCHAR(255) PRIMARY KEY,
        code_hash VARCHAR(255),
        expires_at_ms BIGINT,
        last_requested_at_ms BIGINT,
        reset_token_hash VARCHAR(255),
        reset_token_expires_at_ms BIGINT,
        verify_attempts INTEGER DEFAULT 0
      );
    `);

    // 12. Email verification OTPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verification_otps (
        email VARCHAR(255) PRIMARY KEY,
        code_hash VARCHAR(255) NOT NULL,
        expires_at_ms BIGINT NOT NULL,
        last_requested_at_ms BIGINT NOT NULL,
        verify_attempts INTEGER DEFAULT 0
      );
    `);

    // Seed default admin user: sajibuddin@gmail.com / sajib12345678
    const adminEmail = 'sajibuddin@gmail.com';
    const adminRes = await client.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);
    if (adminRes.rowCount === 0) {
      const passwordHash = await bcrypt.hash('sajib12345678', 10);
      await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_verified, email_verified_at)
         VALUES ($1, $2, $3, 'admin', TRUE, NOW())`,
        [adminEmail, passwordHash, 'Sajib Uddin']
      );
      console.log('✅ Default admin user seeded: sajibuddin@gmail.com');
    } else {
      // Ensure role is admin and is verified
      await client.query(
        `UPDATE users SET role = 'admin', is_verified = TRUE, email_verified_at = NOW() WHERE email = $1`,
        [adminEmail]
      );
    }

    // Seed comprehensive subjects for HSC and SSC (Science, Commerce, Arts/Humanities, Common, and Optional)
    const initialSubjects = [
      // ================= HSC (বাংলা ভার্সন) =================
      // Compulsory Subjects (আবশ্যিক বিষয় - সবার জন্য)
      { name: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র', icon: 'BookOpen', price: 0, curriculum: 'bangla', level: 'hsc', stream: 'common' },
      { name: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র', icon: 'BookMarked', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'common' },
      { name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', icon: 'Languages', price: 0, curriculum: 'bangla', level: 'hsc', stream: 'common' },
      { name: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র', icon: 'Languages', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'common' },
      { name: 'Information and Communication Technology (ICT)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি)', icon: 'Laptop', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'common' },

      // 1. Science (বিজ্ঞান শাখা)
      { name: 'Physics 1st Paper', nameBn: 'পদার্থবিজ্ঞান ১ম পত্র', icon: 'Zap', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Physics 2nd Paper', nameBn: 'পদার্থবিজ্ঞান ২য় পত্র', icon: 'Zap', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Chemistry 1st Paper', nameBn: 'রসায়ন ১ম পত্র', icon: 'FlaskConical', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Chemistry 2nd Paper', nameBn: 'রসায়ন ২য় পত্র', icon: 'FlaskConical', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Higher Mathematics 1st Paper', nameBn: 'উচ্চতর গণিত ১ম পত্র', icon: 'Calculator', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Higher Mathematics 2nd Paper', nameBn: 'উচ্চতর গণিত ২য় পত্র', icon: 'Calculator', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Biology 1st Paper (Botany)', nameBn: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)', icon: 'Dna', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },
      { name: 'Biology 2nd Paper (Zoology)', nameBn: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)', icon: 'Dna', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'science' },

      // 2. Commerce / Business Studies (ব্যবসায় শিক্ষা শাখা)
      { name: 'Accounting 1st Paper', nameBn: 'হিসাববিজ্ঞান ১ম পত্র', icon: 'PieChart', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Accounting 2nd Paper', nameBn: 'হিসাববিজ্ঞান ২য় পত্র', icon: 'PieChart', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Business Organization & Management 1st Paper', nameBn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', icon: 'Briefcase', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Business Organization & Management 2nd Paper', nameBn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', icon: 'Briefcase', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Finance, Banking & Insurance 1st Paper', nameBn: 'ফিন্যান্স, ব্যাংকিং ও বীমা ১ম পত্র', icon: 'Coins', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Finance, Banking & Insurance 2nd Paper', nameBn: 'ফিন্যান্স, ব্যাংকিং ও বীমা ২য় পত্র', icon: 'Coins', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Production Management & Marketing 1st Paper', nameBn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র', icon: 'TrendingUp', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },
      { name: 'Production Management & Marketing 2nd Paper', nameBn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র', icon: 'TrendingUp', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'commerce' },

      // 3. Arts / Humanities (মানবিক শাখা)
      { name: 'Civics & Good Governance 1st Paper', nameBn: 'পৌরনীতি ও সুশাসন ১ম পত্র', icon: 'Shield', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Civics & Good Governance 2nd Paper', nameBn: 'পৌরনীতি ও সুশাসন ২য় পত্র', icon: 'Shield', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'History 1st Paper', nameBn: 'ইতিহাস ১ম পত্র', icon: 'History', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'History 2nd Paper', nameBn: 'ইতিহাস ২য় পত্র', icon: 'History', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'History of Islam & Culture 1st Paper', nameBn: 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র', icon: 'History', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'History of Islam & Culture 2nd Paper', nameBn: 'ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র', icon: 'History', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Geography 1st Paper', nameBn: 'ভূগোল ১ম পত্র', icon: 'Globe', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Geography 2nd Paper', nameBn: 'ভূগোল ২য় পত্র', icon: 'Globe', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Economics 1st Paper', nameBn: 'অর্থনীতি ১ম পত্র', icon: 'BarChart3', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Economics 2nd Paper', nameBn: 'অর্থনীতি ২য় পত্র', icon: 'BarChart3', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Logic 1st Paper', nameBn: 'যুক্তিবিদ্যা ১ম পত্র', icon: 'HelpCircle', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Logic 2nd Paper', nameBn: 'যুক্তিবিদ্যা ২য় পত্র', icon: 'HelpCircle', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Sociology 1st Paper', nameBn: 'সমাজবিজ্ঞান ১ম পত্র', icon: 'Users', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Sociology 2nd Paper', nameBn: 'সমাজবিজ্ঞান ২য় পত্র', icon: 'Users', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Social Work 1st Paper', nameBn: 'সমাজকর্ম ১ম পত্র', icon: 'HeartHandshake', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },
      { name: 'Social Work 2nd Paper', nameBn: 'সমাজকর্ম ২য় পত্র', icon: 'HeartHandshake', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'humanities' },

      // HSC Common 4th / Optional (ঐচ্ছিক বিষয়)
      { name: 'Agriculture Studies 1st Paper', nameBn: 'কৃষি শিক্ষা ১ম পত্র', icon: 'Sprout', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Agriculture Studies 2nd Paper', nameBn: 'কৃষি শিক্ষা ২য় পত্র', icon: 'Sprout', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Home Science 1st Paper', nameBn: 'গার্হস্থ্য বিজ্ঞান ১ম পত্র', icon: 'BookOpen', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Home Science 2nd Paper', nameBn: 'গার্হস্থ্য বিজ্ঞান ২য় পত্র', icon: 'BookOpen', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Statistics 1st Paper', nameBn: 'পরিসংখ্যান ১ম পত্র', icon: 'BarChart3', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Statistics 2nd Paper', nameBn: 'পরিসংখ্যান ২য় পত্র', icon: 'BarChart3', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Psychology 1st Paper', nameBn: 'মনোবিজ্ঞান ১ম পত্র', icon: 'HelpCircle', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },
      { name: 'Psychology 2nd Paper', nameBn: 'মনোবিজ্ঞান ২য় পত্র', icon: 'HelpCircle', price: 299, curriculum: 'bangla', level: 'hsc', stream: 'optional' },

      // ================= SSC (বাংলা ভার্সন) =================
      // Compulsory Subjects (আবশ্যিক বিষয় - সবার জন্য)
      { name: 'SSC Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র (SSC)', icon: 'BookOpen', price: 0, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র (SSC)', icon: 'BookMarked', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র (SSC)', icon: 'Languages', price: 0, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র (SSC)', icon: 'Languages', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC General Mathematics', nameBn: 'সাধারণ গণিত (SSC)', icon: 'Calculator', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC Information and Communication Technology', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি SSC)', icon: 'Laptop', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC Islam & Moral Education', nameBn: 'ইসলাম ও নৈতিক শিক্ষা (SSC)', icon: 'BookCheck', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },
      { name: 'SSC Physical Education, Health & Sports', nameBn: 'শারীরিক শিক্ষা, স্বাস্থ্য ও খেলাধুলা (SSC)', icon: 'Activity', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'common' },

      // 1. SSC Science (বিজ্ঞান শাখা)
      { name: 'SSC Physics', nameBn: 'পদার্থবিজ্ঞান (SSC)', icon: 'Zap', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'science' },
      { name: 'SSC Chemistry', nameBn: 'রসায়ন (SSC)', icon: 'FlaskConical', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'science' },
      { name: 'SSC Biology', nameBn: 'জীববিজ্ঞান (SSC)', icon: 'Dna', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'science' },
      { name: 'SSC Bangladesh & Global Studies', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয় (SSC)', icon: 'Globe', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'science' },
      { name: 'SSC Higher Mathematics', nameBn: 'উচ্চতর গণিত (SSC)', icon: 'Calculator', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'science' },

      // 2. SSC Commerce (ব্যবসায় শিক্ষা শাখা)
      { name: 'SSC Accounting', nameBn: 'হিসাববিজ্ঞান (SSC)', icon: 'PieChart', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'commerce' },
      { name: 'SSC Finance & Banking', nameBn: 'ফিন্যান্স ও ব্যাংকিং (SSC)', icon: 'Coins', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'commerce' },
      { name: 'SSC Business Entrepreneurship', nameBn: 'ব্যবসায় উদ্যোগ (SSC)', icon: 'Briefcase', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'commerce' },
      { name: 'SSC General Science (Commerce)', nameBn: 'সাধারণ বিজ্ঞান (SSC)', icon: 'Activity', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'commerce' },

      // 3. SSC Humanities (মানবিক শাখা)
      { name: 'SSC History of Bangladesh & World Civilization', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC)', icon: 'History', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'humanities' },
      { name: 'SSC Civics & Citizenship', nameBn: 'পৌরনীতি ও নাগরিকতা (SSC)', icon: 'Shield', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'humanities' },
      { name: 'SSC Geography & Environment', nameBn: 'ভূগোল ও পরিবেশ (SSC)', icon: 'Globe', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'humanities' },
      { name: 'SSC General Science (Humanities)', nameBn: 'সাধারণ বিজ্ঞান (মানবিক - SSC)', icon: 'Activity', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'humanities' },
      { name: 'SSC Economics', nameBn: 'অর্থনীতি (SSC)', icon: 'BarChart3', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'humanities' },

      // SSC Common 4th / Optional (ঐচ্ছিক বিষয়)
      { name: 'SSC Agriculture Studies', nameBn: 'কৃষি শিক্ষা (SSC)', icon: 'Sprout', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'optional' },
      { name: 'SSC Home Science', nameBn: 'গার্হস্থ্য বিজ্ঞান (SSC)', icon: 'BookOpen', price: 299, curriculum: 'bangla', level: 'ssc', stream: 'optional' },

      // ================= English Version (HSC & SSC) =================
      // HSC EV
      { name: 'Physics 1st Paper (English Version)', nameBn: 'পদার্থবিজ্ঞান ১ম পত্র (EV)', icon: 'Zap', price: 0, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Physics 2nd Paper (English Version)', nameBn: 'পদার্থবিজ্ঞান ২য় পত্র (EV)', icon: 'Zap', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Chemistry 1st Paper (English Version)', nameBn: 'রসায়ন ১ম পত্র (EV)', icon: 'FlaskConical', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Chemistry 2nd Paper (English Version)', nameBn: 'রসায়ন ২য় পত্র (EV)', icon: 'FlaskConical', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Higher Mathematics 1st Paper (English Version)', nameBn: 'উচ্চতর গণিত ১ম পত্র (EV)', icon: 'Calculator', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Higher Mathematics 2nd Paper (English Version)', nameBn: 'উচ্চতর গণিত ২য় পত্র (EV)', icon: 'Calculator', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Biology 1st Paper (English Version)', nameBn: 'জীববিজ্ঞান ১ম পত্র (EV)', icon: 'Dna', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'Biology 2nd Paper (English Version)', nameBn: 'জীববিজ্ঞান ২য় পত্র (EV)', icon: 'Dna', price: 299, curriculum: 'english', level: 'hsc', stream: 'science' },
      { name: 'English 1st Paper (English Version)', nameBn: 'ইংরেজি ১ম পত্র (EV)', icon: 'Languages', price: 0, curriculum: 'english', level: 'hsc', stream: 'common' },
      { name: 'English 2nd Paper (English Version)', nameBn: 'ইংরেজি ২য় পত্র (EV)', icon: 'Languages', price: 299, curriculum: 'english', level: 'hsc', stream: 'common' },
      { name: 'Information and Communication Technology (English Version)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (EV)', icon: 'Laptop', price: 299, curriculum: 'english', level: 'hsc', stream: 'common' },
      { name: 'Accounting 1st Paper (English Version)', nameBn: 'হিসাববিজ্ঞান ১ম পত্র (EV)', icon: 'PieChart', price: 299, curriculum: 'english', level: 'hsc', stream: 'commerce' },
      { name: 'Economics 1st Paper (English Version)', nameBn: 'অর্থনীতি ১ম পত্র (EV)', icon: 'BarChart3', price: 299, curriculum: 'english', level: 'hsc', stream: 'humanities' },

      // SSC EV
      { name: 'SSC Physics (English Version)', nameBn: 'পদার্থবিজ্ঞান (SSC EV)', icon: 'Zap', price: 0, curriculum: 'english', level: 'ssc', stream: 'science' },
      { name: 'SSC Chemistry (English Version)', nameBn: 'রসায়ন (SSC EV)', icon: 'FlaskConical', price: 299, curriculum: 'english', level: 'ssc', stream: 'science' },
      { name: 'SSC Biology (English Version)', nameBn: 'জীববিজ্ঞান (SSC EV)', icon: 'Dna', price: 299, curriculum: 'english', level: 'ssc', stream: 'science' },
      { name: 'SSC Higher Mathematics (English Version)', nameBn: 'উচ্চতর গণিত (SSC EV)', icon: 'Calculator', price: 299, curriculum: 'english', level: 'ssc', stream: 'science' },
      { name: 'SSC Bangladesh & Global Studies (English Version)', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয় (SSC EV)', icon: 'Globe', price: 299, curriculum: 'english', level: 'ssc', stream: 'science' },
      { name: 'SSC General Mathematics (English Version)', nameBn: 'সাধারণ গণিত (SSC EV)', icon: 'Calculator', price: 299, curriculum: 'english', level: 'ssc', stream: 'common' },
      { name: 'SSC English 1st Paper (English Version)', nameBn: 'ইংরেজি ১ম পত্র (SSC EV)', icon: 'Languages', price: 0, curriculum: 'english', level: 'ssc', stream: 'common' },
      { name: 'SSC English 2nd Paper (English Version)', nameBn: 'ইংরেজি ২য় পত্র (SSC EV)', icon: 'Languages', price: 299, curriculum: 'english', level: 'ssc', stream: 'common' },
      { name: 'SSC Information and Communication Technology (English Version)', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (SSC EV)', icon: 'Laptop', price: 299, curriculum: 'english', level: 'ssc', stream: 'common' },
      { name: 'SSC General Science (English Version)', nameBn: 'সাধারণ বিজ্ঞান (SSC EV)', icon: 'Activity', price: 299, curriculum: 'english', level: 'ssc', stream: 'commerce' },
      { name: 'SSC Accounting (English Version)', nameBn: 'হিসাববিজ্ঞান (SSC EV)', icon: 'PieChart', price: 299, curriculum: 'english', level: 'ssc', stream: 'commerce' },
    ];

    for (const sub of initialSubjects) {
      const exists = await client.query(
        `SELECT id FROM subjects WHERE name = $1 AND curriculum_version = $2 AND academic_level = $3`,
        [sub.name, sub.curriculum, sub.level]
      );
      if (exists.rowCount === 0) {
        await client.query(
          `INSERT INTO subjects (name, name_bn, icon, is_active, unlock_price, curriculum_version, academic_level, stream)
           VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7)`,
          [sub.name, sub.nameBn, sub.icon, sub.price, sub.curriculum, sub.level, sub.stream]
        );
      } else {
        // Update stream and academic_level if existing
        await client.query(
          `UPDATE subjects
           SET academic_level = $1, stream = $2, name_bn = $3, icon = $4
           WHERE id = $5`,
          [sub.level, sub.stream, sub.nameBn, sub.icon, exists.rows[0].id]
        );
      }
    }

    // Seed sample English exam for Physics 1st Paper (English Version)
    const engPhysicsRes = await client.query(
      `SELECT id FROM subjects WHERE name = 'Physics 1st Paper (English Version)' LIMIT 1`
    );
    if (engPhysicsRes.rowCount && engPhysicsRes.rows[0]) {
      const engSubId = engPhysicsRes.rows[0].id;
      const examCheck = await client.query(
        `SELECT id FROM exams WHERE subject_id = $1 AND curriculum_version = 'english'`,
        [engSubId]
      );
      if (examCheck.rowCount === 0) {
        const examRes = await client.query(
          `INSERT INTO exams (subject_id, title, serial_number, duration_minutes, total_marks, negative_mark, instructions, is_published, curriculum_version)
           VALUES ($1, 'Model Test 1: Vectors & Kinematics (Free)', 1, 15, 10, 0.25, 'Each correct answer carries 1 mark. Negative mark: 0.25.', TRUE, 'english')
           RETURNING id`,
          [engSubId]
        );
        const newExamId = examRes.rows[0].id;

        await client.query(
          `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, serial_number)
           VALUES 
           ($1, 'What is the dot product of two mutually perpendicular non-zero vectors A and B?', '0', '1', '|A||B|', '-1', 'a', 'Since cos(90°) = 0, the scalar dot product A · B = |A||B|cos(90°) = 0.', 1),
           ($1, 'Which of the following is a unit vector along the z-axis in Cartesian coordinates?', 'i^', 'j^', 'k^', 'None of these', 'c', 'In rectangular coordinates, i^, j^, and k^ represent unit vectors along x, y, and z axes respectively.', 2),
           ($1, 'If a projectile is launched at an angle of 45° with velocity v, its horizontal range is:', 'v² / g', 'v² / (2g)', '2v² / g', 'v / g', 'a', 'Maximum range R = (v² sin(2θ)) / g. For θ = 45°, sin(90°) = 1, so R = v² / g.', 3)`,
          [newExamId]
        );
      }
    }

    console.log('✅ PostgreSQL schema initialized successfully.');
  } finally {
    client.release();
  }

  // Safe ingestion of SSC 2016 Board Questions
  try {
    const { runSsc2016BoardQuestionSeeder } = await import('./seed_ssc_2016_board_questions.js');
    await runSsc2016BoardQuestionSeeder();
  } catch (boardErr) {
    console.error('Failed to seed SSC 2016 board questions:', boardErr);
  }

  // Safe ingestion of HSC & SSC Board Questions (2018 - 2025 across all groups)
  try {
    const { runComprehensiveBoardQuestionSeeder } = await import('./seed_comprehensive_board_questions.js');
    await runComprehensiveBoardQuestionSeeder();
  } catch (compErr) {
    console.error('Failed to seed comprehensive board questions:', compErr);
  }

  // Safe ingestion of 8 Education Boards across 2018 - 2025 for all groups
  try {
    const { runAllBoardsSeeder } = await import('./seed_all_boards_questions.js');
    await runAllBoardsSeeder();
  } catch (allBoardsErr) {
    console.error('Failed to seed all boards questions:', allBoardsErr);
  }

  // Safe ingestion of English Version Board Questions (2018 - 2025 across all groups)
  try {
    const { seedEnglishBoardQuestions } = await import('./seed_english_board_questions.js');
    await seedEnglishBoardQuestions();
  } catch (evErr) {
    console.error('Failed to seed English version board questions:', evErr);
  }

  // Safe ingestion of British (O/A Level) & IB (MYP/DP) Curriculums
  try {
    const { seedBritishAndIbCurriculum } = await import('./seed_british_ib_curriculum.js');
    await seedBritishAndIbCurriculum();
  } catch (intlErr) {
    console.error('Failed to seed British and IB curriculum:', intlErr);
  }

  // Safe ingestion of Subject Chapters and Chapter Model Tests
  try {
    const { seedSubjectChapters } = await import('./seed_subject_chapters.js');
    await seedSubjectChapters(pool);
  } catch (chapterErr) {
    console.error('Failed to seed subject chapters:', chapterErr);
  }
};
