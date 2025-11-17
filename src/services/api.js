// API Service - Fetches real AI-scored meetings from GitHub

const API_BASE = 'https://raw.githubusercontent.com/katewilkinson17/-meeting-tracker/main/backend/data';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getStories = async () => {
  await delay(500);
  // No longer scraping stories - AI scores meetings based on beat profile!
  return [];
};

export const getMeetings = async () => {
  await delay(800);
  
  try {
    // Fetch AI-scored meetings from GitHub
    const response = await fetch(`${API_BASE}/scored_meetings.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const meetings = await response.json();
    console.log('Fetched meetings:', meetings.length);
    
    // Filter to only show meetings in next 7 days
    const today = new Date();
    const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const filtered = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= today && meetingDate <= sevenDaysOut;
    });
    
    console.log('Filtered meetings:', filtered.length);
    return filtered;
    
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
};

// Feedback API
export const sendFeedback = async (meetingId, feedbackType, meetingData) => {
  console.log('Feedback:', { meetingId, feedbackType });
  // TODO: Implement backend API for saving feedback
  return { status: 'success' };
};