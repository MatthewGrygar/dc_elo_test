import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const series = [
  { name: 'W1', games: 42, elo: 1510, trend: 1500 },
  { name: 'W2', games: 55, elo: 1528, trend: 1514 },
  { name: 'W3', games: 61, elo: 1540, trend: 1525 },
  { name: 'W4', games: 48, elo: 1533, trend: 1530 },
  { name: 'W5', games: 74, elo: 1562, trend: 1544 },
  { name: 'W6', games: 81, elo: 1581, trend: 1560 },
];

const wdl = [
  { name: 'Win', value: 58 },
  { name: 'Draw', value: 8 },
  { name: 'Loss', value: 34 },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel chartCard">
      <div className="chartCard__title">{title}</div>
      <div className="chartCard__body">{children}</div>
    </div>
  );
}

export function ChartsGrid() {
  return (
    <div className="charts" id="statistics">
      <div className="charts__wide">
        <Card title="Počet her (trend)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="games" stroke="var(--chart-blue)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="trend" stroke="var(--chart-purple)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="charts__grid">
        <Card title="ELO (placeholder)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="elo" stroke="var(--chart-blue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Win/Draw/Loss (placeholder)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wdl}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Bar dataKey="value" fill="var(--chart-teal)" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Výhry (placeholder)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={series}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Bar dataKey="games" fill="var(--chart-green)" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Prohry (placeholder)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={series}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Bar dataKey="games" fill="var(--chart-red)" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
