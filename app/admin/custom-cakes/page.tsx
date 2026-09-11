'use client'

import { useEffect, useState } from 'react'
import { 
  Cake, Calendar, Clock, DollarSign, Mail, Phone, User, CheckCircle2, 
  XCircle, AlertCircle, MessageSquare, Filter, RefreshCw, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'

interface CustomCakeRequest {
  id: string
  name: string
  email: string
  phone: string
  cakeType: string
  flavor: string
  size: string
  budget: number | null
  message: string | null
  referenceImage: string | null
  requestedDate: string
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  adminNotes: string | null
  createdAt: string
  user: { name: string; email: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
  REVIEWING: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
  COMPLETED: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300',
}

export default function AdminCustomCakesPage() {
  const [requests, setRequests] = useState<CustomCakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedRequest, setSelectedRequest] = useState<CustomCakeRequest | null>(null)
  const [statusDraft, setStatusDraft] = useState<string>('')
  const [notesDraft, setNotesDraft] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/custom-cake')
      const data = await res.json()
      if (data.success) {
        setRequests(data.data || [])
      } else {
        toast.error(data.message || 'Failed to load requests')
      }
    } catch (err) {
      toast.error('Network error loading custom cake requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const openDetails = (req: CustomCakeRequest) => {
    setSelectedRequest(req)
    setStatusDraft(req.status)
    setNotesDraft(req.adminNotes || '')
  }

  const handleUpdate = async () => {
    if (!selectedRequest) return
    try {
      setUpdating(true)
      const res = await fetch('/api/custom-cake', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: statusDraft,
          adminNotes: notesDraft,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Custom cake status updated successfully')
        setSelectedRequest(null)
        fetchRequests()
      } else {
        toast.error(data.message || 'Failed to update request')
      }
    } catch (err) {
      toast.error('Network error updating request')
    } finally {
      setUpdating(false)
    }
  }

  const filtered = requests.filter(r => filterStatus === 'ALL' || r.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Cake className="w-8 h-8 text-rose-500" />
            Custom Cake Orders
          </h1>
          <p className="text-stone-500 text-sm mt-1">Review, approve and manage bespoke cake requests</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        {['ALL', 'PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((st) => (
          <Button
            key={st}
            variant={filterStatus === st ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(st)}
            className={filterStatus === st ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
          >
            {st} ({st === 'ALL' ? requests.length : requests.filter(r => r.status === st).length})
          </Button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800">
          <Cake className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-lg font-medium text-stone-800 dark:text-stone-200">No custom cake requests found</h3>
          <p className="text-stone-500 text-sm mt-1">Requests submitted through the Custom Cake page will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((req) => (
            <div 
              key={req.id} 
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS_COLORS[req.status] || 'bg-stone-100'}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">{req.cakeType}</h3>
                  <p className="text-xs text-rose-500 font-medium">Flavor: {req.flavor} • Size: {req.size}</p>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-medium text-stone-800 dark:text-stone-200">{req.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Delivery: {new Date(req.requestedDate).toLocaleDateString()}</span>
                  </div>
                  {req.budget && (
                    <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Budget: ${req.budget.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {req.message && (
                  <p className="text-xs text-stone-500 line-clamp-2 italic">
                    &quot;{req.message}&quot;
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                {req.referenceImage ? (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    Photo attached
                  </span>
                ) : <span />}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => openDetails(req)}
                  className="text-xs gap-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View & Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  Manage Custom Cake Request
                </h2>
                <p className="text-xs text-stone-500">ID: {selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl">
              <div>
                <span className="text-stone-400 block">Customer</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedRequest.name}</span>
                <p className="text-stone-500">{selectedRequest.phone}</p>
                <p className="text-stone-500">{selectedRequest.email}</p>
              </div>
              <div>
                <span className="text-stone-400 block">Required By</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {new Date(selectedRequest.requestedDate).toLocaleDateString()}
                </span>
                <span className="text-stone-400 block mt-2">Budget</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedRequest.budget ? `$${selectedRequest.budget.toFixed(2)}` : 'Flexible'}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-stone-400 block">Cake Specifications</span>
                <span className="font-semibold text-rose-500">
                  {selectedRequest.cakeType} • {selectedRequest.flavor} • {selectedRequest.size}
                </span>
              </div>
              {selectedRequest.message && (
                <div className="col-span-2">
                  <span className="text-stone-400 block">Customer Notes</span>
                  <p className="text-stone-700 dark:text-stone-300 italic">{selectedRequest.message}</p>
                </div>
              )}
            </div>

            {selectedRequest.referenceImage && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Reference Image</span>
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                  <Image 
                    src={selectedRequest.referenceImage} 
                    alt="Custom cake reference"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Update Status
              </label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="REVIEWING">REVIEWING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Admin / Chef Notes
              </label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add quotation details, ingredients, confirmation notes or rejection reasons..."
                rows={3}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedRequest(null)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updating}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
