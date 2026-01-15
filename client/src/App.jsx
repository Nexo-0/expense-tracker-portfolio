import { useState, useEffect } from 'react';
import { Trash2, Plus, Moon, Sun, Activity, Wallet } from 'lucide-react';

// FIX: Automatically remove trailing slash if present to prevent URL errors
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses';
const API_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food' });
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // 1. Load data from Backend
  useEffect(() => { fetchExpenses() }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      if(Array.isArray(data)) setExpenses(data);
    } catch(err) { 
      console.error("Error fetching:", err); 
    } finally {
      setLoading(false);
    }
  };

  // 2. Add new Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.title || !form.amount) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses([data, ...expenses]); // Update UI instantly
        setForm({ ...form, title: '', amount: '' });
      }
    } catch(err) { console.error("Error adding:", err); }
  };

  // 3. Delete Expense
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e._id !== id));
    } catch(err) { console.error("Error deleting:", err); }
  };

  const total = expenses.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500 selection:text-white`}>
      
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse ${darkMode ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse delay-1000 ${darkMode ? 'bg-blue-600' : 'bg-blue-300'}`}></div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <header className="flex justify-between items-center mb-10 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expense<span className="text-purple-500">Tracker</span></h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">PORTFOLIO PROJECT</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full border backdrop-blur-md transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Left Side: Form & Total */}
          <div className="md:col-span-5 space-y-6">
            <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-1">Total Balance</p>
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    ${total.toLocaleString()}
                  </h2>
                </div>
                <div className={`p-3 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <Wallet size={24} className={darkMode ? 'text-white' : 'text-gray-600'} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl space-y-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'}`}>
              <h3 className="font-semibold text-lg mb-2">Add Transaction</h3>
              <div className="space-y-4">
                <input 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="What did you buy?" 
                  className={`w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${darkMode ? 'bg-black/20 border-white/10 placeholder-gray-600' : 'bg-gray-50 border-gray-200'}`}
                />
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: +e.target.value})}
                    placeholder="$$$" 
                    className={`w-24 border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${darkMode ? 'bg-black/20 border-white/10 placeholder-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  />
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className={`flex-1 border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${darkMode ? 'bg-black/20 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                  >
                    {['Food','Travel','Bills','Shopping','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2">
                <Plus size={20} /> Add Transaction
              </button>
            </form>
          </div>

          {/* Right Side: List */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-semibold text-lg px-2">Recent Activity</h3>
            
            {loading && <div className="text-center py-10 opacity-50">Loading expenses...</div>}
            
            {!loading && expenses.length === 0 && (
              <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-500/20 rounded-2xl">
                No expenses yet. Add one!
              </div>
            )}

            <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((exp) => (
                <div key={exp._id} className={`group flex justify-between items-center p-5 rounded-2xl border transition-all hover:scale-[1.01] ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${darkMode ? 'bg-white/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                      {exp.category[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg leading-tight">{exp.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(exp.createdAt || Date.now()).toLocaleDateString()} • {exp.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-red-400">-${exp.amount}</span>
                    <button onClick={() => handleDelete(exp._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}