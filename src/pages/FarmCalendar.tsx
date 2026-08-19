import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import type { FarmTask } from '../types';
import { Plus, CheckCircle2, Trash2, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const CATEGORIES = ['irrigation', 'fertilizer', 'pest_control', 'weeding', 'harvest', 'other'] as const;
const CAT_COLORS: Record<string, string> = {
  irrigation: 'var(--blue-500)', fertilizer: 'var(--agri-green-600)',
  pest_control: 'var(--red-500)', weeding: 'var(--orange-500)',
  harvest: 'var(--golden-paddy-500)', other: 'var(--text-muted)'
};

export default function FarmCalendar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farmId, setFarmId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<FarmTask>>({});



  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!farmId) {
        const { data: farm } = await supabase.from('farms').select('id').eq('owner_id', user.id).single();
        if (farm) setFarmId(farm.id);
        else { setLoading(false); return; } // No farm yet
      }

      const id = farmId || (await supabase.from('farms').select('id').eq('owner_id', user.id).single()).data?.id;
      if (!id) return;

      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('farm_tasks')
        .select('*')
        .eq('farm_id', id)
        .gte('due_date', start)
        .lte('due_date', end)
        .order('due_date', { ascending: true });

      setTasks(data || []);
    } finally {
      setLoading(false);
    }
  }, [user, currentDate, farmId]);

  useEffect(() => {
    loadTasks();
  }, [user, currentDate, loadTasks]);

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) return;

    const data = {
      farm_id: farmId,
      title: editingTask.title,
      category: editingTask.category || 'other',
      due_date: editingTask.due_date || format(new Date(), 'yyyy-MM-dd'),
      notes: editingTask.notes,
      reminder: editingTask.reminder || false,
      status: editingTask.status || 'pending',
    };

    if (editingTask.id) {
      await supabase.from('farm_tasks').update(data).eq('id', editingTask.id);
    } else {
      await supabase.from('farm_tasks').insert(data);
    }

    setShowModal(false);
    loadTasks();
  };

  const toggleStatus = async (task: FarmTask) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    await supabase.from('farm_tasks').update({ status: newStatus }).eq('id', task.id);
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('farm_tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Calendar logic
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const startDayOfWeek = startOfMonth(currentDate).getDay();
  const blanks = Array(startDayOfWeek).fill(null);
  
  const allCells = [...blanks, ...days];
  // Pad end to complete the grid (multiple of 7)
  while (allCells.length % 7 !== 0) allCells.push(null);

  const todaysTasks = tasks.filter(t => t.due_date === format(new Date(), 'yyyy-MM-dd'));

  if (!farmId && !loading) {
    return (
      <div className="empty-state">
        <h2>{t.calendar.title}</h2>
        <p>Please set up your Farm Profile first to use the calendar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">📅 {t.calendar.title}</h1>
        <button className="btn btn-primary" onClick={() => { setEditingTask({}); setShowModal(true); }}>
          <Plus size={16} /> {t.calendar.addTask}
        </button>
      </div>

      <div className="crop-advisor-layout">
        {/* Main Calendar Grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--forest-900)', color: 'white' }}>
            <button className="btn btn-ghost btn-icon" style={{ color: 'white' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
              &lt;
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{format(currentDate, 'MMMM yyyy')}</h2>
            <button className="btn btn-ghost btn-icon" style={{ color: 'white' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
              &gt;
            </button>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            
            {loading ? (
              <div style={{ gridColumn: '1 / -1', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading calendar...
              </div>
            ) : (
              allCells.map((date, i) => {
                if (!date) return <div key={`blank-${i}`} className="calendar-cell empty" />;
                
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.due_date === dateStr);
                const isToday = isSameDay(date, new Date());

                return (
                  <div key={dateStr} className={`calendar-cell ${isToday ? 'today' : ''}`} onClick={() => { setEditingTask({ due_date: dateStr }); setShowModal(true); }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <span className="calendar-date">{format(date, 'd')}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          style={{
                            width: '100%', height: '4px', borderRadius: '2px',
                            background: task.status === 'completed' ? 'var(--text-muted)' : CAT_COLORS[task.category],
                            opacity: task.status === 'completed' ? 0.5 : 1
                          }}
                          title={task.title}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[cat] }} />
                {t.calendar.categories[cat as keyof typeof t.calendar.categories]}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar List */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '16px' }}>📍 {t.calendar.todaysTasks}</h2>
            {todaysTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todaysTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'var(--light-green-50)', borderRadius: 'var(--radius-md)', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                    <button onClick={() => toggleStatus(task)} style={{ marginTop: '2px', color: task.status === 'completed' ? 'var(--agri-green-600)' : 'var(--text-muted)' }}>
                      <CheckCircle2 size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: CAT_COLORS[task.category], fontWeight: 600, marginTop: '4px', textTransform: 'capitalize' }}>
                        {task.category.replace('_', ' ')}
                      </div>
                    </div>
                    <button className="btn-ghost" onClick={() => { setEditingTask(task); setShowModal(true); }} style={{ padding: '4px' }}>
                      <Edit3Icon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }}>✨</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks scheduled for today.</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>🗓️ All Month</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {tasks.filter(t => t.due_date !== format(new Date(), 'yyyy-MM-dd')).map(task => (
                 <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                   <div>
                     <div style={{ fontSize: '13px', fontWeight: 500 }}>{task.title}</div>
                     <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{format(parseISO(task.due_date), 'MMM d')}</div>
                   </div>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[task.category] }} />
                 </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editingTask.id ? t.calendar.editTask : t.calendar.addTask}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={saveTask}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label required">{t.calendar.taskTitle}</label>
                  <input type="text" className="form-input" required value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} placeholder="e.g. Apply urea" />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">{t.calendar.category}</label>
                    <select className="form-input form-select" required value={editingTask.category || 'other'} onChange={e => setEditingTask({...editingTask, category: e.target.value as any})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{t.calendar.categories[c as keyof typeof t.calendar.categories]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">{t.calendar.dueDate}</label>
                    <input type="date" className="form-input" required value={editingTask.due_date || ''} onChange={e => setEditingTask({...editingTask, due_date: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.calendar.notes}</label>
                  <textarea className="form-input" rows={2} value={editingTask.notes || ''} onChange={e => setEditingTask({...editingTask, notes: e.target.value})} />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="remind" checked={editingTask.reminder || false} onChange={e => setEditingTask({...editingTask, reminder: e.target.checked})} />
                  <label htmlFor="remind" className="form-label" style={{ marginBottom: 0 }}>{t.calendar.reminder}</label>
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: editingTask.id ? 'space-between' : 'flex-end' }}>
                {editingTask.id && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => { deleteTask(editingTask.id!); setShowModal(false); }}>
                    <Trash2 size={16} /> {t.general.delete}
                  </button>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>{t.general.cancel}</button>
                  <button type="submit" className="btn btn-primary">{t.general.save}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icon since lucide-react Edit3 was used in string but not imported properly in some contexts. Let's just create a small wrapper to avoid breaking.
function Edit3Icon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
}
