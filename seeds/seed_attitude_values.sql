create table if not exists public.attitude_values (
  code text primary key,
  name text not null,
  definition text not null,
  indicators jsonb not null,
  examples jsonb not null
);

insert into public.attitude_values (code,name,definition,indicators,examples) values
('ATT_A','Act Respectfully','Menjaga adab kepada guru & menghargai teman.',
 '["5S (Senyum, Salam, Sapa, Sopan, Santun)","Tidak menyela saat orang lain bicara","Duduk dengan postur sopan"]'::jsonb,
 '{"kelas":["5S saat interaksi di kelas","Menghargai pendapat teman saat diskusi"],"sekolah":["Tidak menyela saat briefing","Menjaga bahasa tubuh sopan"]}'::jsonb),
('ATT_TP','Talk Politely','Ucapan positif, tidak kasar/merendahkan.',
 '["Magic Words: Maaf, Tolong, Terima kasih","Zero tolerance: kata-kata kasar/body shaming","Menghindari merendahkan orang lain"]'::jsonb,
 '{"kelas":["Meminta bantuan dengan sopan","Mengucapkan terima kasih setelah dibantu"],"sekolah":["Tidak body shaming","Menegur dengan bahasa baik"]}'::jsonb),
('ATT_TOD','Turn Off Distraction','Fokus belajar: tidak game/medsos saat pelajaran.',
 '["HP silent di tas/laci saat penjelasan","Tab browser hanya yang relevan","Izin jika ada panggilan darurat"]'::jsonb,
 '{"kelas":["Mode fokus saat praktik","Tidak membuka medsos saat materi inti"],"sekolah":["Mengikuti aturan penggunaan perangkat","Meminta izin saat ada kebutuhan darurat"]}'::jsonb),
('ATT_IA','Involve Actively','Hadir sepenuhnya, responsif pada instruksi, aktif berpartisipasi.',
 '["Mencatat poin penting","Menjadi relawan saat ada tantangan","Tidak pasif (patung/silent reader)"]'::jsonb,
 '{"kelas":["Aktif bertanya/menjawab","Terlibat saat diskusi kelompok"],"sekolah":["Responsif saat briefing","Aktif di kegiatan belajar/proyek"]}'::jsonb),
('ATT_TS','Think Solutions','Fokus menyelesaikan masalah, bukan mengeluh.',
 '["Coba dulu (baca error/debug) sebelum memanggil guru","Ubah “ini susah” → “ini tantangan”","Tawarkan solusi saat diskusi"]'::jsonb,
 '{"kelas":["Debug dulu sebelum minta bantuan","Membawa opsi solusi"],"sekolah":["Mengajak tim fokus langkah berikutnya","Mengurangi budaya mengeluh"]}'::jsonb),
('ATT_UTW','Use Tech Wisely','Teknologi/AI untuk bantu belajar, bukan plagiasi.',
 '["Cantumkan sumber","Pakai Wi-Fi untuk hal produktif","Jaga keamanan akun & data pribadi"]'::jsonb,
 '{"kelas":["AI untuk outline lalu diverifikasi","Menulis sitasi sumber"],"sekolah":["Tidak membagikan password","Tidak menyebarkan data pribadi"]}'::jsonb),
('ATT_DA','Dare to Ask','Tidak malu bertanya saat belum paham.',
 '["Tanya “mengapa?”/“bagaimana jika?”","Konfirmasi pemahaman","Tidak menertawakan teman yang bertanya"]'::jsonb,
 '{"kelas":["Bertanya saat bingung","Mengulang pemahaman dengan kata sendiri"],"sekolah":["Mendukung teman yang bertanya","Menciptakan budaya tanya aman"]}'::jsonb),
('ATT_ETC','Eager to Collaborate','Terbuka kerja tim, berbagi ilmu, berkontribusi.',
 '["Tidak “one man show”","Tutor sebaya / berbagi ilmu","Menerima pembagian tugas dan menuntaskan tanggung jawab"]'::jsonb,
 '{"kelas":["Pair programming","Berbagi catatan/temuan"],"sekolah":["Kolaborasi lintas kelas","Membantu teman tanpa merendahkan"]}'::jsonb)
on conflict (code) do nothing;
