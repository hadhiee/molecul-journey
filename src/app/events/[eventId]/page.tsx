import { getEvent, EVENTS } from '@/data/events';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BranchList from '@/components/BranchList';

export async function generateStaticParams() {
    return EVENTS.map((event) => ({
        eventId: event.id,
    }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;
    const event = getEvent(eventId);

    if (!event) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-white to-transparent opacity-60 z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                {/* Navigation - Sticky Top or just prominent */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 hover:text-slate-900 shadow-sm border border-slate-200 transition-all hover:shadow-md"
                    >
                        <span>← Kembali ke Dashboard</span>
                    </Link>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10">
                    <div
                        className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] shadow-2xl flex items-center justify-center text-6xl md:text-7xl transform rotate-3 hover:rotate-6 transition-transform duration-500 bg-white border-4 border-white"
                        style={{
                            boxShadow: `0 20px 40px -10px ${event.color}66`
                        }}
                    >
                        {event.icon}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                Official Puspresnas
                            </span>
                            <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white">
                                {event.branches.length} Bidang Lomba
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            {event.name}
                        </h1>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-3xl">
                            {event.description}
                        </p>
                    </div>
                </div>

                {/* Character Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                            Nilai Karakter Utama
                        </h3>
                        <div className="w-12 h-1 rounded-full mb-2" style={{ backgroundColor: event.color }} />
                    </div>
                    <div className="md:col-span-3 flex flex-wrap gap-3">
                        {event.characterValues.map((value, idx) => (
                            <div
                                key={idx}
                                className="px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform"
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                                <span className="font-bold text-slate-700 text-sm">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search and List Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-xl border border-white/50 ring-1 ring-slate-900/5">
                    <div className="bg-slate-50/50 rounded-[24px] p-6 md:p-8">
                        <BranchList branches={event.branches} eventId={event.id} themeColor={event.color} />
                    </div>
                </div>

            </div>
        </div>
    );
}
