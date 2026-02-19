import Link from 'next/link';
import { EVENTS, PuspresnasEvent } from '@/data/events';
import EventCard from '@/components/EventCard';

// Helper to group events
const EVENT_GROUPS = [
    {
        title: "Vokasi & Kewirausahaan",
        description: "Kembangkan skill teknis dan jiwa bisnis profesional.",
        ids: ['lks', 'fiksi'],
        color: 'from-rose-500 to-orange-500'
    },
    {
        title: "Sains & Riset",
        description: "Eksplorasi ilmu pengetahuan dan inovasi penemuan baru.",
        ids: ['osn', 'opsi'],
        color: 'from-blue-500 to-cyan-500'
    },
    {
        title: "Seni, Bahasa & Olahraga",
        description: "Ekspresikan bakat seni, kemampuan komunikasi, dan ketangkasan fisik.",
        ids: ['fls2n', 'ldi', 'o2sn'],
        color: 'from-violet-500 to-purple-500'
    }
];

export default function EventsIndexPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">

            {/* 1. Hero Section with Pattern */}
            <div className="relative bg-slate-900 text-white overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-2xl">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-bold transition-all mb-8 border border-white/10"
                    >
                        <span>← Kembali ke Dashboard</span>
                    </Link>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300 drop-shadow-sm">
                        Puspresnas Arena
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                        Pusat inkubasi talenta nasional. Asah karakter, raih prestasi, dan jadilah kebanggaan bangsa.
                    </p>

                    {/* Stats Pills */}
                    <div className="flex flex-wrap justify-center gap-4 mt-10">
                        {[
                            { label: "7 Ajang Bergengsi", icon: "🏆" },
                            { label: "100+ Bidang Lomba", icon: "🎯" },
                            { label: "Pendidikan Karakter", icon: "🛡️" },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full text-sm font-bold text-slate-200 shadow-sm">
                                <span>{stat.icon}</span>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Main Content - Grouped Layout */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 md:-mt-20 relative z-20 space-y-16">

                {EVENT_GROUPS.map((group, idx) => {
                    const groupEvents = group.ids.map(id => EVENTS.find(e => e.id === id)).filter(Boolean) as PuspresnasEvent[];

                    return (
                        <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-end gap-4 mb-6 px-2">
                                <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${group.color}`}></div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-800">{group.title}</h2>
                                    <p className="text-slate-500 font-medium">{group.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupEvents.map(event => (
                                    <div key={event.id} className="h-full">
                                        <EventCard event={event} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* 3. Bottom CTA - Encouragement */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 md:p-12 text-center text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 text-[15rem] leading-none opacity-5 -translate-y-1/2 translate-x-1/4 font-black">
                        GO
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">Belum yakin harus mulai dari mana?</h2>
                        <p className="text-indigo-100 text-lg mb-8">
                            Coba eksplorasi "Journey Map" untuk menemukan minat bakatmu melalui game simulasi.
                        </p>
                        <Link
                            href="/journey"
                            className="inline-block px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
                        >
                            Mulai Petualangan 🗺️
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
