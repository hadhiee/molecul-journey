import { getEvent, EVENTS } from '@/data/events';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Component for Client-side logic (Search/Filter)
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
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white to-transparent opacity-60 z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Navigation */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800 mb-8 transition-colors uppercase tracking-widest"
                >
                    <span>← Kembali ke Dashboard</span>
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6 md:items-center mb-12">
                    <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-3xl shadow-xl flex items-center justify-center text-5xl md:text-6xl transform rotate-3 hover:rotate-6 transition-transform duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${event.color}, ${event.color}dd)`,
                            boxShadow: `0 20px 40px -10px ${event.color}66`
                        }}
                    >
                        {event.icon}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                                Official Puspresnas
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {event.branches.length} Bidang Lomba
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                            {event.name}
                        </h1>
                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                            {event.description}
                        </p>
                    </div>
                </div>

                {/* Search and List Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-1 shadow-sm border border-white/50">
                    <div className="p-6 md:p-8">
                        <BranchList branches={event.branches} eventId={event.id} themeColor={event.color} />
                    </div>
                </div>

            </div>
        </div>
    );
}
