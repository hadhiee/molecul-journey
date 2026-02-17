# MoLeCul - moklet learning culture Journey — Chapter & Scoring

## Chapter Names
1. Chapter 1 — Kelas Tangguh: Fondasi ATTITUDE
2. Chapter 2 — Lab Inovasi: Use Tech Wisely
3. Chapter 3 — Simulasi Industri: BISA di Dunia Kerja
4. Chapter 4 — Dampak Sosial: AKHLAK untuk Masyarakat

## Choice Score
- A = 3
- B = 2
- C = 0
- Optional: C = -1 for dangerous/ethically severe actions (e.g., hacking, sharing sensitive data)

## Leaderboard (Weighted)
- ATTITUDE: 40%
- BISA: 30%
- AKHLAK: 30%
- CODES: badge/achievement (not added into total score)

### Mission Score (0–100)
Let:
- attNorm, bisaNorm, akhNorm each be normalized to 0..3 (clamp as needed)

score = round(((0.4*attNorm) + (0.3*bisaNorm) + (0.3*akhNorm)) * (100/3))

## Reflection Bonus (Deep Learning)
After each mission, student writes 1–2 sentences: “Aksi nyata besok apa?”
- Bonus 0 / 5 / 10 (teacher or simple dropdown)
TotalMissionScoreFinal = min(100, score + bonus)

## Tie-breaker
1) more CODES badges
2) more missions completed
3) faster completion time
