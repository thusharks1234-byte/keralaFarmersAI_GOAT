import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import type { ChatSession, ChatMessage } from '../types';
import { Send, Plus, Trash2, Bot, Loader2, Info, Mic } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { sendChatMessage } from '../lib/ai-service';

export default function AIAssistant() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [farmContext, setFarmContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSessions();
    loadFarmContext();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadFarmContext = async () => {
    if (!user) return;
    try {
      const { data: farm } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();
      const { data: crop } = await supabase.from('crop_cycles').select('*').eq('farm_id', farm?.id).eq('is_current', true).single();
      if (farm) {
        const ctx = [
          farm.district && `${farm.district} district`,
          farm.farm_type && `${farm.farm_type} farm`,
          farm.area_acres && `${farm.area_acres} acres`,
          crop?.crop_name && `Growing ${crop.crop_name}`,
        ].filter(Boolean).join(', ');
        setFarmContext(ctx);
      }
    } catch {}
  };

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      setSessions(data || []);
      if (data && data.length > 0 && !currentSession) {
        selectSession(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    setMessages([]);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const createNewSession = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_sessions')
      .insert({ owner_id: user.id, language, title: 'New Conversation' })
      .select()
      .single();
    if (data) {
      setSessions(prev => [data, ...prev]);
      setCurrentSession(data);
      setMessages([]);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;

    let session = currentSession;

    // If no session exists, create one first and continue sending
    if (!session) {
      if (!user) return;
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ owner_id: user.id, language, title: 'New Conversation' })
        .select()
        .single();
      if (!newSession) return;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      session = newSession;
    }

    const userMsg = input.trim();
    setInput('');
    setSending(true);
    setError('');

    // Optimistic user message
    const tempMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      session_id: session.id,
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    // Auto-title session from first message
    if (messages.length === 0) {
      const title = userMsg.slice(0, 60);
      await supabase.from('chat_sessions').update({ title }).eq('id', session.id);
      setSessions(prev => prev.map(s => s.id === session!.id ? { ...s, title } : s));
    }

    try {
      // Call the client-side orchestrator with automatic fallback
      await sendChatMessage(
        session.id,
        userMsg,
        farmContext,
        language
      );

      // Load actual messages from DB
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
      
      setMessages(msgs || []);


    } catch {
      setError(t.ai.error);
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  }, [input, sending, currentSession, messages.length, language, t.ai.error, user, farmContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const SUGGESTED = [t.ai.suggested1, t.ai.suggested2, t.ai.suggested3];

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: '20px' }}>🤖 {t.ai.title}</h1>

      <div className="chat-shell" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Sessions sidebar */}
        <div className="chat-sessions">
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={createNewSession}>
            <Plus size={16} /> {t.ai.newConversation}
          </button>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton skeleton-text" style={{ height: '40px' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s)}
                  style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    background: currentSession?.id === s.id ? 'var(--light-green-100)' : 'transparent',
                    border: `1px solid ${currentSession?.id === s.id ? 'rgba(184,115,51,0.2)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <Bot size={14} style={{ color: 'var(--agri-green-600)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title || 'Conversation'}
                  </span>
                  <button
                    onClick={e => deleteSession(s.id, e)}
                    aria-label="Delete conversation"
                    style={{ padding: '2px', opacity: 0.5, borderRadius: '4px' }}
                    className="btn btn-ghost"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat main */}
        <div className="chat-main">
          {/* Header */}
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid rgba(184,115,51,0.15)',
            display: 'flex', alignItems: 'center', gap: '12px', background: '#F8F5EF',
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #07291D, #0B3D2E)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>Krishi AI</div>
              {farmContext && (
                <div style={{ fontSize: '11.5px', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={11} /> {t.ai.usingContext} {farmContext}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: 'rgba(184,115,51,0.06)', borderBottom: '1px solid rgba(184,115,51,0.15)',
            padding: '8px 20px', fontSize: '11.5px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Info size={12} style={{ color: 'var(--copper-500)' }} /> {t.ai.disclaimer}
          </div>

          {/* Messages */}
          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && !sending && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Ask me anything about your farm
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  I know your farm details and can give personalized advice.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
                  {SUGGESTED.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                      style={{
                        padding: '12px 16px', background: '#F8F5EF',
                        border: '1px solid rgba(213,232,213,0.7)', borderRadius: '12px',
                        fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.15s',
                        boxShadow: '0 2px 8px rgba(11,61,46,0.03)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--copper-400)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(213,232,213,0.7)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="chat-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {format(parseISO(msg.created_at), 'h:mm a')}
                </div>
              </div>
            ))}

            {sending && (
              <div className="chat-message assistant">
                <div className="chat-bubble" style={{ background: '#F8F5EF', border: '1px solid rgba(184,115,51,0.15)' }}>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px 16px', background: 'var(--red-100)', border: '1px solid var(--red-500)',
                borderRadius: 'var(--radius-md)', color: 'var(--red-500)', fontSize: '14px',
                display: 'flex', gap: '8px', alignItems: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="chat-composer">
            <button
              className="btn btn-ghost btn-icon"
              aria-label="Voice input (coming soon)"
              title={t.ai.voiceComingSoon}
              disabled
              style={{ opacity: 0.4 }}
            >
              <Mic size={20} />
            </button>

            <textarea
              ref={textareaRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.ai.placeholder}
              rows={1}
              disabled={sending}
              aria-label="Message input"
              style={{ flex: 1 }}
            />

            <button
              className="btn btn-primary btn-icon"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              aria-label={t.ai.send}
              style={{ width: '44px', height: '44px', flexShrink: 0 }}
            >
              {sending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
