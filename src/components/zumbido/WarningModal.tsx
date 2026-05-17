import { AlertTriangle, Headphones, ShieldCheck, Check } from 'lucide-react';

export function WarningModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Segurança Auditiva</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <Headphones className="w-6 h-6 text-[#1D9E75] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Uso Recomendado de Fones</h3>
              <p className="text-sm text-slate-600 mt-1">
                Para o correto mascaramento ou equalização do zumbido, utilize fones de ouvido de boa qualidade.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-[#1D9E75] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Calibragem de Volume</h3>
              <p className="text-sm text-slate-600 mt-1">
                Este aplicativo possui uma trava de segurança limitando a saída a 80% do ganho máximo da API. No entanto, <strong>você deve manter o volume do seu smartphone em um nível confortável (nível de conversação)</strong>, abaixo do aviso "excessivo" (aprox. 85dB) do seu aparelho.
              </p>
            </div>
          </div>

          <div className="bg-[#E1F7EE] p-4 rounded-xl border border-[#1D9E75] mt-4">
            <p className="text-xs text-[#0a4a35] font-medium">
              <strong>Regra de Ouro (TRT):</strong> Na Terapia Sonora, o ruído não deve abafar completamente o zumbido. Encontre o "Ponto de Mistura" (Mixing Point) onde o som de alívio fique ligeiramente abaixo do volume do seu zumbido.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full bg-[#1D9E75] hover:bg-[#16805E] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Check className="w-5 h-5" />
            Entendido, prosseguir
          </button>
        </div>
      </div>
    </div>
  );
}
