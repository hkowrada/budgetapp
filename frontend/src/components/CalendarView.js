import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Configure moment localizer for Europe/Paris timezone
moment.tz.setDefault('Europe/Paris');
const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    notes: '',
    location: '',
    start: new Date(),
    end: new Date(),
    all_day: false,
    tags: [],
    calendar_id: ''
  });

  const eventTags = ['Personal', 'Family', 'Bills', 'Work', 'Health'];
  const tagColors = {
    Personal: 'bg-blue-100 text-blue-800',
    Family: 'bg-green-100 text-green-800',
    Bills: 'bg-red-100 text-red-800',
    Work: 'bg-purple-100 text-purple-800',
    Health: 'bg-orange-100 text-orange-800'
  };

  useEffect(() => {
    loadCalendars();
    loadEvents();
  }, []);

  const loadCalendars = async () => {
    try {
      const response = await axios.get('/calendars');
      setCalendars(response.data);
      if (response.data.length > 0 && !eventForm.calendar_id) {
        setEventForm(prev => ({ ...prev, calendar_id: response.data[0].id }));
      }
    } catch (error) {
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
      // Get events for the current month view
      const startOfMonth = moment(currentDate).startOf('month');
      const endOfMonth = moment(currentDate).endOf('month');
      
      const response = await axios.get('/events', {
        params: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        }
      });

      // Transform events for BigCalendar
      const transformedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        title: event.title
      }));

      setEvents(transformedEvents);
    } catch (error) {
      toast({
        title: 'Error loading events',
        description: 'Failed to fetch events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
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
    
    setEventForm({
      title: '',
      notes: '',
      location: '',
      start,
      end,
      all_day: false,
      tags: [],
      calendar_id: calendars[0]?.id || ''
    });
    setShowCreateDialog(true);
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post('/events', {
        ...eventForm,
        start: eventForm.start.toISOString(),
        end: eventForm.end.toISOString()
      });
      
      toast({ title: 'Event created successfully' });
      setShowCreateDialog(false);
      loadEvents();
    } catch (error) {
      toast({
        title: 'Error creating event',
        description: error.response?.data?.detail || 'Failed to create event',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      toast({ title: 'Event deleted successfully' });
      setShowEventDialog(false);
      loadEvents();
    } catch (error) {
      toast({
        title: 'Error deleting event',
        description: 'Failed to delete event',
        variant: 'destructive'
      });
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#10B981'; // Default emerald
    
    if (event.tags?.includes('Bills')) {
      backgroundColor = '#DC2626'; // Red for bills
    } else if (event.tags?.includes('Personal')) {
      backgroundColor = '#3B82F6'; // Blue for personal
    } else if (event.tags?.includes('Family')) {
      backgroundColor = '#059669'; // Dark green for family
    } else if (event.tags?.includes('Work')) {
      backgroundColor = '#7C3AED'; // Purple for work
    } else if (event.tags?.includes('Health')) {
      backgroundColor = '#EA580C'; // Orange for health
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
      <div className=\"flex items-center justify-center h-64\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500\"></div>
      </div>
    );
  }

  return (
    <div className=\"p-6\">
      <div className=\"flex items-center justify-between mb-6\">
        <h1 className=\"text-3xl font-bold text-gray-800 flex items-center\">
          <span className=\"mr-3\">📅</span>
          Family Calendar
        </h1>
        
        <div className=\"flex items-center space-x-4\">
          {user.role !== 'guest' && (
            <Button
              data-testid=\"create-event-btn\"
              onClick={() => setShowCreateDialog(true)}
              className=\"bg-emerald-500 hover:bg-emerald-600\"
            >
              <span className=\"mr-2\">➕</span>
              New Event
            </Button>
          )}
          
          <Button
            onClick={loadEvents}
            variant=\"outline\"
            className=\"border-emerald-200\"
          >
            <span className=\"mr-2\">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      {/* Calendar Filters */}
      <div className=\"mb-4 flex flex-wrap gap-2\">
        {calendars.map(calendar => (
          <Badge
            key={calendar.id}
            variant=\"outline\"
            style={{ borderColor: calendar.color }}
            className=\"text-sm\"
          >
            {calendar.name}
          </Badge>
        ))}
      </div>

      {/* Calendar Component */}
      <div className=\"bg-white rounded-xl shadow-lg border border-emerald-100 p-6\" style={{ height: '600px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor=\"start\"
          endAccessor=\"end\"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={user.role !== 'guest'}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
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
          onNavigate={(date) => {
            setCurrentDate(date);
            setTimeout(loadEvents, 100); // Reload events for new date range
          }}
        />
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className=\"max-w-md\">
          <DialogHeader>
            <DialogTitle className=\"flex items-center text-xl\">
              <span className=\"mr-2\">📋</span>
              Event Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className=\"space-y-4\">
              <div>
                <h3 className=\"font-semibold text-lg\">{selectedEvent.title}</h3>
                <p className=\"text-gray-600 text-sm\">
                  {moment(selectedEvent.start).format('MMMM D, YYYY HH:mm')} - 
                  {moment(selectedEvent.end).format('HH:mm')}
                </p>
              </div>
              
              {selectedEvent.location && (
                <div>
                  <span className=\"text-sm font-medium text-gray-700\">📍 Location:</span>
                  <p className=\"text-sm text-gray-600\">{selectedEvent.location}</p>
                </div>
              )}
              
              {selectedEvent.notes && (
                <div>
                  <span className=\"text-sm font-medium text-gray-700\">📝 Notes:</span>
                  <p className=\"text-sm text-gray-600\">{selectedEvent.notes}</p>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <span className=\"text-sm font-medium text-gray-700\">🏷️ Tags:</span>
                  <div className=\"flex flex-wrap gap-1 mt-1\">
                    {selectedEvent.tags.map(tag => (
                      <Badge key={tag} className={tagColors[tag] || 'bg-gray-100 text-gray-800'}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {user.role !== 'guest' && selectedEvent.source_type !== 'bill' && (
                <div className=\"flex justify-end space-x-2 pt-4\">
                  <Button
                    variant=\"outline\"
                    onClick={() => setShowEventDialog(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant=\"destructive\"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className=\"max-w-md\">
          <DialogHeader>
            <DialogTitle className=\"flex items-center text-xl\">
              <span className=\"mr-2\">➕</span>
              Create New Event
            </DialogTitle>
          </DialogHeader>
          
          <div className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">Title</label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder=\"Event title\"
                className=\"w-full\"
              />
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">Calendar</label>
              <Select
                value={eventForm.calendar_id}
                onValueChange={(value) => setEventForm(prev => ({ ...prev, calendar_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder=\"Select calendar\" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map(calendar => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className=\"flex items-center space-x-2\">
                        <div 
                          className=\"w-3 h-3 rounded-full\" 
                          style={{ backgroundColor: calendar.color }}
                        ></div>
                        <span>{calendar.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">Start</label>
                <Input
                  type=\"datetime-local\"
                  value={moment(eventForm.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setEventForm(prev => ({ 
                    ...prev, 
                    start: new Date(e.target.value) 
                  }))}
                />
              </div>
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">End</label>
                <Input
                  type=\"datetime-local\"
                  value={moment(eventForm.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setEventForm(prev => ({ 
                    ...prev, 
                    end: new Date(e.target.value) 
                  }))}
                />
              </div>
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">Location</label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder=\"Event location (optional)\"
              />
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">Notes</label>
              <Textarea
                value={eventForm.notes}
                onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder=\"Additional notes (optional)\"
                rows={3}
              />
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">Tags</label>
              <div className=\"flex flex-wrap gap-2\">
                {eventTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={eventForm.tags.includes(tag) ? \"default\" : \"outline\"}
                    className={`cursor-pointer ${
                      eventForm.tags.includes(tag) 
                        ? tagColors[tag] 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setEventForm(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }));
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className=\"flex justify-end space-x-2 pt-4\">
              <Button
                variant=\"outline\"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={!eventForm.title || !eventForm.calendar_id}
                className=\"bg-emerald-500 hover:bg-emerald-600\"
              >
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;