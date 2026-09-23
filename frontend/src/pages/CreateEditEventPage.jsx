import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

const categories = ['Technology', 'Concert', 'Workshop', 'Cultural', 'Sports', 'Show', 'Other'];

const CreateEditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    date: '',
    time: '10:00 AM',
    venue: '',
    ticketPrice: 500,
    capacity: 500,
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const res = await api.get(`/events/${id}`);
          const evt = res.data;
          setFormData({
            name: evt.name || '',
            description: evt.description || '',
            category: evt.category || 'Technology',
            date: evt.date || '',
            time: evt.time || '',
            venue: evt.venue || '',
            ticketPrice: evt.ticketPrice || 0,
            capacity: evt.capacity || 100,
            image: evt.image || '',
          });
        } catch (err) {
          setError('Failed loading event data.');
        } finally {
          setFetching(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend Validations
    if (!formData.name.trim()) {
      setError('Event name cannot be empty.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim() || !formData.date || !formData.venue.trim()) {
      setError('Please fill in description, date, and venue.');
      setLoading(false);
      return;
    }
    if (formData.ticketPrice < 0) {
      setError('Ticket price must be >= 0.');
      setLoading(false);
      return;
    }
    if (formData.capacity <= 0) {
      setError('Total capacity must be > 0.');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await api.put(`/events/${id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      navigate('/organizer/events');
    } catch (err) {
      console.error('Save Event Error:', err);
      setError(err.response?.data?.message || 'Failed saving event details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isEditMode ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure seat capacity, ticket pricing, and event metadata
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Event Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Tech Fest 2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                placeholder="Main Auditorium, Tech Park"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Event Time *
              </label>
              <input
                type="text"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                placeholder="10:00 AM"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Ticket Price (₹) *
              </label>
              <input
                type="number"
                name="ticketPrice"
                min="0"
                required
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Total Capacity */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Total Seat Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                min="1"
                required
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Banner Image URL (Optional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                Event Description *
              </label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Comprehensive overview of the event, agenda, speakers..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/organizer/events')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Event' : 'Publish Event'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateEditEventPage;
