import { useState } from 'react';
import Icon from '@/components/ui/icon';

const MURAL = 'https://cdn.poehali.dev/projects/560594a7-8f97-4d86-8194-5c0f90650ec3/files/3234124e-4dfa-47de-a754-bcb6bf539320.jpg';

type Point = {
  id: number;
  name: string;
  place: string;
  distance: string;
  found: boolean;
  lat: number;
  lng: number;
};

const points: Point[] = [
  { id: 1, name: 'Птица Сирин', place: 'Краеведческий музей', distance: '120 м', found: true, lat: 22, lng: 30 },
  { id: 2, name: 'Древо жизни', place: 'Старая площадь', distance: '340 м', found: true, lat: 40, lng: 62 },
  { id: 3, name: 'Солнцеворот', place: 'Дом ремёсел', distance: '580 м', found: true, lat: 58, lng: 24 },
  { id: 4, name: 'Конь-огонь', place: 'Набережная', distance: '1.1 км', found: false, lat: 70, lng: 70 },
  { id: 5, name: 'Цветущий сад', place: 'Городской парк', distance: '1.4 км', found: false, lat: 30, lng: 84 },
  { id: 6, name: 'Оберег', place: 'Часовня у моста', distance: '2.0 км', found: false, lat: 82, lng: 44 },
];

const fragments = points;

const tabs = [
  { id: 'map', label: 'Карта', icon: 'MapPin' },
  { id: 'scan', label: 'Сканер', icon: 'ScanLine' },
  { id: 'gallery', label: 'Роспись', icon: 'Palette' },
  { id: 'profile', label: 'Профиль', icon: 'User' },
];

const Index = () => {
  const [tab, setTab] = useState('map');
  const foundCount = points.filter((p) => p.found).length;
  const progress = Math.round((foundCount / points.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />

      <header className="relative px-6 pt-8 pb-4">
        <div className="ethnic-border h-1.5 w-24 rounded-full mb-4 opacity-60" />
        <p className="font-script text-2xl text-primary leading-none">Путешествие по округу</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-1">
          Живая Роспись
        </h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-xs">
          Находи QR-коды в городе и собирай кусочки традиционной росписи в единую картину.
        </p>
      </header>

      <main className="relative px-5 pb-32 max-w-md mx-auto">
        {tab === 'map' && <MapView />}
        {tab === 'scan' && <ScanView />}
        {tab === 'gallery' && <GalleryView progress={progress} foundCount={foundCount} />}
        {tab === 'profile' && <ProfileView progress={progress} foundCount={foundCount} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20">
        <div className="max-w-md mx-auto m-4 p-1.5 rounded-2xl bg-card/90 backdrop-blur border border-border shadow-lg shadow-black/5 flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} size={20} />
              <span className="text-[11px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const MapView = () => (
  <section className="fragment-reveal">
    <div className="flex items-center gap-2 mb-3 text-sm text-secondary font-medium">
      <Icon name="Navigation" size={16} />
      GPS определил 6 пунктов рядом
    </div>
    <div className="relative rounded-3xl overflow-hidden border border-border aspect-[4/5] bg-muted">
      <div
        className="absolute inset-0 opacity-30 mix-blend-multiply"
        style={{ backgroundImage: `url(${MURAL})`, backgroundSize: 'cover' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-primary/10" />
      {points.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${p.lat}%`, left: `${p.lng}%` }}
        >
          <div
            className={`relative w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
              p.found ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground pulse-ring'
            }`}
          >
            <Icon name={p.found ? 'Check' : 'QrCode'} size={16} />
          </div>
        </div>
      ))}
      <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-card/90 backdrop-blur px-4 py-2.5 text-xs flex items-center justify-between border border-border">
        <span className="font-medium">Ты здесь · округ Заречье</span>
        <span className="text-secondary flex items-center gap-1"><Icon name="Radar" size={14} /> в эфире</span>
      </div>
    </div>

    <div className="mt-4 space-y-2.5">
      {points.map((p) => (
        <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.found ? 'bg-secondary/15 text-secondary' : 'bg-accent/20 text-primary'}`}>
            <Icon name={p.found ? 'BadgeCheck' : 'MapPin'} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate font-display text-lg leading-tight">{p.name}</p>
            <p className="text-xs text-muted-foreground truncate">{p.place}</p>
          </div>
          <span className="text-xs font-medium text-muted-foreground shrink-0">{p.distance}</span>
        </div>
      ))}
    </div>
  </section>
);

const ScanView = () => (
  <section className="fragment-reveal flex flex-col items-center">
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-border bg-foreground/90 flex items-center justify-center">
      <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-accent/70" />
      <div className="absolute inset-x-8 top-8 h-0.5 bg-accent shadow-[0_0_12px_2px] shadow-accent float-slow" />
      {[
        'top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6',
      ].map((pos, i) => (
        <div key={i} className={`absolute w-7 h-7 border-primary ${pos} ${i < 2 ? 'border-t-2' : 'border-b-2'} ${i % 2 === 0 ? 'border-l-2 rounded-tl-lg' : 'border-r-2 rounded-tr-lg'}`} />
      ))}
      <Icon name="QrCode" size={64} className="text-accent/50" />
    </div>
    <p className="text-center text-muted-foreground text-sm mt-5 max-w-xs">
      Наведи камеру на QR-код рядом с достопримечательностью — фрагмент росписи откроется автоматически.
    </p>
    <button className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
      <Icon name="Camera" size={20} />
      Включить камеру
    </button>
  </section>
);

const GalleryView = ({ progress, foundCount }: { progress: number; foundCount: number }) => (
  <section className="fragment-reveal">
    <div className="rounded-3xl overflow-hidden border border-border relative aspect-square">
      <img src={MURAL} alt="Роспись" className="w-full h-full object-cover" />
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-3">
        {fragments.map((f) => (
          <div
            key={f.id}
            className={`border border-background/40 flex items-center justify-center transition-all ${
              f.found ? 'backdrop-blur-0' : 'backdrop-blur-xl bg-background/60'
            }`}
          >
            {!f.found && <Icon name="Lock" size={20} className="text-muted-foreground" />}
          </div>
        ))}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div>
        <p className="font-display text-2xl font-bold leading-none">Роспись Заречья</p>
        <p className="text-sm text-muted-foreground">Собрано {foundCount} из 6 фрагментов</p>
      </div>
      <div className="text-primary font-display text-3xl font-bold">{progress}%</div>
    </div>
    <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
    </div>

    <div className="mt-5 grid grid-cols-2 gap-2.5">
      {fragments.map((f) => (
        <div key={f.id} className={`p-3 rounded-2xl border ${f.found ? 'bg-card border-border' : 'bg-muted/50 border-dashed border-border'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${f.found ? 'bg-accent/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon name={f.found ? 'Sparkles' : 'Lock'} size={16} />
          </div>
          <p className="font-display font-semibold leading-tight">{f.name}</p>
          <p className="text-xs text-muted-foreground">{f.found ? 'Открыт' : 'Не найден'}</p>
        </div>
      ))}
    </div>
  </section>
);

const ProfileView = ({ progress, foundCount }: { progress: number; foundCount: number }) => (
  <section className="fragment-reveal">
    <div className="rounded-3xl border border-border bg-card p-6 text-center relative overflow-hidden">
      <div className="ethnic-border absolute top-0 inset-x-0 h-2" />
      <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-primary-foreground mt-2">
        <Icon name="Compass" size={36} />
      </div>
      <h2 className="font-display text-2xl font-bold mt-3">Странник Заречья</h2>
      <p className="text-sm text-muted-foreground">Уровень: Искатель узоров</p>
    </div>

    <div className="grid grid-cols-3 gap-2.5 mt-4">
      {[
        { label: 'Фрагментов', value: `${foundCount}/6`, icon: 'Puzzle' },
        { label: 'Пунктов', value: '3', icon: 'MapPin' },
        { label: 'Прогресс', value: `${progress}%`, icon: 'TrendingUp' },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl bg-card border border-border p-3 text-center">
          <Icon name={s.icon} size={18} className="mx-auto text-primary mb-1" />
          <p className="font-display text-xl font-bold leading-none">{s.value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>

    <h3 className="font-display text-xl font-bold mt-6 mb-2.5">Достижения</h3>
    <div className="space-y-2.5">
      {[
        { name: 'Первый узор', desc: 'Найден первый фрагмент', done: true, icon: 'Star' },
        { name: 'Знаток традиций', desc: 'Прочитано 3 истории росписи', done: true, icon: 'BookOpen' },
        { name: 'Хранитель картины', desc: 'Собрать всю роспись', done: false, icon: 'Trophy' },
      ].map((a) => (
        <div key={a.name} className={`flex items-center gap-3 p-3 rounded-2xl border ${a.done ? 'bg-card border-border' : 'bg-muted/40 border-dashed border-border'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.done ? 'bg-accent/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon name={a.icon} size={18} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{a.name}</p>
            <p className="text-xs text-muted-foreground">{a.desc}</p>
          </div>
          {a.done && <Icon name="Check" size={18} className="text-secondary" />}
        </div>
      ))}
    </div>
  </section>
);

export default Index;
