import React, { useState } from "react";
import { AppData, Category, Task, TaskStatus } from "../types";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface BudgetManagerProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ data, onUpdate }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");

  const statusMeta: Record<
    TaskStatus,
    {
      label: string;
      emoji: string;
      sectionClass: string;
      sectionBlockClass: string;
      badgeClass: string;
      taskClass: string;
      selectClass: string;
    }
  > = {
    [TaskStatus.TODO]: {
      label: "À Fazer",
      emoji: "📝",
      sectionClass: "text-slate-600 dark:text-slate-300",
      sectionBlockClass:
        "bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-700",
      badgeClass:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      taskClass:
        "bg-white border-slate-200 border-l-4 border-l-slate-400 dark:bg-slate-900/70 dark:border-slate-700 dark:border-l-slate-500",
      selectClass:
        "bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:focus:ring-slate-700",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "Em Andamento",
      emoji: "🚧",
      sectionClass: "text-amber-700 dark:text-amber-300",
      sectionBlockClass:
        "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      badgeClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
      taskClass:
        "bg-white border-amber-200 border-l-4 border-l-amber-500 dark:bg-slate-900/70 dark:border-amber-800 dark:border-l-amber-500",
      selectClass:
        "bg-amber-100 text-amber-700 border-amber-300 focus:ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700 dark:focus:ring-amber-700",
    },
    [TaskStatus.COMPLETED]: {
      label: "Concluída",
      emoji: "✅",
      sectionClass: "text-emerald-700 dark:text-emerald-300",
      sectionBlockClass:
        "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
      badgeClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
      taskClass:
        "bg-white border-emerald-200 border-l-4 border-l-emerald-500 dark:bg-slate-900/70 dark:border-emerald-800 dark:border-l-emerald-500",
      selectClass:
        "bg-emerald-100 text-emerald-700 border-emerald-300 focus:ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700 dark:focus:ring-emerald-700",
    },
  };

  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.status) return task.status;
    return task.completed ? TaskStatus.COMPLETED : TaskStatus.TODO;
  };

  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCatName,
      tasks: [],
    };
    onUpdate({
      ...data,
      categories: [...data.categories, newCategory],
    });
    setNewCatName("");
  };

  const removeCategory = (catId: string) => {
    if (
      !confirm("Tem certeza? Todas as tarefas desta categoria serão excluídas.")
    )
      return;
    onUpdate({
      ...data,
      categories: data.categories.filter((c) => c.id !== catId),
    });
  };

  const addTask = (catId: string) => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          tasks: [
            ...cat.tasks,
            {
              id: crypto.randomUUID(),
              description: "Nova Tarefa",
              notes: "",
              status: TaskStatus.TODO,
            },
          ],
        };
      }
      return cat;
    });
    onUpdate({ ...data, categories: updatedCategories });
    if (expandedCat !== catId) setExpandedCat(catId);
  };

  const updateTask = (
    catId: string,
    taskId: string,
    field: keyof Task,
    value: any,
  ) => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === catId) {
        const updatedTasks = cat.tasks.map((task) => {
          if (task.id === taskId) {
            if (field === "status") {
              return {
                ...task,
                status: value as TaskStatus,
                completed: value === TaskStatus.COMPLETED,
              };
            }

            if (field === "completed") {
              return {
                ...task,
                completed: Boolean(value),
                status: value ? TaskStatus.COMPLETED : TaskStatus.TODO,
              };
            }

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
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          tasks: cat.tasks.filter((t) => t.id !== taskId),
        };
      }
      return cat;
    });
    onUpdate({ ...data, categories: updatedCategories });
  };

  return (
    <div className="pb-24 space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-2 z-10">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          🧩 Missões da Festa
        </h2>
        <p className="text-xs text-slate-500 mb-2">
          Organize cada etapa com carinho e diversão.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nova missão (ex: Lembrancinhas)..."
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
        {data.categories.map((cat) => {
          const catTaskCount = cat.tasks.length;

          return (
            <div
              key={cat.id}
              className="bg-white dark:!bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:!border-slate-700 overflow-hidden"
            >
              {/* Category Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 dark:!bg-slate-800 dark:hover:!bg-slate-700 transition-colors select-none"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-semibold text-slate-800 dark:!text-slate-100 truncate">
                    {cat.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:!text-slate-300 mt-1 space-x-2 truncate">
                    <span>
                      {catTaskCount} {catTaskCount === 1 ? "tarefa" : "tarefas"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(cat.id);
                    }}
                    className="text-slate-400 dark:!text-slate-300 hover:text-red-500 dark:hover:!text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:!bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedCat === cat.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 dark:!text-slate-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 dark:!text-slate-300" />
                  )}
                </div>
              </div>

              {/* Task List */}
              {expandedCat === cat.id && (
                <div className="p-4 border-t border-slate-100 space-y-4 bg-white">
                  {cat.tasks.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-2">
                      Nenhuma tarefa nesta categoria.
                    </p>
                  )}

                  {[
                    {
                      status: TaskStatus.TODO,
                      empty: "Sem tarefas neste status.",
                    },
                    {
                      status: TaskStatus.IN_PROGRESS,
                      empty: "Sem tarefas neste status.",
                    },
                    {
                      status: TaskStatus.COMPLETED,
                      empty: "Sem tarefas neste status.",
                    },
                  ].map((section) => {
                    const sectionTasks = cat.tasks.filter(
                      (task) => getTaskStatus(task) === section.status,
                    );
                    const sectionMeta = statusMeta[section.status];

                    return (
                      <div
                        key={section.status}
                        className={`space-y-3 border rounded-xl p-3 ${sectionMeta.sectionBlockClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-black uppercase tracking-wide ${sectionMeta.sectionClass}`}
                          >
                            {sectionMeta.emoji} {sectionMeta.label}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sectionMeta.badgeClass}`}
                          >
                            {sectionTasks.length}
                          </span>
                        </div>

                        {sectionTasks.length === 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">
                            {section.empty}
                          </p>
                        )}

                        {sectionTasks.map((task) => {
                          const taskStatus = getTaskStatus(task);
                          const isCompleted =
                            taskStatus === TaskStatus.COMPLETED;
                          const currentStatusMeta = statusMeta[taskStatus];

                          return (
                            <div
                              key={task.id}
                              className={`flex flex-col gap-3 border rounded-xl p-3 shadow-sm ${currentStatusMeta.taskClass}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${currentStatusMeta.badgeClass}`}
                                >
                                  {currentStatusMeta.emoji}{" "}
                                  {currentStatusMeta.label}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={taskStatus}
                                    onChange={(e) =>
                                      updateTask(
                                        cat.id,
                                        task.id,
                                        "status",
                                        e.target.value as TaskStatus,
                                      )
                                    }
                                    className={`text-xs border rounded-md px-2 py-1 font-semibold outline-none focus:ring-2 ${currentStatusMeta.selectClass}`}
                                  >
                                    <option value={TaskStatus.TODO}>
                                      📝 À Fazer
                                    </option>
                                    <option value={TaskStatus.IN_PROGRESS}>
                                      🚧 Em Andamento
                                    </option>
                                    <option value={TaskStatus.COMPLETED}>
                                      ✅ Concluída
                                    </option>
                                  </select>
                                  <button
                                    onClick={() => removeTask(cat.id, task.id)}
                                    className="text-slate-300 hover:text-red-500 shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={task.description}
                                onChange={(e) =>
                                  updateTask(
                                    cat.id,
                                    task.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className={`w-full text-sm bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 min-w-0 ${isCompleted ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100 font-medium"}`}
                              />
                              <div>
                                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                  Observação
                                </label>
                                <textarea
                                  value={task.notes || ""}
                                  onChange={(e) =>
                                    updateTask(
                                      cat.id,
                                      task.id,
                                      "notes",
                                      e.target.value,
                                    )
                                  }
                                  rows={2}
                                  placeholder="Adicione detalhes importantes da tarefa..."
                                  className="w-full text-sm p-2 bg-white/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

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
