import Link from 'next/link';
import { getEvent } from '@/data/events';

export default async function BranchTrainingPage({ params }: { params: Promise<{ eventId: string, branchId: string }> }) {
    const { eventId, branchId } = await params;

    const event = getEvent(eventId);
    const branch = event?.branches.find(b => b.id === branchId);
    const branchName = branch?.name || branchId;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">

            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 relative z-10 text-center border bordered-slate-100">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                    <span className="text-4xl text-white">🚧</span>
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-2">Training Mode</h2>
                <h3 className="text-lg font-bold text-slate-600 mb-4">{branchName}</h3>

                <p className="text-slate-500 mb-8 font-medium">
                    Fitur latihan untuk cabang ini sedang dalam tahap pengembangan. Nantikan update selanjutnya!
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">DETAIL</h4>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-600">Event:</span>
                        <span className="text-sm font-medium text-slate-500">{event?.shortName || eventId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">ID:</span>
                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{branchId}</span>
                    </div>
                </div>

                <Link
                    href={`/events/${eventId}`}
                    className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95"
                >
                    ← KEMBALI KE DAFTAR
                </Link>
            </div>
        </div>
    );
}
