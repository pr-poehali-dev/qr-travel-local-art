import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Icon from '@/components/ui/icon';

type Props = {
  onResult: (text: string) => void;
};

const REGION_ID = 'qr-reader-region';

const QrScanner = ({ onResult }: Props) => {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stop = async () => {
    const s = scannerRef.current;
    if (s) {
      try {
        if (s.isScanning) await s.stop();
        await s.clear();
      } catch {
        /* noop */
      }
      scannerRef.current = null;
    }
    setActive(false);
  };

  const start = async () => {
    setError(null);
    setActive(true);
    await new Promise((r) => setTimeout(r, 60));
    try {
      const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          onResult(decoded);
          stop();
        },
        () => {}
      );
    } catch (e) {
      setError('Не удалось открыть камеру. Разреши доступ в браузере.');
      setActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
     
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-border bg-foreground/90 flex items-center justify-center">
        <div id={REGION_ID} className="absolute inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

        {!active && (
          <>
            <Icon name="QrCode" size={64} className="text-accent/50" />
          </>
        )}

        <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-accent/70" />
        {active && <div className="pointer-events-none absolute inset-x-8 top-8 h-0.5 bg-accent shadow-[0_0_12px_2px] shadow-accent float-slow" />}
        {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
          <div
            key={i}
            className={`pointer-events-none absolute w-7 h-7 border-primary ${pos} ${i < 2 ? 'border-t-2' : 'border-b-2'} ${i % 2 === 0 ? 'border-l-2 rounded-tl-lg' : 'border-r-2 rounded-tr-lg'}`}
          />
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive text-center flex items-center gap-2">
          <Icon name="TriangleAlert" size={16} /> {error}
        </p>
      )}

      <p className="text-center text-muted-foreground text-sm mt-5 max-w-xs">
        Наведи камеру на QR-код рядом с достопримечательностью — фрагмент росписи откроется автоматически.
      </p>

      {!active ? (
        <button
          onClick={start}
          className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <Icon name="Camera" size={20} />
          Включить камеру
        </button>
      ) : (
        <button
          onClick={stop}
          className="mt-5 w-full py-3.5 rounded-2xl bg-muted text-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon name="X" size={20} />
          Остановить сканер
        </button>
      )}
    </div>
  );
};

export default QrScanner;
