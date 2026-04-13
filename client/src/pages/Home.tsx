// Dentro do seu Home.tsx, importe o calculador no topo:
import { calcularFO } from '../lib/foCalculator';

// ... dentro do seu componente, na parte da tabela:
{bombeiros?.map((b: any) => {
  // Chamamos o cálculo para cada bombeiro da lista
  const stats = calcularFO(new Date(b.dataInicio), b.escala || {});

  return (
    <tr key={b.id} className="hover:bg-slate-800/40 border-b border-slate-800">
      <td className="px-6 py-4 font-bold text-slate-200 uppercase">{b.nome}</td>
      <td className="px-6 py-4">
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-500">CONQUISTADAS</p>
            <p className="text-green-500 font-bold">{stats.conquistadas}</p>
          </div>
          <div className="text-center border-l border-slate-700 pl-4">
            <p className="text-[10px] text-slate-500">DISPONÍVEIS</p>
            <p className="text-amber-500 font-bold">{stats.disponiveis}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {/* Barra de Progresso 0/9 */}
        <p className="text-[10px] text-slate-500 mb-1">PROGRESSO: {stats.progresso}/9</p>
        <div className="w-32 bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-red-600 h-full transition-all" 
            style={{ width: `${(stats.progresso / 9) * 100}%` }}
          ></div>
        </div>
      </td>
    </tr>
  );
})}