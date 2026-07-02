import { useState, useEffect, useRef } from 'react';

interface Bicho {
  Id: number;
  PosicionX: number;
  PosicionY: number;
  Color: string;
  Nombre: string;
  vx: number;
  vy: number;
  hp: number;
}

function App() {
  const getBichoName = (color: string, id: number) => {
    switch (color) {
      case 'red': return `diego ${id}`;
      case 'purple': return `richard ${id}`;
      case 'yellow': return `fabian ${id}`;
      case 'green': return `gonzalo ${id}`;
      default: return id % 2 === 0 ? `emilio ${id}` : `pablo ${id}`;
    }
  };

  const initialAppleSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
  const manzanaRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, golpes: 0, visible: true, size: initialAppleSize });
  const [color, setColor] = useState<string>("");
  const [bichos, setBichos] = useState<Bicho[]>([]);
  const [squashed, setSquashed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('http://localhost:3000/api/bichos')
      .then(r => r.json())
      .then(data => {
        const initial = data.map((m: any) => ({ 
          ...m, 
          vx: 2, 
          vy: 2, 
          hp: 10,
          PosicionX: Math.random() * (window.innerWidth - 150),
          PosicionY: Math.random() * (window.innerHeight - 150) + 80
        }));
        setBichos(initial);
      })
      .catch(e => console.log("API no conectada", e));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const update = () => {
      setBichos(prev => {
        let newBichos = prev.map(m => {
          if (squashed[m.Id]) return m;
          
          let { PosicionX, PosicionY, vx, vy } = m;
          let nx = PosicionX + vx;
          let ny = PosicionY + vy;
          
          // Colisión con la manzana
          if (manzanaRef.current.visible) {
            const cx = nx + 50; // centro del bicho
            const cy = ny + 50;
            const distToApple = Math.sqrt(Math.pow(cx - manzanaRef.current.x, 2) + Math.pow(cy - manzanaRef.current.y, 2));
            if (distToApple < (manzanaRef.current.size / 2 + 50)) {
               vx = -vx;
               vy = -vy;
               nx = PosicionX + vx;
               ny = PosicionY + vy;
               if (m.hp < 10) m.hp += 1;
               manzanaRef.current.golpes += 1;
               manzanaRef.current.size = initialAppleSize - (manzanaRef.current.golpes * (initialAppleSize / 20));
               if (manzanaRef.current.golpes >= 20) manzanaRef.current.visible = false;
            }
          }
          
          if (nx <= 0) { nx = 0; vx = Math.abs(vx); }
          else if (nx >= window.innerWidth - 100) { nx = window.innerWidth - 100; vx = -Math.abs(vx); }
          
          if (ny <= 80) { ny = 80; vy = Math.abs(vy); }
          else if (ny >= window.innerHeight - 100) { ny = window.innerHeight - 100; vy = -Math.abs(vy); }
          
          return { ...m, PosicionX: nx, PosicionY: ny, vx, vy };
        });

        for (let i = 0; i < newBichos.length; i++) {
          for (let j = i + 1; j < newBichos.length; j++) {
            let dx = newBichos[i].PosicionX - newBichos[j].PosicionX;
            let dy = newBichos[i].PosicionY - newBichos[j].PosicionY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && !squashed[newBichos[i].Id] && !squashed[newBichos[j].Id]) {
              // Solo rebotar si se están acercando
              if ((newBichos[j].PosicionX - newBichos[i].PosicionX) * (newBichos[i].vx - newBichos[j].vx) + 
                  (newBichos[j].PosicionY - newBichos[i].PosicionY) * (newBichos[i].vy - newBichos[j].vy) > 0) {
                  
                  // Daño por color distinto
                  if (newBichos[i].Color !== newBichos[j].Color) {
                      newBichos[i].hp -= 1;
                      newBichos[j].hp -= 1;
                  }

                  let tempVx = newBichos[i].vx;
                  let tempVy = newBichos[i].vy;
                  newBichos[i].vx = newBichos[j].vx;
                  newBichos[i].vy = newBichos[j].vy;
                  newBichos[j].vx = tempVx;
                  newBichos[j].vy = tempVy;
              }
            }
          }
        }
        
        // Revisar muertos
        newBichos.forEach(b => {
          if (b.hp <= 0 && !squashed[b.Id]) {
            // setTimeout para evitar loops de renderizado directo
            setTimeout(() => aplastar(b.Id), 0);
          }
        });

        return newBichos;
      });
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [squashed]);

  const crear = async () => {
    const res = await fetch('http://localhost:3000/api/bichos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color })
    });
    const m = await res.json();
    setBichos(prev => [...prev, { 
      ...m, 
      vx: 2, 
      vy: 2, 
      hp: 10,
      PosicionX: Math.random() * (window.innerWidth - 150),
      PosicionY: Math.random() * (window.innerHeight - 150) + 80 
    }]);
  };

  const aplastar = async (id: number) => {
    setSquashed(prev => ({ ...prev, [id]: true }));
    await fetch('http://localhost:3000/api/bichos/' + id, { method: 'DELETE' });
    setTimeout(() => {
      setBichos(prev => prev.filter(m => m.Id !== id));
    }, 300);
  };

  const colorToSpanish: Record<string, string> = {
    red: 'rojo',
    yellow: 'amarillo',
    orange: 'naranjo',
    green: 'verde',
    blue: 'azul',
    purple: 'morado',
  };

  return (
    <div className="arena">
      <div className="navbar">
        <select value={color} onChange={e => setColor(e.target.value)} className="select-estilizado">
          <option value="">Selecciona un color</option>
          <option value="red">Rojo</option>
          <option value="yellow">Amarillo</option>
          <option value="blue">Azul</option>
          <option value="green">Verde</option>
          <option value="purple">Morado</option>
          <option value="orange">Naranjo</option>
        </select>
        <button onClick={crear} disabled={!color} className="btn-estilizado">Crear Bicho</button>
        <span>(Haz click en un bicho para aplastarlo)</span>
      </div>
      
      {manzanaRef.current.visible && (
        <div style={{
          position: 'absolute',
          left: manzanaRef.current.x - (manzanaRef.current.size / 2),
          top: manzanaRef.current.y - (manzanaRef.current.size / 2),
          width: manzanaRef.current.size,
          height: manzanaRef.current.size,
          backgroundImage: "url('/manzana.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.8,
          pointerEvents: 'none',
          transition: 'all 0.2s ease-in-out'
        }} />
      )}

      {bichos.map(m => {
        const rot = Math.atan2(m.vy, m.vx) * (180 / Math.PI) + 90;
        return (
          <div key={m.Id} style={{ position: 'absolute', left: m.PosicionX, top: m.PosicionY, width: 100, height: 100, pointerEvents: 'none' }}>
            <div style={{ 
              position: 'absolute', top: -35, width: '100%', textAlign: 'center', 
              color: m.Color === 'yellow' ? '#ffd700' : m.Color, 
              fontWeight: '900', textShadow: '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black', 
              fontSize: '16px', zIndex: 10, fontFamily: 'sans-serif', textTransform: 'uppercase'
            }}>
              <div>{m.hp}/10</div>
              <div>{getBichoName(m.Color, m.Id)}</div>
            </div>
            <div className="bicho" 
                 onClick={() => aplastar(m.Id)} 
                 style={{
                   pointerEvents: 'auto',
                   left: 0,
                   top: 0,
                   backgroundImage: `url('/${colorToSpanish[m.Color]}.png')`,
                   filter: squashed[m.Id] ? 'grayscale(100%)' : 'none',
                   transform: squashed[m.Id] ? 'scale(1.5, 0.2)' : `rotate(${rot}deg)`,
                 }}>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;
