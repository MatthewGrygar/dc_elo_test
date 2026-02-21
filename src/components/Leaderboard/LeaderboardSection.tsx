import { useData } from '../../context/data-context';
import { Leaderboard } from './Leaderboard';

export function LeaderboardSection() {
  const { players, isLoading, error } = useData();

  return (
    <section className="section" id="leaderboard" aria-label="Leaderboard">
      <div className="section__header">
        <h2 className="section__title">Leaderboard</h2>
        <p className="section__subtitle">
          {isLoading
            ? 'Načítám data…'
            : error
              ? `Nepodařilo se načíst data (${error}). Zobrazuji dostupná data.`
              : 'Klikni na hráče pro detail.'}
        </p>
      </div>

      <div className="panel panel--soft leaderboard">
        <div className="leaderboard__head">
          <div className="lbRow lbRow--head">
            <div className="lbCell lbCell--rank">#</div>
            <div className="lbCell lbCell--name">Hráč</div>
            <div className="lbCell lbCell--elo">ELO</div>
            <div className="lbCell lbCell--num">Games</div>
            <div className="lbCell lbCell--num">W</div>
            <div className="lbCell lbCell--num">L</div>
            <div className="lbCell lbCell--num">D</div>
            <div className="lbCell lbCell--num">Peak</div>
            <div className="lbCell lbCell--num">WR</div>
          </div>
        </div>

        <Leaderboard players={players} />
      </div>
    </section>
  );
}
