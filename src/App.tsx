import { useState, useEffect } from 'react';

interface Bicho {
  Id: number;
  PosicionX: number;
  PosicionY: number;
  Color: string;
  vx: number;
  vy: number;
  hp: number;
}

function App() {
  const [bichos, setBichos] = useState<Bicho[]>([]);
  const [squashed, setSquashed] = useState<Record<number, boolean>>({});
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Ya no usamos el useEffect inicial para cargar de la API
  
  const iniciarJuego = () => {
    const colors = ['red', 'purple', 'yellow', 'green', 'blue', 'orange'];
    const newBichos: Bicho[] = [];
    let idCounter = 1;

    colors.forEach(c => {
      for (let i = 0; i < 10; i++) {
        newBichos.push({
          Id: idCounter++,
          Color: c,
          PosicionX: Math.random() * (window.innerWidth - 150),
          PosicionY: Math.random() * (window.innerHeight - 150) + 80,
          vx: Math.random() > 0.5 ? 2.5 : -2.5,
          vy: Math.random() > 0.5 ? 2.5 : -2.5,
          hp: 10
        });
      }
    });

    setBichos(newBichos);
    setSquashed({});
    setJuegoIniciado(true);
  };

  useEffect(() => {
    if (!juegoIniciado) return;

    let animationFrameId: number;
    const update = () => {
      setBichos(prev => {
        let newBichos = prev.map(m => {
          if (squashed[m.Id]) return m;
          
          let { PosicionX, PosicionY, vx, vy } = m;
          let nx = PosicionX + vx;
          let ny = PosicionY + vy;
          
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
            setTimeout(() => aplastar(b.Id), 0);
          }
        });

        return newBichos;
      });
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [juegoIniciado, squashed]);

  const aplastar = (id: number) => {
    setSquashed(prev => ({ ...prev, [id]: true }));
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

  const playerNames: Record<string, string> = {
    red: 'Diego',
    purple: 'Richard',
    yellow: 'Fabián',
    green: 'Gonzalo',
    blue: 'Emilio',
    orange: 'Pablo'
  };

  // Calcular puntajes (bichos vivos por color)
  const score = { red: 0, purple: 0, yellow: 0, green: 0, blue: 0, orange: 0 };
  bichos.forEach(b => {
    if (b.hp > 0 && !squashed[b.Id]) {
      score[b.Color as keyof typeof score]++;
    }
  });

  return (
    <div className="arena">
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '80px',
        backgroundColor: '#111', color: 'white', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', padding: '0 20px',
        zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)', boxSizing: 'border-box'
      }}>
        {!juegoIniciado ? (
          <button 
            onClick={iniciarJuego} 
            style={{ padding: '10px 30px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            START BATTLE
          </button>
        ) : (
          <button 
            onClick={iniciarJuego} 
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            RESTART
          </button>
        )}

        <div style={{ display: 'flex', gap: '20px', fontSize: '18px', fontWeight: 'bold' }}>
          {Object.entries(score).map(([col, count]) => (
            <div key={col} style={{ 
              color: col === 'yellow' ? '#ffd700' : col,
              textShadow: '1px 1px 2px black',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <span>{playerNames[col]}</span>
              <span style={{ fontSize: '24px' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {bichos.map(m => {
        const rot = Math.atan2(m.vy, m.vx) * (180 / Math.PI) + 90;
        return (
          <div key={m.Id} style={{ position: 'absolute', left: m.PosicionX, top: m.PosicionY, width: 100, height: 100, pointerEvents: 'none' }}>
            <div style={{ 
              position: 'absolute', top: -20, width: '100%', textAlign: 'center', 
              color: m.Color === 'yellow' ? '#ffd700' : m.Color, 
              fontWeight: '900', textShadow: '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black', 
              fontSize: '20px', zIndex: 10, fontFamily: 'sans-serif'
            }}>
              {m.hp}/10
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
