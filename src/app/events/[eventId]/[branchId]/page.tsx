import Link from 'next/link';
import { getEvent } from '@/data/events';

export default async function BranchTrainingPage({ params }: { params: Promise<{ eventId: string, branchId: string }> }) {
    const { eventId, branchId } = await params;

    const event = getEvent(eventId);
    const branch = event?.branches.find(b => b.id === branchId);
    const branchName = branch?.name || branchId;

    // Mock Data for "Training Modules" to make it look functional
    const modules = [
        { title: "Pengenalan & Dasar Teori", status: "open", progress: 0 },
        { title: "Latihan Soal Level 1", status: "locked", progress: 0 },
        { title: "Studi Kasus Industri", status: "locked", progress: 0 },
        { title: "Simulasi Kompetisi", status: "locked", progress: 0 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">

            {/* Navbar / Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href={`/events/${eventId}`}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <span>← Kembali</span>
                        <span className="hidden md:inline">ke {event?.shortName}</span>
                    </Link>
                    <div className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-500 uppercase tracking-widest">
                        Training Mode
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">

                {/* Hero Section */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xl">
                                {event?.icon}
                            </span>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{event?.name}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">{branchName}</h1>

                        <div className="flex flex-wrap gap-4">
                            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                Mulai Latihan Sekarang 🚀
                            </button>
                            <button className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 transition-all">
                                Unduh Silabus 📥
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Character Stats */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">
                                Character Stats Required
                            </h3>
                            <div className="space-y-5">
                                {event?.characterValues.map((val, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                            <span>{val}</span>
                                            <span style={{ color: event.color }}>Level {i + 1}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${85 - (i * 10)}%`, backgroundColor: event.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Tips Juara 🏆</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                "Konsistensi adalah kunci. Luangkan waktu minimal 30 menit setiap hari untuk mengasah skill teknis dan karaktermu."
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Training Modules */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Modul Pelatihan</h2>
                            <span className="text-xs font-bold text-slate-400">Total 4 Modul</span>
                        </div>

                        <div className="space-y-4">
                            {modules.map((mod, i) => (
                                <div
                                    key={i}
                                    className={`group p-5 rounded-2xl border transition-all flex items-center gap-5 ${mod.status === 'open'
                                            ? 'bg-white border-slate-200 shadow-sm hover:shadow-md cursor-pointer'
                                            : 'bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${mod.status === 'open'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-slate-200 text-slate-400'
                                        }`}>
                                        {i + 1}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className={`font-bold ${mod.status === 'open' ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {mod.title}
                                        </h4>
                                        <div className="text-xs font-semibold text-slate-400 mt-1">
                                            {mod.status === 'open' ? 'Siap dimulai' : 'Terkunci • Selesaikan modul sebelumnya'}
                                        </div>
                                    </div>

                                    <div className="text-slate-300">
                                        {mod.status === 'open' ? '→' : '🔒'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm font-medium text-slate-400 bg-slate-100 inline-block px-4 py-2 rounded-lg">
                                🚧 Konten pelatihan sedang dalam tahap penyusunan tim ahli.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
