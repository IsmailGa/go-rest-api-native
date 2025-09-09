import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

// Mock API для демонстрации
const mockApi = {
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    return { data: todos };
  },
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const newTodo = {
      id: Date.now(),
      title: data.title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    localStorage.setItem('todos', JSON.stringify(todos));
    return { data: newTodo };
  },
  put: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const id = parseInt(url.split('/').pop());
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...data };
      localStorage.setItem('todos', JSON.stringify(todos));
    }
    return { data: todos[index] };
  },
  delete: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const id = parseInt(url.split('/').pop());
    const filteredTodos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    return { data: {} };
  }
};

const ModalInfo = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'success':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md mx-4 p-6 rounded-2xl border-2 shadow-2xl ${getColors()} transform transition-all duration-300 ease-out animate-pulse`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [formData, setFormData] = useState({ title: '' });
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const showModal = (message, type = 'info') => {
    setModal({
      isVisible: true,
      message,
      type
    });
  };

  const closeModal = () => {
    setModal({
      isVisible: false,
      message: '',
      type: 'info'
    });
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await mockApi.get('/todos');
      setTodos(response.data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
      showModal("Не удалось загрузить задачи. Попробуйте еще раз.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Проверка на пустое поле
    if (!formData.title.trim()) {
      showModal("Пожалуйста, введите задачу перед добавлением!", 'warning');
      return;
    }

    try {
      setLoading(true);
      await mockApi.post('/todos', { title: formData.title.trim() });
      setFormData({ title: '' });
      await fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
      showModal("Не удалось добавить задачу. Попробуйте еще раз.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      setLoading(true);
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (todoToUpdate) {
        await mockApi.put(`/todos/${id}`, { ...todoToUpdate, completed: !currentStatus });
        await fetchTodos();
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      showModal("Не удалось обновить задачу. Попробуйте еще раз.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await mockApi.delete(`/todos/${id}`);
      await fetchTodos();
      showModal("Задача успешно удалена!", 'success');
    } catch (error) {
      console.error("Error deleting todo:", error);
      showModal("Не удалось удалить задачу. Попробуйте еще раз.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 tracking-tight">
            Todo List
          </h1>
          <p className="text-gray-600">Оставайтесь организованными и добивайтесь результатов</p>
        </div>

        {/* Основная карточка */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Секция формы */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex gap-3">
              <div className="flex-grow relative">
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ title: e.target.value })}
                  onKeyDown={handleKeyDown}
                  name='title'
                  type='text'
                  placeholder="Что нужно сделать?"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  disabled={loading}
                />
              </div>
              <button 
                type="button"
                onClick={handleAdd}
                disabled={loading}
                className="px-6 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Добавить
              </button>
            </div>
          </div>

          {/* Секция задач */}
          <div className="p-8">
            {loading && todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка задач...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todos.length > 0 ? (
                  todos.map(todo => (
                    <div 
                      key={todo.id} 
                      className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border-2 ${
                        todo.completed 
                          ? 'bg-green-50 border-green-200 text-gray-500' 
                          : 'bg-gray-50 hover:bg-white border-gray-200 hover:border-blue-200 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-grow">
                        <button
                          onClick={() => handleToggle(todo.id, todo.completed)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {todo.completed && <Check className="w-4 h-4" />}
                        </button>
                        <span 
                          className={`flex-grow cursor-pointer text-lg transition-all duration-200 ${
                            todo.completed ? 'line-through text-gray-500' : 'text-gray-700 hover:text-gray-900'
                          }`}
                          onClick={() => handleToggle(todo.id, todo.completed)}
                        >
                          {todo.title}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(todo.id)} 
                        className="opacity-0 group-hover:opacity-100 ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                        title="Удалить задачу"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Check className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Пока нет задач</h3>
                    <p className="text-gray-500">Добавьте первую задачу, чтобы начать!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Статистика */}
          {todos.length > 0 && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{todos.filter(todo => !todo.completed).length} активных</span>
                <span>{todos.filter(todo => todo.completed).length} выполнено</span>
                <span>{todos.length} всего</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      <ModalInfo
        message={modal.message}
        type={modal.type}
        isVisible={modal.isVisible}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;