// src/pages/CreateCompetition.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';

function CreateCompetition() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'standard',
    startDate: '',
    endDate: '',
    entryFee: '',
    coverImage: null,
    actions: []
  });

  const [message, setMessage] = useState('');
  const [shareUrl, setShareUrl] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: '', value: '', points: 10 });

  const actionTypes = [
    { value: 'follow_instagram', label: 'Follow Instagram Page', icon: '📸' },
    { value: 'follow_twitter', label: 'Follow Twitter Account', icon: '🐦' },
    { value: 'subscribe_youtube', label: 'Subscribe YouTube Channel', icon: '📺' },
    { value: 'visit_website', label: 'Visit Website', icon: '🌐' },
    { value: 'share_post', label: 'Share Post', icon: '🔄' },
    { value: 'custom', label: 'Custom Action', icon: '⚡' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, coverImage: file }));
  };

  const addAction = () => {
    if (currentAction.type && currentAction.value) {
      const label = actionTypes.find(a => a.value === currentAction.type)?.label || currentAction.type;
      setFormData(prev => ({ ...prev, actions: [...prev.actions, { ...currentAction, label }] }));
      setCurrentAction({ type: '', value: '', points: 10 });
      setShowActionModal(false);
    }
  };

  const removeAction = (index) => {
    setFormData(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Prepare payload without File objects
    const { coverImage, entryFee, ...rest } = formData;
    const payload = { ...rest, entryFee: Number(entryFee) || 0 };
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3009/api/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const url = (data && data.shareUrl) || `${window.location.origin}/competitions/${(data && data._id) || ''}`;
      setShareUrl(url);
      setMessage('Competition created successfully! Share your link below.');
    } else {
      setMessage('Failed to create competition.');
    }
  } catch (err) {
    console.error(err);
    setMessage('Server error.');
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/competitions')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Competition</h1>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('✅')
              ? 'bg-green-100 text-green-700'
              : message.includes('❌')
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-6">
        <div>
          <label className="block font-medium mb-2 text-gray-700">Competition Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2 text-gray-700">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Competition Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="standard">Standard</option>
            <option value="quick-draw">Quick Draw</option>
            <option value="tournament">Tournament</option>
            <option value="challenge">Challenge</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Entry Fee ($)</label>
          <input
            type="number"
            name="entryFee"
            value={formData.entryFee}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00 (Free)"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Required Actions</label>
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-600 text-sm">Add actions participants must complete to enter</p>
            <button
              type="button"
              onClick={() => setShowActionModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus size={16} /> Add Action
            </button>
          </div>

          {formData.actions.length > 0 ? (
            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{actionTypes.find(a => a.value === action.type)?.icon || '⚡'}</span>
                    <div>
                      <p className="font-medium text-gray-800">{action.label}</p>
                      <p className="text-sm text-gray-500">{action.value}</p>
                    </div>
                  </div>
                  <button onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No actions added yet.</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Cover Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.coverImage ? (
              <div>
                <ImageIcon size={40} className="mx-auto text-primary-500 mb-2" />
                <p className="text-gray-600 mb-2">{formData.coverImage.name}</p>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <ImageIcon size={40} className="mx-auto text-gray-400 mb-2" />
                <label
                  htmlFor="cover-upload"
                  className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 cursor-pointer"
                >
                  Choose File
                </label>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Create Competition
          </button>
          <button
            type="button"
            onClick={() => navigate('/competitions')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {shareUrl && (
        <div className="bg-white shadow p-6 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Share Your Campaign</h3>
              <p className="text-sm text-gray-500">Copy the link below to start promoting your Landing Page</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input value={shareUrl} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
            <button
              type="button"
              onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setMessage('Link copied to clipboard'); } catch {} }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              title="Copy link"
            >
              Copy
            </button>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600" title="Open">
              Open
            </a>
          </div>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Action</h3>
              <button onClick={() => setShowActionModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Action Type *</label>
                <select
                  value={currentAction.type}
                  onChange={(e) => setCurrentAction(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select type</option>
                  {actionTypes.map(a => (
                    <option key={a.value} value={a.value}>{a.icon} {a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Value *</label>
                <input
                  type="text"
                  value={currentAction.value}
                  onChange={(e) => setCurrentAction(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., @mybrand, https://example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Points *</label>
                <input
                  type="number"
                  value={currentAction.points}
                  onChange={(e) => setCurrentAction(prev => ({ ...prev, points: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  min="1"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={addAction}
                  disabled={!currentAction.type || !currentAction.value}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300"
                >
                  Add Action
                </button>
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCompetition;
