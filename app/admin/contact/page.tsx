'use client'

import { useEffect, useState } from 'react'
import { 
  Mail, Phone, User, Calendar, CheckCircle2, MessageSquare, 
  RefreshCw, Clock, Filter, AlertCircle, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'RESPONDED'
  createdAt: string
}

const STATUS_BADGES: Record<string, string> = {
  UNREAD: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
  READ: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
  RESPONDED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'RESPONDED'>('ALL')
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/contact')
      const data = await res.json()
      if (data.success) {
        setMessages(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch contact inquiries')
      }
    } catch (err) {
      toast.error('Network error loading messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const updateStatus = async (id: string, newStatus: 'UNREAD' | 'READ' | 'RESPONDED') => {
    try {
      setUpdating(true)
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Message marked as ${newStatus}`)
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage({ ...activeMessage, status: newStatus })
        }
      } else {
        toast.error(data.message || 'Failed to update message')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUpdating(false)
    }
  }

  const handleOpen = (msg: ContactMessage) => {
    setActiveMessage(msg)
    if (msg.status === 'UNREAD') {
      updateStatus(msg.id, 'READ')
    }
  }

  const filtered = messages.filter(m => filter === 'ALL' || m.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Mail className="w-8 h-8 text-rose-500" />
            Customer Inquiries
          </h1>
          <p className="text-stone-500 text-sm mt-1">Read and manage inquiries sent through the contact form</p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        {(['ALL', 'UNREAD', 'READ', 'RESPONDED'] as const).map((st) => (
          <Button
            key={st}
            variant={filter === st ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(st)}
            className={filter === st ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
          >
            {st} ({st === 'ALL' ? messages.length : messages.filter(m => m.status === st).length})
          </Button>
        ))}
      </div>

      {/* Messages Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800">
          <MessageSquare className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-lg font-medium text-stone-800 dark:text-stone-200">No inquiries found</h3>
          <p className="text-stone-500 text-sm mt-1">Messages submitted from the Contact page will be listed here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => handleOpen(msg)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                msg.status === 'UNREAD' 
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 shadow-sm' 
                  : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:shadow-sm'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_BADGES[msg.status]}`}>
                    {msg.status}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-base">
                    {msg.subject}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                    <User className="w-3.5 h-3.5 text-stone-400" /> {msg.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" /> {msg.email}
                  </span>
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" /> {msg.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" /> {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 pt-1">
                  {msg.message}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs gap-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Read Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Details Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_BADGES[activeMessage.status]} inline-block mb-2`}>
                  {activeMessage.status}
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  {activeMessage.subject}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Received on {new Date(activeMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setActiveMessage(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">From:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{activeMessage.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Email:</span>
                <a href={`mailto:${activeMessage.email}`} className="text-rose-500 hover:underline font-medium">
                  {activeMessage.email}
                </a>
              </div>
              {activeMessage.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <a href={`tel:${activeMessage.phone}`} className="text-stone-700 dark:text-stone-300 font-medium">
                    {activeMessage.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Customer Message</label>
              <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                {activeMessage.message}
              </div>
            </div>

            {/* Change Status Actions */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Set status:</span>
                {(['UNREAD', 'READ', 'RESPONDED'] as const).map(st => (
                  <Button
                    key={st}
                    size="sm"
                    variant={activeMessage.status === st ? 'default' : 'outline'}
                    disabled={updating}
                    onClick={() => updateStatus(activeMessage.id, st)}
                    className={`text-xs h-7 ${activeMessage.status === st ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}`}
                  >
                    {st}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 px-3.5 py-2 rounded-xl transition-all"
                  onClick={() => updateStatus(activeMessage.id, 'RESPONDED')}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveMessage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
