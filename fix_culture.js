const fs = require('fs');
const path = require('path');

const cultureFile = path.join(__dirname, 'src/app/culture/page.tsx');
let content = fs.readFileSync(cultureFile, 'utf8');

// Replace standard pillars with neuroscience facts
const newPilarData = `const pilarData = [
        {
            title: "Neuroplasticity (Otak yang Fleksibel)",
            color: "#e11d48",
            bg: "#fff1f2",
            icon: "🧠",
            points: ["Otak seperti otot: semakin dilatih kebiasaan positif (Character), koneksi sinapsis makin kuat.", "Kesalahan adalah data: saat kita gagal dan belajar, otak menciptakan jalur saraf baru."]
        },
        {
            title: "Dopamine-Driven Learning",
            color: "#2563eb",
            bg: "#eff6ff",
            icon: "🏆",
            points: ["Menyelesaikan quest (Critical Thinking) memicu hormon dopamin yang membuat kita termotivasi.", "Membagi tugas besar menjadi langkah kecil membantu menjaga stamina kognitif (menghindari burnout)."]
        },
        {
            title: "Social Brain (Hipotesis Otak Sosial)",
            color: "#059669",
            bg: "#ecfdf5",
            icon: "🌐",
            points: ["Otak kita dirancang untuk berkolaborasi (Collaboration) & berbagi informasi (Communication).", "Tutor sebaya mengaktifkan Mirror Neurons: belajar dari mengamati dan membantu teman."]
        }
    ];`;

content = content.replace(/const pilarData = \[[\s\S]*?\}\n    \];/, newPilarData);

// Update title "4 Pilar Praktik" to "3 Pilar Sains Kognitif"
content = content.replace("4 Pilar Praktik di Moklet", "3 Pilar Sains Kognitif di Balik Moklet Culture");

fs.writeFileSync(cultureFile, content, 'utf8');
console.log('culture patched successfully.');
