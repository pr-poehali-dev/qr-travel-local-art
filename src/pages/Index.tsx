import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import QrScanner from '@/components/QrScanner';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const MURAL = 'https://cdn.poehali.dev/projects/560594a7-8f97-4d86-8194-5c0f90650ec3/files/3234124e-4dfa-47de-a754-bcb6bf539320.jpg';

type Point = {
  id: number;
  name: string;
  place: string;
  distance: string;
  found: boolean;
  lat: number;
  lng: number;
  code: string;
};

const initialPoints: Point[] = [
  { id: 1, name: 'Птица Сирин', place: 'Краеведческий музей', distance: '120 м', found: true, lat: 22, lng: 30, code: 'sirin' },
  { id: 2, name: 'Древо жизни', place: 'Старая площадь', distance: '340 м', found: true, lat: 40, lng: 62, code: 'drevo' },
  { id: 3, name: 'Солнцеворот', place: 'Дом ремёсел', distance: '580 м', found: true, lat: 58, lng: 24, code: 'solncevorot' },
  { id: 4, name: 'Конь-огонь', place: 'Набережная', distance: '1.1 км', found: false, lat: 70, lng: 70, code: 'kon' },
  { id: 5, name: 'Цветущий сад', place: 'Городской парк', distance: '1.4 км', found: false, lat: 30, lng: 84, code: 'sad' },
  { id: 6, name: 'Оберег', place: 'Часовня у моста', distance: '2.0 км', found: false, lat: 82, lng: 44, code: 'obereg' },
];

const tabs = [
  { id: 'map', label: 'Карта', icon: 'MapPin' },
  { id: 'scan', label: 'Сканер', icon: 'ScanLine' },
  { id: 'gallery', label: 'Роспись', icon: 'Palette' },
  { id: 'profile', label: 'Профиль', icon: 'User' },
];

const STORAGE_KEY = 'zarechye-mural-progress';

const loadPoints = (): Point[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialPoints;
    const foundIds: number[] = JSON.parse(saved);
    return initialPoints.map((p) => (foundIds.includes(p.id) ? { ...p, found: true } : p));
  } catch {
    return initialPoints;
  }
};

const Index = () => {
  const [tab, setTab] = useState('map');
  const [points, setPoints] = useState<Point[]>(loadPoints);
  const [showVictory, setShowVictory] = useState(false);
  const foundCount = points.filter((p) => p.found).length;
  const progress = Math.round((foundCount / points.length) * 100);

  useEffect(() => {
    const foundIds = points.filter((p) => p.found).map((p) => p.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foundIds));
  }, [points]);

  const handleScan = (raw: string) => {
    const text = raw.trim().toLowerCase();
    const match = points.find(
      (p) => p.found === false && (text.includes(p.code) || text.includes(p.name.toLowerCase()))
    );
    const target = match || points.find((p) => !p.found);

    if (!target) {
      toast('Вся роспись уже собрана!', { description: 'Ты настоящий хранитель картины 🎉' });
      return;
    }

    const updated = points.map((p) => (p.id === target.id ? { ...p, found: true } : p));
    setPoints(updated);
    toast(`Найден фрагмент: ${target.name}`, {
      description: 'Кусочек росписи открыт в галерее',
    });

    if (updated.every((p) => p.found)) {
      setTimeout(() => setShowVictory(true), 500);
    } else {
      setTab('gallery');
    }
  };

  const handleReset = () => {
    setPoints(initialPoints);
    localStorage.removeItem(STORAGE_KEY);
    setShowVictory(false);
    toast('Прогресс сброшен', { description: 'Начни путешествие заново' });
  };

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
        {tab === 'map' && <MapView points={points} />}
        {tab === 'scan' && <ScanView onScan={handleScan} />}
        {tab === 'gallery' && <GalleryView points={points} progress={progress} foundCount={foundCount} />}
        {tab === 'profile' && <ProfileView progress={progress} foundCount={foundCount} onReset={handleReset} />}
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

      <VictoryDialog
        open={showVictory}
        onOpenChange={setShowVictory}
        onReset={handleReset}
        onViewGallery={() => {
          setShowVictory(false);
          setTab('gallery');
        }}
      />
    </div>
  );
};

const VictoryDialog = ({
  open,
  onOpenChange,
  onReset,
  onViewGallery,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReset: () => void;
  onViewGallery: () => void;
}) => {
  const handleShare = async () => {
    const shareData = {
      title: 'Живая Роспись',
      text: 'Я собрал всю роспись Заречья и стал Хранителем картины! Попробуй и ты найти все фрагменты 🎉',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast('Ссылка скопирована', { description: 'Отправь её друзьям' });
      }
    } catch {
      /* пользователь отменил шаринг */
    }
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm p-0 overflow-hidden border-border bg-card">
      <div className="relative">
        <div className="ethnic-border h-2 w-full" />
        <div className="relative overflow-hidden aspect-square">
          <img src={MURAL} alt="Собранная роспись" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center text-primary-foreground shadow-2xl float-slow">
              <Icon name="Sparkles" size={44} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 text-center">
          <p className="font-script text-2xl text-primary leading-none">Поздравляем!</p>
          <h2 className="font-display text-3xl font-bold mt-2">Роспись собрана полностью</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Ты нашёл все 6 фрагментов и стал настоящим Хранителем картины Заречья.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Icon key={i} name="Star" size={18} className="text-accent fill-accent" />
            ))}
          </div>
          <button
            onClick={onViewGallery}
            className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <Icon name="Palette" size={20} />
            Смотреть роспись
          </button>
          <button
            onClick={handleShare}
            className="mt-2.5 w-full py-3.5 rounded-2xl border border-border font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="Share2" size={20} />
            Поделиться
          </button>
          <button
            onClick={() => {
              onReset();
              onOpenChange(false);
            }}
            className="mt-2 w-full py-2.5 rounded-2xl text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="RotateCcw" size={16} />
            Начать заново
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
};

const MapView = ({ points }: { points: Point[] }) => (
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

const ScanView = ({ onScan }: { onScan: (text: string) => void }) => (
  <section className="fragment-reveal">
    <QrScanner onResult={onScan} />
  </section>
);

const GalleryView = ({ points, progress, foundCount }: { points: Point[]; progress: number; foundCount: number }) => (
  <section className="fragment-reveal">
    <div className="rounded-3xl overflow-hidden border border-border relative aspect-square">
      <img src={MURAL} alt="Роспись" className="w-full h-full object-cover" />
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-3">
        {points.map((f) => (
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
      {points.map((f) => (
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

const ProfileView = ({
  progress,
  foundCount,
  onReset,
}: {
  progress: number;
  foundCount: number;
  onReset: () => void;
}) => (
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

    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="mt-6 w-full py-3.5 rounded-2xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Icon name="RotateCcw" size={18} />
          Сбросить прогресс
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl">Сбросить прогресс?</AlertDialogTitle>
          <AlertDialogDescription>
            Все найденные фрагменты росписи будут скрыты, и путешествие начнётся заново. Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Сбросить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
);

export default Index;