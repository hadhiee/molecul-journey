
import Link from "next/link";
// @ts-ignore
import Parser from "rss-parser";

type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    creator?: string;
    contentSnippet?: string;
    source: string;
    isoDate: string;
    sourceColor: string;
};

const FEEDS = [
    { url: "https://www.antaranews.com/rss/tekno", name: "Antara Tekno", color: "#e11d48", label: "AI & Tech" },
    { url: "https://gamebrott.com/feed", name: "Gamebrott", color: "#f59e0b", label: "Game Dev" },
    { url: "https://www.dicoding.com/blog/feed/", name: "Dicoding", color: "#3b82f6", label: "Coding" },
];

async function getNews(): Promise<NewsItem[]> {
    try {
        const parser = new Parser({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        const allNews: NewsItem[] = [];

        const promises = FEEDS.map(async (feed) => {
            try {
                const feedData = await parser.parseURL(feed.url);
                // Take top 4 from each feed
                feedData.items.slice(0, 4).forEach((item: any) => {
                    allNews.push({
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        contentSnippet: item.contentSnippet?.slice(0, 100) + (item.contentSnippet?.length > 100 ? "..." : ""),
                        source: feed.label,
                        sourceColor: feed.color,
                        isoDate: item.isoDate || new Date(item.pubDate).toISOString(),
                    });
                });
            } catch (e) {
                console.error(`Error fetching feed ${feed.url}`, e);
            }
        });

        await Promise.allSettled(promises);

        // Sort by date desc
        return allNews
            .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())
            .slice(0, 8); // Top 8 combined
    } catch (err) {
        console.error("RSS Parser Error", err);
        return [];
    }
}

export default async function TechNewsPanel() {
    const news = await getNews();

    if (news.length === 0) return (
        <div style={{ marginBottom: 40, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 20 }}>
            Gagal memuat berita terkini. Cek koneksi internet.
        </div>
    );

    return (
        <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Tech Radar</h2>
                    <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: 4, background: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', background: '#f1f5f9', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' }}>AI • RPL • Game</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {news.map((item, i) => (
                    <Link key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white', borderRadius: 16, padding: 16,
                            border: '1px solid #e2e8f0',
                            transition: 'transform 0.2s',
                            display: 'flex', flexDirection: 'column', gap: 6,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700 }}>
                                <span style={{ color: item.sourceColor, background: `${item.sourceColor}15`, padding: '2px 8px', borderRadius: 6 }}>{item.source}</span>
                                <span style={{ color: '#94a3b8' }}>• {new Date(item.isoDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4, margin: 0 }}>
                                {item.title}
                            </h3>
                            {/* <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  {item.contentSnippet}
              </div> */}
                        </div>
                    </Link>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
                Updated from Antara, Gamebrott, Dicoding
            </div>
        </div>
    );
}
