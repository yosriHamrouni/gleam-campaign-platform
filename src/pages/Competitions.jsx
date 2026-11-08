// src/pages/Competitions.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar } from 'lucide-react';
import ActiveCompetitions from './ActiveCompetitions';

function Competitions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const [competitions, setCompetitions] = useState([]);

  React.useEffect(() => {
    fetch('http://localhost:3009/api/competitions') // direct API for testing (proxy sometimes fails on Windows)
      .then(res => res.json())
      .then(data => setCompetitions(Array.isArray(data) ? data : [])) // safe guard to avoid blank screen
      .catch(err => console.error('Error fetching competitions:', err));
  }, []);

  // mock data removed: using API from http://localhost:3008/api/competitions
  /*
const mockCompetitions = [
    {
      id: 1,
      name: 'Summer Photography Contest',
      impressions: 15234,
      actions: 892,
      users: 456,
      conversionRate: 78,
      status: 'active',
      endsIn: '15 days'
    },
    {
      id: 2,
      name: 'Creative Writing Challenge',
      impressions: 8956,
      actions: 534,
      users: 287,
      conversionRate: 64,
      status: 'active',
      endsIn: '22 days'
    },
    {
      id: 3,
      name: 'Design Sprint 2024',
      impressions: 12487,
      actions: 721,
      users: 389,
      conversionRate: 71,
      status: 'active',
      endsIn: '8 days'
    }
  ];
*/

  const tabs = [
    { id: 'active', label: 'Active', count: competitions.length },
    { id: 'scheduled', label: 'Scheduled', count: 0 },
    { id: 'drafts', label: 'Drafts', count: 2 },
    { id: 'finished', label: 'Finished', count: 2 },
    { id: 'quick-draws', label: 'Quick Draws', count: 0 }
  ];

  return (
    <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Competitions</h1>
            <p className='text-gray-600 mt-1'>Manage and create competitions</p>
          </div>
          <div className='flex gap-3'>
            <button className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2'>
              <span>🎁</span>
              Plan: Free Competitions
            </button>
            <button
              onClick={() => navigate('/competitions/create')}
              className='px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2'
            >
              <Plus size={20} />
              New Competition
            </button>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow'>
          <div className='border-b border-gray-200'>
            <div className='flex items-center px-6'>
              <Search className='text-gray-400 mr-2' size={20} />
              <div className='flex-1 flex gap-6'>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 font-medium'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className='ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full'>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <Calendar size={20} />
                <select className='border-none bg-transparent text-sm focus:outline-none'>
                  <option>All Time</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Competitions Section */}
          <div className='p-6'>
            <ActiveCompetitions items={competitions} />
          </div>

          {/* Footer Search */}
          <div className='border-t border-gray-200 px-6 py-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='text'
                placeholder='Search Competition Templates...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
              />
            </div>
          </div>
        </div>
    </div>
  );
}

export default Competitions;
