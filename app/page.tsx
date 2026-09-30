export type PrefetchCache = {
  ELO?:  { dashboard: any; players: any[]; stats?: any; analytics?: any; records?: any };
  DCPR?: { dashboard: any; players: any[]; stats?: any; analytics?: any; records?: any };
  announcements?: string[];
  region?: string;
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="mb-4 text-2xl font-semibold md:text-4xl">
          Děkujeme za podporu, projekt byl ukončen.
        </h1>
        <p className="text-lg opacity-75 md:text-xl">Tým Grail Series</p>
      </div>
    </main>
  );
}
