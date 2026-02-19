import Link from 'next/link';
import { EVENTS } from '@/data/events';
import EventCard from '@/components/EventCard';

export default function EventsIndexPage() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-20">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-blue-50 to-transparent opacity-80 z-0" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* Header & Back */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 uppercase tracking-widest transition-colors"
                        >
                            <span>← Kembali ke Dashboard</span>
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                            Puspresnas Arena 🏆
                        </h1>
                        <p className="text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
                            Pusat informasi dan pelatihan untuk 7 ajang talenta nasional paling bergengsi dari Kemendikbudristek.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <span className="text-sm font-bold text-slate-600">Total Event:</span>
                        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-md">{EVENTS.length}</span>
                    </div>
                </div>

                {/* Intro Banner */}
                <div className="bg-white rounded-[32px] p-8 mb-12 shadow-xl border border-blue-100 relative overflow-hidden grid md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1 relative z-10">
                        <span className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2 block">Why Participate?</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Wujudkan Prestasi, Bangun Karakter Bangsa.</h2>
                        <div className="space-y-3">
                            {[
                                "Pengakuan tingkat nasional untuk portofolio masa depan.",
                                "Mengasah nilai-nilai karakter utama (Jujur, Tangguh, Kolaboratif).",
                                "Jejaring dengan talenta terbaik dari seluruh Indonesia.",
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">✓</div>
                                    <p className="text-sm text-slate-600 font-medium leading-tight">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10 scale-150 animate-pulse"></div>
                        <div className="text-[120px] leading-none select-none drop-shadow-2xl animate-float">🏅</div>
                    </div>
                </div>

                {/* Event List Grid */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Daftar Lengkap Event</h2>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EVENTS.map((event) => (
                            <div key={event.id} className="h-full">
                                <EventCard event={event} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-20 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Siap untuk mencetak prestasi? Pilih event dan mulai latihan hari ini! 🚀
                    </p>
                </div>

            </div>
        </div>
    );
}
