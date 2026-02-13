import React, { useState } from 'react';
import { AppData, Category, Task } from '../types.ts';
import { Trash2, Plus, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';

interface BudgetManagerProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ data, onUpdate }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCatName,
      tasks: []
    };
    onUpdate({
      ...data,
      categories: [...data.categories, newCategory]
    });
    setNewCatName('');
  };

  const removeCategory = (catId: string) => {
    if (!confirm('Tem certeza? Todas as tarefas desta categoria serão excluídas.')) return;
    onUpdate({
      ...data,
      categories: data.categories.filter(c => c.id !== catId)
    });
  };

  const addTask = (catId: string) => {
    const updatedCategories = data.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          tasks: [...cat.tasks, {
            id: crypto.randomUUID(),
            description: 'Nova Tarefa',
            budgeted: 0,
            spent: 0,
            completed: false
          }]
        };
      }
      return cat;
    });
    onUpdate({ ...data, categories: updatedCategories });
    if(expandedCat !== catId) setExpandedCat(catId);
  };

  const updateTask = (catId: string, taskId: string, field: keyof Task, value: any) => {
    const updatedCategories = data.categories.map(cat => {
      if (cat.id === catId) {
        const updatedTasks = cat.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, [field]: value };
          }
          return task;
        });
        return { ...cat, tasks: updatedTasks };
      }
      return cat;
    });
    onUpdate({ ...data, categories: updatedCategories });
  };

  const removeTask = (catId: string, taskId: string) => {
    const updatedCategories = data.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          tasks: cat.tasks.filter(t => t.id !== taskId)
        };
      }
      return cat;
    });
    onUpdate({ ...data, categories: updatedCategories });
  };

  return (
    <div className="pb-24 space-y-6">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-2 z-10">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Orçamento & Tarefas</h2>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nova Categoria..."
                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-w-0"
            />
            <button 
                onClick={addCategory}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm shrink-0"
            >
                Adicionar
            </button>
        </div>
       </div>

       <div className="space-y-4">
        {data.categories.map(cat => {
            const catBudget = cat.tasks.reduce((acc, t) => acc + t.budgeted, 0);
            const catSpent = cat.tasks.reduce((acc, t) => acc + t.spent, 0);

            return (
                <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Category Header */}
                    <div 
                        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors select-none"
                        onClick={() => toggleCategory(cat.id)}
                    >
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-slate-800 truncate">{cat.name}</h3>
                            <div className="text-xs text-slate-500 mt-1 space-x-2 truncate">
                                <span>Orçado: R$ {catBudget}</span>
                                <span className={catSpent > catBudget ? 'text-red-500 font-bold' : 'text-slate-500'}>
                                    Gasto: R$ {catSpent}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                             <button 
                                onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                                className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             {expandedCat === cat.id ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
                        </div>
                    </div>

                    {/* Task List */}
                    {expandedCat === cat.id && (
                        <div className="p-4 border-t border-slate-100 space-y-4 bg-white">
                            {cat.tasks.length === 0 && (
                                <p className="text-center text-sm text-slate-400 py-2">Nenhuma tarefa nesta categoria.</p>
                            )}
                            
                            {cat.tasks.map(task => (
                                <div key={task.id} className="flex flex-col gap-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateTask(cat.id, task.id, 'completed', !task.completed)} className="shrink-0">
                                            {task.completed ? 
                                                <CheckSquare className="w-5 h-5 text-brand-600" /> : 
                                                <Square className="w-5 h-5 text-slate-300" />
                                            }
                                        </button>
                                        <input 
                                            type="text"
                                            value={task.description}
                                            onChange={(e) => updateTask(cat.id, task.id, 'description', e.target.value)}
                                            className={`flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 min-w-0 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}
                                        />
                                         <button 
                                            onClick={() => removeTask(cat.id, task.id)}
                                            className="text-slate-300 hover:text-red-500 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 pl-7">
                                        <div className="flex-1">
                                            <label className="block text-[10px] text-slate-400 uppercase font-semibold">Orçado</label>
                                            <div className="flex items-center border-b border-slate-200 focus-within:border-brand-500">
                                                <span className="text-xs text-slate-400 mr-1">R$</span>
                                                <input 
                                                    type="number"
                                                    value={task.budgeted}
                                                    onChange={(e) => updateTask(cat.id, task.id, 'budgeted', parseFloat(e.target.value) || 0)}
                                                    className="w-full text-sm p-1 bg-transparent border-none focus:ring-0 text-slate-600 min-w-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] text-slate-400 uppercase font-semibold">Gasto</label>
                                            <div className="flex items-center border-b border-slate-200 focus-within:border-brand-500">
                                                <span className="text-xs text-slate-400 mr-1">R$</span>
                                                <input 
                                                    type="number"
                                                    value={task.spent}
                                                    onChange={(e) => updateTask(cat.id, task.id, 'spent', parseFloat(e.target.value) || 0)}
                                                    className={`w-full text-sm p-1 bg-transparent border-none focus:ring-0 min-w-0 ${task.spent > task.budgeted ? 'text-red-500 font-bold' : 'text-slate-600'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={() => addTask(cat.id)}
                                className="w-full py-3 mt-2 flex items-center justify-center text-sm text-brand-600 border border-dashed border-brand-200 rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-all active:scale-[0.99]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Tarefa
                            </button>
                        </div>
                    )}
                </div>
            );
        })}
       </div>
    </div>
  );
};

export default BudgetManager;