// src/pages/CompetitionEntry.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, ExternalLink, Twitter, Youtube, Globe } from 'lucide-react';

export default function CompetitionEntry() {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [actions, setActions] = useState([]);
  const [myEntries, setMyEntries] = useState(0);

  useEffect(() => {
    const comp = {
      id,
      name: 'wiw Competition',
      description: 'Complete the actions below to earn more entries and increase your chances of winning! 🎉',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
      entries: 1,
      totalEntries: 120,
      daysLeft: 29,
      endsOn: 'March 10, 2025'
    };

    const acts = [
      { id: 1, name: 'Follow us on Twitter', icon: <Twitter className='text-sky-500' />, completed: false },
      { id: 2, name: 'Visit our Website', icon: <Globe className='text-green-600' />, completed: false },
      { id: 3, name: 'Subscribe on YouTube', icon: <Youtube className='text-red-500' />, completed: true }
    ];

    setCompetition(comp);
    setActions(acts);
  }, [id]);

  // Fetch real competition from backend and override mock
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3009/api/competitions/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(data.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );

        setCompetition({
          id: data._id || id,
          name: data.title,
          description: data.description,
          image: data.coverImage || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
          entries: 0,
          totalEntries: Number(data.totalEntries) || 0,
          endDate: data.endDate,
          daysLeft,
          endsOn: data.endDate,
        });

        const acts = Array.isArray(data.actions)
          ? data.actions.map((a, idx) => ({
              id: idx + 1,
              name: a.label || a.type || 'Action',
              icon: a.type?.includes('twitter')
                ? <Twitter className='text-sky-500' />
                : a.type?.includes('youtube')
                ? <Youtube className='text-red-500' />
                : <Globe className='text-green-600' />,
              completed: false,
            }))
          : [];
        setActions(acts);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { isMounted = false };
  }, [id]);

  const toggleAction = (id) => {
    setActions((prev) => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  if (!competition) {
    return <div className='flex justify-center items-center h-screen text-gray-600'>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-600 to-indigo-500 flex justify-center items-center p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden'>
        <img src={competition.image} alt={competition.name} className='w-full h-56 object-cover' />
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-1'>{competition.name}</h1>
          <p className='text-gray-500 text-sm mb-4'>{competition.description}</p>

          <div className='flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-3 mb-6'>
            <div className='text-center'>
              <h3 className='font-bold text-lg text-indigo-600'>{myEntries}</h3>
              <p className='text-xs text-gray-500'>Your Entries</p>
            </div>
            <div className='text-center'>
              <h3 className='font-bold text-lg text-indigo-600'>{competition.totalEntries ?? 0}</h3>
              <p className='text-xs text-gray-500'>Total Entries</p>
            </div>
            <div className='text-center'>
              <h3 className='font-bold text-lg text-indigo-600'>
                {Math.max(0, Math.ceil((new Date(competition.endDate).getTime() - Date.now())/(1000*60*60*24))) || 0}
              </h3>
              <p className='text-xs text-gray-500'>Days Left</p>
            </div>
          </div>

          <h2 className='text-lg font-semibold text-gray-800 mb-3'>🎯 Actions to Earn Entries</h2>
          <div className='space-y-2'>
            {actions.map((a) => (
              <div key={a.id} className={`flex items-center justify-between p-3 border rounded-lg transition ${a.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className='flex items-center gap-3'>
                  {a.icon}
                  <span className='text-gray-700 text-sm font-medium'>{a.name}</span>
                </div>
                {a.completed ? (
                  <CheckCircle className='text-green-600' size={20} />
                ) : (
                  <button onClick={() => toggleAction(a.id)} className='bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 text-xs rounded-md flex items-center gap-1'>
                    <ExternalLink size={14} /> Do it
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className='mt-6 text-center'>
            <button
              className='bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition'
              onClick={async () => {
                try {
                  const completed = actions.filter(a => a.completed).length;
                  const entries = Math.max(1, 1 + completed);
                  const res = await fetch(`http://localhost:3009/api/competitions/${competition.id || competition._id}/participate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entries })
                  });
                  if (res.ok) {
                    const updated = await res.json();
                    setCompetition(updated);
                    setMyEntries(entries);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Confirm Participation
            </button>
          </div>

          <p className='text-xs text-gray-400 text-center mt-6 border-t pt-3'>Terms & Conditions apply. Powered by Gleam Clone.</p>
        </div>
      </div>
    </div>
  );
}
