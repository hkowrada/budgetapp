import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Configure moment localizer
const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCalendars, setSelectedCalendars] = useState(new Set());
  const [emailSettings, setEmailSettings] = useState({ email: '', notifications: true });
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    calendar_id: '',
    remind_1day: true,
    remind_1hour: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCalendars();
    loadEvents();
    loadEmailSettings();
  }, []);

  const loadCalendars = async () => {
    try {
      const response = await axios.get('/calendars');
      const allCalendars = response.data;
      
      setCalendars(allCalendars);
      
      // Select all calendars by default for viewing
      const defaultSelected = new Set(allCalendars.map(cal => cal.id));
      setSelectedCalendars(defaultSelected);
    } catch (error) {
      console.error('Calendar load error:', error);
      toast({
        title: 'Error loading calendars',
        description: 'Failed to fetch calendar data',
        variant: 'destructive'
      });
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/events');
      const transformedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        title: event.title
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Events load error:', error);
      toast({
        title: 'Error loading events',
        description: 'Failed to fetch events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      const response = await axios.get('/user/preferences');
      if (response.data) {
        setEmailSettings({
          email: response.data.notification_email || '',
          notifications: response.data.email_notifications || false
        });
      }
    } catch (error) {
      // User preferences might not exist yet
      console.log('No user preferences found');
    }
  };

  const saveEmailSettings = async () => {
    try {
      await axios.patch('/user/preferences', {
        notification_email: emailSettings.email,
        email_notifications: emailSettings.notifications
      });
      
      toast({
        title: 'Email settings saved',
        description: 'Your notification preferences have been updated'
      });
      setShowEmailSettings(false);
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'Failed to update email preferences',
        variant: 'destructive'
      });
    }
  };

  const handleSelectEvent = (event) => {
    toast({
      title: event.title,
      description: `${moment(event.start).format('MMMM D, YYYY HH:mm')}${event.location ? ` at ${event.location}` : ''}${event.description ? `\n\n${event.description}` : ''}`,
    });
  };

  const handleSelectSlot = ({ start, end }) => {
    if (user.role === 'guest') {
      toast({
        title: 'Access denied',
        description: 'Guests can only view events',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedSlot({ start, end });
    setEventForm({
      title: '',
      description: '',
      location: '',
      calendar_id: getUserCalendarId(), // Default to user's own calendar
      remind_1day: true,
      remind_1hour: true
    });
    setShowEventDialog(true);
  };

  const getUserCalendarId = () => {
    // Find the calendar that belongs to the current user
    const userCalendar = calendars.find(cal => 
      cal.name.toLowerCase().includes(user.name.toLowerCase())
    );
    return userCalendar?.id || '';
  };

  const getEditableCalendars = () => {
    // Owner can edit all calendars, others can only edit their own
    if (user.role === 'owner') {
      return calendars;
    }
    
    return calendars.filter(cal => 
      cal.name.toLowerCase().includes(user.name.toLowerCase())
    );
  };

  const createEvent = async () => {
    if (!eventForm.title.trim()) {
      toast({ title: 'Please enter event title', variant: 'destructive' });
      return;
    }
    
    if (!eventForm.calendar_id) {
      toast({ title: 'Please select a calendar', variant: 'destructive' });
      return;
    }

    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        start: selectedSlot.start.toISOString(),
        end: selectedSlot.end.toISOString(),
        calendar_id: eventForm.calendar_id,
        tags: ['Personal'], // Default tag
        reminders: []
      };

      // Add reminders based on user selection
      if (eventForm.remind_1day) {
        eventData.reminders.push({
          type: 'email',
          minutes_before: 1440 // 24 hours
        });
        eventData.reminders.push({
          type: 'browser',
          minutes_before: 1440
        });
      }
      
      if (eventForm.remind_1hour) {
        eventData.reminders.push({
          type: 'email',
          minutes_before: 60 // 1 hour
        });
        eventData.reminders.push({
          type: 'browser',
          minutes_before: 60
        });
      }

      await axios.post('/events', eventData);
      
      toast({
        title: 'Event created',
        description: `"${eventForm.title}" has been added to your calendar`
      });
      
      setShowEventDialog(false);
      loadEvents(); // Refresh events
    } catch (error) {
      toast({
        title: 'Error creating event',
        description: error.response?.data?.detail || 'Failed to create event',
        variant: 'destructive'
      });
    }
  };

  const toggleCalendarVisibility = (calendarId) => {
    const newSelected = new Set(selectedCalendars);
    if (newSelected.has(calendarId)) {
      newSelected.delete(calendarId);
    } else {
      newSelected.add(calendarId);
    }
    setSelectedCalendars(newSelected);
  };

  // Filter events based on selected calendars
  const filteredEvents = events.filter(event => 
    selectedCalendars.has(event.calendar_id)
  );

  const eventStyleGetter = (event) => {
    const calendar = calendars.find(cal => cal.id === event.calendar_id);
    let backgroundColor = calendar?.color || '#10B981';
    
    // Special colors for different types
    if (event.tags?.includes('Bills')) {
      backgroundColor = '#DC2626'; // Red for bills
    } else if (event.calendar_id === getUserCalendarId()) {
      backgroundColor = '#3B82F6'; // Blue for current user's calendar
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="mr-3">📅</span>
          Family Calendar
        </h1>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowEmailSettings(true)}
            variant="outline"
            className="border-blue-200"
          >
            <span className="mr-2">📧</span>
            Email Settings
          </Button>
          <Button
            onClick={loadEvents}
            variant="outline"
            className="border-emerald-200"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      {/* Calendar Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-700">View calendars:</span>
        {calendars.map(calendar => {
          const isVisible = selectedCalendars.has(calendar.id);
          return (
            <Badge
              key={calendar.id}
              variant={isVisible ? "default" : "outline"}
              onClick={() => toggleCalendarVisibility(calendar.id)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: isVisible ? calendar.color : 'transparent',
                borderColor: calendar.color,
                color: isVisible ? 'white' : calendar.color
              }}
            >
              {calendar.name}
            </Badge>
          );
        })}
      </div>

      {/* Permission Notice */}
      {user.role === 'guest' ? (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <span className="text-xl mr-2">👁️</span>
            <span className="font-medium">Read-only access: You can view all calendars but cannot create or edit events.</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-800">
            <span className="text-xl mr-2">✍️</span>
            <span className="font-medium">
              {user.role === 'owner' 
                ? 'You can create events in any calendar. Click on the calendar to add events.'
                : 'You can create events in your own calendar. Click on the calendar to add events.'
              }
            </span>
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6" style={{ height: '600px' }}>
        <BigCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={user.role !== 'guest'}
          selectRange={true}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => 
              `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          }}
          timeslots={2}
          step={30}
          popup={true}
          showMultiDayTimes={true}
        />
      </div>

      {/* Event Creation Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description (optional)"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location (optional)"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Calendar *</label>
              <Select 
                value={eventForm.calendar_id} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, calendar_id: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  {getEditableCalendars().map(calendar => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Reminders</label>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={eventForm.remind_1day}
                  onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, remind_1day: checked }))}
                />
                <label className="text-sm text-gray-700">Remind me 1 day before</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={eventForm.remind_1hour}
                  onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, remind_1hour: checked }))}
                />
                <label className="text-sm text-gray-700">Remind me 1 hour before</label>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={createEvent} className="flex-1">
                Create Event
              </Button>
              <Button variant="outline" onClick={() => setShowEventDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Settings Dialog */}
      <Dialog open={showEmailSettings} onOpenChange={setShowEmailSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📧 Email Notification Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Notification Email</label>
              <Input
                type="email"
                value={emailSettings.email}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This email will receive reminders for your calendar events
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={emailSettings.notifications}
                onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, notifications: checked }))}
              />
              <label className="text-sm text-gray-700">Enable email notifications</label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={saveEmailSettings} className="flex-1">
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => setShowEmailSettings(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;