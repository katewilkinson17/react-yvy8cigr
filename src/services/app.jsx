import React, { useState, useEffect } from 'react';
import ReadingDigest from './components/ReadingDigest';
import MeetingCard from './components/MeetingCard';
import { getMeetings, getStories } from './services/api';

export default function App() {
  const [meetings, setMeetings] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userFlags, setUserFlags] = useState({}); // Track Kate's manual flags

  useEffect(() => {
    loadData();
    loadUserFlags();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meetingsData, storiesData] = await Promise.all([
        getMeetings(),
        getStories()
      ]);
      setMeetings(meetingsData);
      setStories(storiesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadUserFlags = () => {
    // Load Kate's manual flags from localStorage
    const saved = localStorage.getItem('kateFlags');
    if (saved) {
      setUserFlags(JSON.parse(saved));
    }
  };

  const toggleFlag = (meetingId, flagType) => {
    const newFlags = { ...userFlags };
    if (!newFlags[meetingId]) {
      newFlags[meetingId] = {};
    }
    newFlags[meetingId][flagType] = !newFlags[meetingId][flagType];
    setUserFlags(newFlags);
    localStorage.setItem('kateFlags', JSON.stringify(newFlags));
  };

  // Separate meetings by type
  const mentionedMeetings = meetings.filter(m => m.matchType === 'mentioned');
  const keywordMeetings = meetings.filter(m => m.matchType === 'keyword');

  // Get meetings for calendar (next 7 days)
  const calendarMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    const today = new Date();
    const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return meetingDate >= today && meetingDate <= sevenDaysOut;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fce7f3, #fef3c7, #d1fae5)',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading your meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fce7f3, #fef3c7, #d1fae5)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '30px', 
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '4px solid #ec4899'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            margin: 0,
            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📊 Kate's Meeting Tracker
          </h1>
          <p style={{ color: '#666', marginTop: '10px', fontSize: '16px' }}>
            Your stories → Relevant meetings → Next 7 days
          </p>
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={loadData}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Refresh Data
            </button>
            {lastUpdated && (
              <span style={{ fontSize: '13px', color: '#999' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
              📊 <strong>Tracking:</strong> {stories.length} stories since January • {meetings.length} meetings next 7 days
            </p>
          </div>
        </div>

        {/* Reading Digest */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 20px 0' }}>
            📰 Your Week at a Glance
          </h2>
          <ReadingDigest meetings={calendarMeetings} stories={stories} userFlags={userFlags} />
        </div>

        {/* Mentioned Meetings */}
        {mentionedMeetings.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '3px solid #ef4444'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0', color: '#dc2626' }}>
              🔴 Meetings You Mentioned In Your Stories
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              These meetings were explicitly referenced in your WPRI articles
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {mentionedMeetings.map(meeting => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  stories={stories}
                  userFlags={userFlags}
                  onToggleFlag={toggleFlag}
                />
              ))}
            </div>
          </div>
        )}

        {/* Keyword Matches */}
        {keywordMeetings.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '3px solid #f97316'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0', color: '#ea580c' }}>
              🔍 Possible Follow-Ups
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Meeting agendas mention keywords from your stories
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {keywordMeetings.map(meeting => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  stories={stories}
                  userFlags={userFlags}
                  onToggleFlag={toggleFlag}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Meetings */}
        {meetings.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            border: '2px dashed #d1d5db'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>📭</p>
            <h3 style={{ fontSize: '20px', color: '#374151', margin: '0 0 10px 0' }}>
              No Meetings in Next 7 Days
            </h3>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              Check back later or adjust your date range
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#999'
        }}>
          <p style={{ margin: 0 }}>
            Data sources: WPRI 12 News (Kate Wilkinson) • RI OpenGov • Updated daily at 7:00 AM
          </p>
        </div>
      </div>
    </div>
  );
}