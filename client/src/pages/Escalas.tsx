import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Layout } from '../components/Layout';
import { formatarData, getCorOficial } from '../lib/foCalculator';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

const SIGLAS = ['VD', 'AM', 'AZ', 'FO', 'DS', 'F', 'PA', 'LP', 'LTS'];

export default function Escalas() {
  const utils = trpc.useUtils();
  const { data: bombeiros } = trpc.bombeiros.list.useQuery();
  const updateEscala = trpc.escalas.update.useMutation({
    onSuccess: () => utils.bombeiros.list.invalidate()
  });

  const [mesAtual, setMesAtual] = useState(new Date(2026, 3, 1)); // Abril 2026

  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const diasArr = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-2xl mb-6 flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase italic">Controle de Escala Mensal</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><ChevronLeft size={20}/></button>
          <span className="font-bold text-red-500 uppercase tracking-widest">{mesAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-[10px] font-black text-slate-500 uppercase">
              <th className="p-4 border-b border-slate-800 sticky left-0 bg-slate-900 z-10">Bombeiro</th>
              {diasArr.map(dia => (
                <th key={dia} className="p-2 border-b border-slate-800 text-center min-w-[40px]">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bombeiros?.map((b: any) => {
              const escalaMap = b.escalas.reduce((acc:any, curr:any) => ({...acc, [curr.data]: curr.sigla}), {});
              return (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 border-r border-slate-800 font-bold text-slate-300 uppercase text-xs sticky left-0 bg-[#0F172A] z-10 shadow-xl">{b.nome}</td>
                  {diasArr.map(dia => {
                    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    const sigla = escalaMap[dataStr] || '';
                    const corOficial = getCorOficial(new Date(dataStr + 'T12:00:00'));

                    return (
                      <td key={dia} className="p-1 border-r border-slate-800/50 text-center">
                        <select 
                          value={sigla}
                          onChange={(e) => updateEscala.mutate({ bombeiroId: b.id, data: dataStr, sigla: e.target.value })}
                          className={`w-10 h-8 rounded text-[10px] font-black border-none outline-none appearance-none text-center cursor-pointer transition-all ${
                            sigla === corOficial ? 'bg-green-600 text-white' : 
                            sigla === 'FO' ? 'bg-purple-600 text-white shadow-[0_0_8px_purple]' :
                            sigla === '' ? 'bg-slate-800 text-slate-500' : 'bg-red-900 text-white'
                          }`}
                        >
                          <option value="">-</option>
                          {SIGLAS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}