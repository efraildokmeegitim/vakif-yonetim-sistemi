import React, { useState, useEffect } from 'react';
import { api } from './api';
import { CheckSquare, Square, Plus, Trash2, ListTodo } from 'lucide-react';

export default function Todos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch (err) {
      console.error('Failed to fetch todos', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.post('/todos', { title: newTitle.trim() });
      setTodos([res.data, ...todos]);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to create todo', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    // Optimistic update
    setTodos(todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    try {
      await api.patch(`/todos/${id}/toggle`);
    } catch (err) {
      // Revert on failure
      fetchTodos();
      console.error('Failed to toggle todo', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    
    // Optimistic update
    setTodos(todos.filter(t => t.id !== id));
    try {
      await api.delete(`/todos/${id}`);
    } catch (err) {
      // Revert on failure
      fetchTodos();
      console.error('Failed to delete todo', err);
    }
  };

  const completedCount = todos.filter(t => t.isCompleted).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <ListTodo className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yapılacaklar Listem</h1>
          <p className="text-gray-500">Kendinize özel görevlerinizi buradan takip edebilirsiniz.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Yeni görev ekle..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} /> Ekle
            </button>
          </form>
        </div>

        {totalCount > 0 && (
          <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-500 min-w-[100px] text-right">
              {completedCount} / {totalCount} Tamamlandı
            </span>
          </div>
        )}

        <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {todos.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <ListTodo className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Henüz bir görev eklemediniz.</p>
            </div>
          ) : (
            todos.map(todo => (
              <li 
                key={todo.id} 
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group ${todo.isCompleted ? 'opacity-70' : ''}`}
              >
                <button 
                  onClick={() => handleToggle(todo.id)}
                  className="shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                >
                  {todo.isCompleted ? (
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  )}
                </button>
                
                <span className={`flex-1 text-lg transition-all ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {todo.title}
                </span>

                <button 
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all focus:opacity-100 focus:outline-none"
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
