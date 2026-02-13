import React, { useState } from 'react';
import { AppData, VendorService, VendorOption } from '../types.ts';
import { 
  Phone, Trash2, Plus, Star, ChevronDown, ChevronUp, 
  FileText, Trophy, CheckCircle2
} from 'lucide-react';

interface VendorListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const VendorList: React.FC<VendorListProps> = ({ data, onUpdate }) => {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');

  // --- Service Management ---
  const addService = () => {
    if (!newServiceName.trim()) return;
    const newService: VendorService = {
      id: crypto.randomUUID(),
      name: newServiceName,
      options: []
    };
    onUpdate({
      ...data,
      vendorServices: [...(data.vendorServices || []), newService]
    });
    setNewServiceName('');
    setExpandedServiceId(newService.id);
  };

  const removeService = (id: string) => {
    if(!confirm("Tem certeza? Isso apagará todos os orçamentos deste item.")) return;
    onUpdate({
      ...data,
      vendorServices: data.vendorServices.filter(s => s.id !== id)
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  // --- Vendor Options Management ---
  const addOptionToService = (serviceId: string) => {
    const newOption: VendorOption = {
      id: crypto.randomUUID(),
      name: '',
      contact: '',
      quote: 0,
      rating: 0,
      notes: ''
    };
    
    const updatedServices = data.vendorServices.map(service => {
      if (service.id === serviceId) {
        return { ...service, options: [...service.options, newOption] };
      }
      return service;
    });
    onUpdate({ ...data, vendorServices: updatedServices });
  };

  const updateOption = (serviceId: string, optionId: string, field: keyof VendorOption, value: any) => {
    const updatedServices = data.vendorServices.map(service => {
      if (service.id === serviceId) {
        const updatedOptions = service.options.map(opt => 
          opt.id === optionId ? { ...opt, [field]: value } : opt
        );
        return { ...service, options: updatedOptions };
      }
      return service;
    });
    onUpdate({ ...data, vendorServices: updatedServices });
  };

  const removeOption = (serviceId: string, optionId: string) => {
    const updatedServices = data.vendorServices.map(service => {
      if (service.id === serviceId) {
        return { 
          ...service, 
          options: service.options.filter(o => o.id !== optionId),
          selectedOptionId: service.selectedOptionId === optionId ? undefined : service.selectedOptionId
        };
      }
      return service;
    });
    onUpdate({ ...data, vendorServices: updatedServices });
  };

  const selectWinner = (serviceId: string, optionId: string) => {
    const updatedServices = data.vendorServices.map(service => {
      if (service.id === serviceId) {
        return { 
          ...service, 
          selectedOptionId: service.selectedOptionId === optionId ? undefined : optionId 
        };
      }
      return service;
    });
    onUpdate({ ...data, vendorServices: updatedServices });
  };

  // --- Calculations ---
  const totalSelected = (data.vendorServices || []).reduce((acc, service) => {
    const winner = service.options.find(o => o.id === service.selectedOptionId);
    return acc + (winner ? winner.quote : 0);
  }, 0);

  const renderStars = (serviceId: string, optionId: string, currentRating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => updateOption(serviceId, optionId, 'rating', star)}
          className="focus:outline-none transition-transform active:scale-95"
        >
          <Star className={`w-4 h-4 ${star <= currentRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="pb-24 space-y-6">
      {/* Header com Total */}
      <div className="bg-brand-600 p-6 rounded-2xl shadow-lg text-white sticky top-2 z-10">
        <h2 className="text-xl font-bold mb-1">Concorrência</h2>
        <p className="text-brand-100 text-sm mb-4">Compare e escolha os melhores</p>
        <div className="flex items-end justify-between">
            <div className="text-brand-100 text-xs uppercase font-semibold tracking-wider">Total Contratado</div>
            <div className="text-3xl font-bold">R$ {totalSelected.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      {/* Criar Novo Serviço */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex gap-2">
        <input 
            className="flex-1 p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none min-w-0"
            placeholder="Novo item (ex: DJ, Lembrancinhas)..."
            value={newServiceName}
            onChange={e => setNewServiceName(e.target.value)}
        />
        <button 
            onClick={addService}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm shrink-0"
        >
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de Serviços */}
      <div className="space-y-4">
        {(data.vendorServices || []).map(service => {
            const winner = service.options.find(o => o.id === service.selectedOptionId);
            const isExpanded = expandedServiceId === service.id;

            const lowestPrice = service.options.length > 0 
                ? Math.min(...service.options.filter(o => o.quote > 0).map(o => o.quote)) 
                : 0;

            return (
                <div key={service.id} className={`bg-white rounded-xl shadow-sm border transition-all ${winner ? 'border-brand-200 ring-1 ring-brand-50' : 'border-slate-200'}`}>
                    
                    {/* Service Header Card */}
                    <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl transition-colors select-none"
                        onClick={() => toggleExpand(service.id)}
                    >
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className={`font-bold text-lg truncate ${winner ? 'text-brand-700' : 'text-slate-700'}`}>
                                {service.name}
                            </h3>
                            <div className="flex items-center mt-1">
                                {winner ? (
                                    <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full truncate max-w-full">
                                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                                        <span className="truncate">{winner.name}</span>
                                        <span className="ml-1 shrink-0">(R$ {winner.quote})</span>
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400">
                                        {service.options.length} orçamentos
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                             {isExpanded && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeService(service.id); }}
                                    className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                             {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 space-y-4 rounded-b-xl">
                            {service.options.length === 0 && (
                                <div className="text-center py-4 text-slate-400 text-sm">
                                    Adicione fornecedores para comparar.
                                </div>
                            )}

                            {service.options.map(option => {
                                const isWinner = service.selectedOptionId === option.id;
                                const isBestPrice = option.quote > 0 && option.quote === lowestPrice;

                                return (
                                    <div 
                                        key={option.id} 
                                        className={`relative bg-white p-3 rounded-xl border transition-all shadow-sm ${
                                            isWinner ? 'border-green-500 ring-1 ring-green-500 shadow-md z-10' : 'border-slate-200'
                                        }`}
                                    >
                                        {/* Badges Overlay */}
                                        <div className="absolute -top-2 left-4 flex gap-2 z-10 pointer-events-none">
                                            {isBestPrice && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-green-200">
                                                    Melhor Preço
                                                </span>
                                            )}
                                            {isWinner && (
                                                <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center border border-brand-700">
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    Contratado
                                                </span>
                                            )}
                                        </div>

                                        {/* Main Layout */}
                                        <div className="flex gap-2 pt-2">
                                            {/* Select Button Column */}
                                            <div className="pt-2">
                                                <button 
                                                    onClick={() => selectWinner(service.id, option.id)}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        isWinner 
                                                        ? 'border-brand-500 bg-brand-500 text-white shadow-sm' 
                                                        : 'border-slate-300 hover:border-brand-400 text-slate-300 hover:text-brand-400 bg-white'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Inputs Column - Added min-w-0 to prevent flex overflow */}
                                            <div className="flex-1 space-y-2 min-w-0">
                                                
                                                {/* Row 1: Name & Price */}
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input 
                                                        className={`w-full p-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${isWinner ? 'font-bold text-slate-900 border-green-200 bg-green-50/30' : 'text-slate-700 border-slate-300'}`}
                                                        placeholder="Nome da Empresa"
                                                        value={option.name}
                                                        onChange={e => updateOption(service.id, option.id, 'name', e.target.value)}
                                                    />
                                                    <div className="relative w-full sm:w-32">
                                                        <span className="absolute left-2 top-2 text-slate-400 text-xs">R$</span>
                                                        <input 
                                                            type="number"
                                                            className="w-full pl-6 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                                                            placeholder="0,00"
                                                            value={option.quote || ''}
                                                            onChange={e => updateOption(service.id, option.id, 'quote', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 2: Contact & Rating - Flex wrap enabled */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="relative flex-1 min-w-[140px]">
                                                        <Phone className="absolute left-2 top-2.5 w-3 h-3 text-slate-400" />
                                                        <input 
                                                            className="w-full pl-7 p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none truncate"
                                                            placeholder="Contato / Telefone"
                                                            value={option.contact}
                                                            onChange={e => updateOption(service.id, option.id, 'contact', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 shrink-0">
                                                        {renderStars(service.id, option.id, option.rating)}
                                                    </div>
                                                </div>

                                                {/* Row 3: Notes */}
                                                <div className="relative">
                                                    <FileText className="absolute left-2 top-2.5 w-3 h-3 text-slate-300" />
                                                    <textarea 
                                                        className="w-full pl-7 p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                                        rows={1}
                                                        placeholder="Observações..."
                                                        value={option.notes || ''}
                                                        onChange={e => updateOption(service.id, option.id, 'notes', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="pt-2">
                                                <button 
                                                    onClick={() => removeOption(service.id, option.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <button 
                                onClick={() => addOptionToService(service.id)}
                                className="w-full py-3 flex items-center justify-center text-sm font-medium text-brand-600 bg-white border border-dashed border-brand-300 rounded-xl hover:bg-brand-50 hover:border-brand-400 transition-all shadow-sm active:scale-[0.99]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Concorrente
                            </button>
                        </div>
                    )}
                </div>
            );
        })}

        {(!data.vendorServices || data.vendorServices.length === 0) && (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Crie um item (ex: Buffet) para começar a orçar.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VendorList;