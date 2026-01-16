import { useState, useEffect } from 'react';
import { Trash2, Plus, Moon, Sun, Activity, Calendar, Wallet, Landmark } from 'lucide-react';
import ExpenseChart from './ExpenseChart';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses';
const API_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('totalBudget');
    return saved ? JSON.parse(saved) : 50000;
  });

  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    category: 'Food', 
    date: new Date().toISOString().split('T')[0],
    description: '' 
  });

  const formatINR = (number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    localStorage.setItem('totalBudget', JSON.stringify(budget));
  }, [budget]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) setExpenses(data);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses([data, ...expenses]);
        setForm({ ...form, title: '', amount: '', description: '' });
      }
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e._id !== id));
    } catch(err) {
      console.error("Error deleting:", err);
    }
  };

  const totalSpent = expenses.reduce((acc, cur) => acc + cur.amount, 0);
  const remaining = budget - totalSpent;
  const spendPercentage = Math.min((totalSpent / budget) * 100, 100);

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-500 font-sans p-4 md:p-6 pb-20`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Vault<span className="text-purple-500">Track</span></h1>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </header>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <Wallet size={24} className="opacity-80" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total Spent</span>
            </div>
            <h2 className="text-4xl font-bold">{formatINR(totalSpent)}</h2>
          </div>

          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
            <div className="flex justify-between items-center mb-4">
              <Landmark size={24} className="text-purple-500" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Monthly Budget</span>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-20 bg-transparent border-b border-purple-500/50 outline-none text-right font-bold text-purple-500"
                />
              </div>
            </div>
            <h2 className={`text-4xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatINR(remaining)}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Remaining balance</p>
          </div>

          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Usage Status</span>
              <span className={`text-sm font-bold ${spendPercentage > 90 ? 'text-red-500' : 'text-purple-500'}`}>
                {spendPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700/20 rounded-full h-4 mb-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  spendPercentage > 90 ? 'bg-red-500' : spendPercentage > 70 ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${spendPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 italic">
              {spendPercentage > 100 ? "Warning: Budget Exceeded!" : "You're doing great on your spending!"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column: Form and Chart */}
          <div className="md:col-span-5 space-y-8">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Visual Analytics</h3>
              <ExpenseChart expenses={expenses} />
            </div>

            <form onSubmit={handleSubmit} className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm space-y-4`}>
              <h3 className="font-bold text-lg">Add New Item</h3>
              <input 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                placeholder="Where did the money go?" 
                className={`w-full p-4 rounded-2xl bg-transparent border ${darkMode ? 'border-gray-700 focus:border-purple-500' : 'border-gray-200 focus:border-purple-500'} outline-none transition-all`}
              />
              <div className="flex gap-3">
                <div className="relative w-1/2">
                  <span className="absolute left-4 top-4 text-gray-500">₹</span>
                  <input 
                    type="number" 
                    value={form.amount} 
                    onChange={(e) => setForm({...form, amount: +e.target.value})} 
                    placeholder="Amount" 
                    className={`w-full p-4 pl-8 rounded-2xl bg-transparent border ${darkMode ? 'border-gray-700 focus:border-purple-500' : 'border-gray-200 focus:border-purple-500'} outline-none transition-all`}
                  />
                </div>
                
                {/* FIXED DROPDOWN SECTION */}
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({...form, category: e.target.value})} 
                  className={`w-1/2 p-4 rounded-2xl bg-transparent border outline-none transition-all cursor-pointer appearance-none ${
                    darkMode 
                      ? 'border-gray-700 bg-gray-800 text-white' 
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  {['Food','Travel','Bills','Shopping','Health','Entertainment','Other'].map(c => (
                    <option 
                      key={c} 
                      value={c} 
                      className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-4.5 text-gray-400"/>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({...form, date: e.target.value})} 
                  className={`w-full p-4 pl-12 rounded-2xl bg-transparent border ${darkMode ? 'border-gray-700 [color-scheme:dark]' : 'border-gray-200'} outline-none transition-all`}
                />
              </div>
              <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]">
                Complete Transaction
              </button>
            </form>
          </div>

          {/* Right Column: History */}
          <div className="md:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Transaction History</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-500/10 px-3 py-1 rounded-full">{expenses.length} Records</span>
            </div>

            <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
              {loading && <div className="text-center py-10 animate-pulse text-gray-500">Retrieving secure data...</div>}
              
              {!loading && expenses.map((exp) => (
                <div key={exp._id} className={`p-4 rounded-2xl border flex justify-between items-center group transition-all hover:translate-x-1 ${darkMode ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-gray-700 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                      {exp.category[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{exp.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{exp.category}</span>
                        <span className="text-[10px] text-gray-500 opacity-50">•</span>
                        <span className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block font-bold text-lg text-red-500">-{formatINR(exp.amount)}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(exp._id)} 
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {!loading && expenses.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <Activity size={48} className="mx-auto mb-4" />
                  <p className="font-medium">No activity detected. Start tracking!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}