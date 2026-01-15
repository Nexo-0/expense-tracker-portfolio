import { useState, useEffect } from 'react';
import { Trash2, Plus, Moon, Sun, Activity, Wallet, Calendar, FileText } from 'lucide-react';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses';
const API_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

export default function App() {
  const [expenses, setExpenses] = useState([]);
  
  // UPDATED STATE: Added 'date' and 'description'
  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    category: 'Food', 
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '' 
  });
  
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => { fetchExpenses() }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if(Array.isArray(data)) setExpenses(data);
    } catch(err) { console.error("Error:", err); } 
  };

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
        setExpenses([data, ...expenses]);
        // Reset form but keep date as today
        setForm({ ...form, title: '', amount: '', description: '' });
      }
    } catch(err) { console.error("Error:", err); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e._id !== id));
    } catch(err) { console.error("Error:", err); }
  };

  const total = expenses.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen transition-colors duration-500 font-sans p-6`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="text-purple-500" /> ExpenseTracker <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded ml-2">PRO</span>
          </h1>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full border border-gray-600 hover:bg-gray-700 transition">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Form & Balance */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Balance Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl transform hover:scale-[1.02] transition-transform">
              <p className="text-purple-100 font-medium mb-1">Total Balance</p>
              <h2 className="text-5xl font-bold tracking-tight">${total.toLocaleString()}</h2>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className={`p-6 rounded-2xl shadow-xl space-y-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold text-lg mb-2">Add New Transaction</h3>
              
              {/* Title Input */}
              <div>
                <label className="text-xs text-gray-400 ml-1 mb-1 block">Title</label>
                <input 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})} 
                  placeholder="e.g. Starbucks" 
                  className="w-full p-3 rounded-xl bg-transparent border border-gray-500 focus:border-purple-500 outline-none transition" 
                />
              </div>

              {/* Amount & Category Row */}
              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="text-xs text-gray-400 ml-1 mb-1 block">Amount</label>
                  <input 
                    type="number" 
                    value={form.amount} 
                    onChange={(e) => setForm({...form, amount: +e.target.value})} 
                    placeholder="$0.00" 
                    className="w-full p-3 rounded-xl bg-transparent border border-gray-500 focus:border-purple-500 outline-none" 
                  />
                </div>
                <div className="w-2/3">
                  <label className="text-xs text-gray-400 ml-1 mb-1 block">Category</label>
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm({...form, category: e.target.value})} 
                    className={`w-full p-3 rounded-xl bg-transparent border border-gray-500 outline-none ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    {['Food','Travel','Bills','Shopping','Entertainment','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="text-xs text-gray-400 ml-1 mb-1 block">Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm({...form, date: e.target.value})} 
                    className={`w-full p-3 pl-10 rounded-xl bg-transparent border border-gray-500 focus:border-purple-500 outline-none ${darkMode ? '[color-scheme:dark]' : ''}`} 
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs text-gray-400 ml-1 mb-1 block">Notes (Optional)</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})} 
                  placeholder="Add details..." 
                  className="w-full p-3 rounded-xl bg-transparent border border-gray-500 focus:border-purple-500 outline-none h-20 resize-none" 
                />
              </div>

              <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-purple-500/30">
                <Plus size={20} /> Add Transaction
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: List */}
          <div className="md:col-span-7">
            <h3 className="font-bold text-xl mb-4 ml-2">Recent Transactions</h3>
            
            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((exp) => (
                <div key={exp._id} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] group ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
                  
                  {/* Top Row: Icon, Title, Amount */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${darkMode ? 'bg-gray-700 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                        {exp.category[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{exp.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-gray-700/30 px-2 py-0.5 rounded">{exp.category}</span>
                          <span>•</span>
                          <span>{new Date(exp.date || exp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-xl text-red-400">-${exp.amount}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Description & Delete */}
                  <div className="flex justify-between items-end pl-16">
                    <p className="text-sm text-gray-400 italic">
                      {exp.description ? exp.description : "No notes added."}
                    </p>
                    <button onClick={() => handleDelete(exp._id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
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