import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Configure moment localizer
const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCalendars();
    loadEvents();
  }, []);

  const loadCalendars = async () => {
    try {
      const response = await axios.get('/calendars');
      setCalendars(response.data);
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
      const response = await axios.get('/events');
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
    toast({
      title: event.title,
      description: `${moment(event.start).format('MMMM D, YYYY HH:mm')}${event.location ? ` at ${event.location}` : ''}`,
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
    
    toast({
      title: 'Create Event',
      description: 'Event creation coming soon!',
    });
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
      <div className="mb-4 flex flex-wrap gap-2">
        {calendars.map(calendar => (
          <Badge
            key={calendar.id}
            variant="outline"
            style={{ borderColor: calendar.color }}
            className="text-sm"
          >
            {calendar.name}
          </Badge>
        ))}
      </div>

      {/* Guest Notice */}
      {user.role === 'guest' && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <span className="text-xl mr-2">👁️</span>
            <span className="font-medium">Read-only access: You can view events but cannot create or edit them.</span>
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6" style={{ height: '600px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={user.role !== 'guest'}
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
        />
      </div>
    </div>
  );
};

export default CalendarView;