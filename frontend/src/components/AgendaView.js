import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const AgendaView = ({ user }) => {
  const [agendaData, setAgendaData] = useState({ events: [], upcoming_bills: [] });
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const { toast } = useToast();

  const tagColors = {
    Personal: 'bg-blue-100 text-blue-800',
    Family: 'bg-green-100 text-green-800',
    Bills: 'bg-red-100 text-red-800',
    Work: 'bg-purple-100 text-purple-800',
    Health: 'bg-orange-100 text-orange-800'
  };

  useEffect(() => {
    loadAgenda();
  }, [selectedDays]);

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/agenda?days=${selectedDays}`);
      setAgendaData(response.data);
    } catch (error) {
      toast({
        title: 'Error loading agenda',
        description: 'Failed to fetch agenda data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const groupBillsByDate = (bills) => {
    const grouped = {};
    bills.forEach(bill => {
      const date = bill.due_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(bill);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const groupedBills = groupBillsByDate(agendaData.upcoming_bills);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="mr-3">📋</span>
          Agenda & Upcoming
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {[7, 14, 30].map(days => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDays(days)}
                className={selectedDays === days ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                {days} days
              </Button>
            ))}
          </div>
          
          <Button
            onClick={loadAgenda}
            variant="outline"
            className="border-emerald-200"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bills">Bills Due</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">💳</span>
            Upcoming Bills ({agendaData.upcoming_bills.length})
          </h2>
          {agendaData.upcoming_bills.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-2 block">💳</span>
                  <p>No bills due in the next {selectedDays} days</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            agendaData.upcoming_bills.map(bill => (
              <Card key={bill.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <div className="font-medium text-gray-800">{bill.name}</div>
                        <div className="text-sm text-gray-600">
                          Due: {moment(bill.due_date).format('dddd, MMMM D, YYYY')}
                          {bill.provider && ` • ${bill.provider}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">€{bill.amount.toLocaleString()}</div>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {moment(bill.due_date).diff(moment(), 'days') === 0 ? 'Due Today' : 
                         moment(bill.due_date).diff(moment(), 'days') === 1 ? 'Due Tomorrow' :
                         `Due in ${moment(bill.due_date).diff(moment(), 'days')} days`}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">📅</span>
            Upcoming Events ({agendaData.events.length})
          </h2>
          {agendaData.events.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-2 block">📅</span>
                  <p>No upcoming events in the next {selectedDays} days</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            agendaData.events.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {moment(event.start).format('dddd, MMMM D, YYYY [at] HH:mm')}
                        {event.location && ` • ${event.location}`}
                      </div>
                      {event.notes && (
                        <div className="text-sm text-gray-500 mt-1">{event.notes}</div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.tags?.map(tag => (
                        <Badge key={tag} className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaView;
          {allDates.length === 0 ? (
            <Card>
              <CardContent className=\"flex items-center justify-center h-32\">
                <div className=\"text-center text-gray-500\">
                  <span className=\"text-4xl mb-2 block\">📅</span>
                  <p>No upcoming events or bills in the next {selectedDays} days</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            allDates.map(date => {
              const events = groupedEvents[date] || [];
              const bills = groupedBills[date] || [];
              const dateObj = moment(date);
              const isToday = dateObj.isSame(moment(), 'day');
              const isTomorrow = dateObj.isSame(moment().add(1, 'day'), 'day');
              
              return (
                <Card key={date} className={`${isToday ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                  <CardHeader className=\"pb-3\">
                    <CardTitle className=\"flex items-center justify-between\">
                      <div className=\"flex items-center space-x-3\">
                        <div className=\"text-2xl font-bold text-emerald-600\">
                          {dateObj.format('DD')}
                        </div>
                        <div>
                          <div className=\"font-semibold text-gray-800\">
                            {dateObj.format('dddd')}
                            {isToday && <Badge className=\"ml-2 bg-emerald-500\">Today</Badge>}
                            {isTomorrow && <Badge className=\"ml-2 bg-blue-500\">Tomorrow</Badge>}
                          </div>
                          <div className=\"text-sm text-gray-600\">
                            {dateObj.format('MMMM D, YYYY')}
                          </div>
                        </div>
                      </div>
                      <div className=\"text-right text-sm text-gray-500\">
                        {events.length + bills.length} item{events.length + bills.length !== 1 ? 's' : ''}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=\"space-y-3\">
                    {/* Events */}
                    {events.map(event => (
                      <div key={event.id} className=\"flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200\">
                        <div className=\"text-2xl\">📅</div>
                        <div className=\"flex-1\">
                          <div className=\"font-medium text-gray-800\">{event.title}</div>
                          <div className=\"text-sm text-gray-600\">
                            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                            {event.location && ` • ${event.location}`}
                          </div>
                          {event.notes && (
                            <div className=\"text-sm text-gray-500 mt-1\">{event.notes}</div>
                          )}
                        </div>
                        <div className=\"flex flex-wrap gap-1\">
                          {event.tags?.map(tag => (
                            <Badge key={tag} className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Bills */}
                    {bills.map(bill => (
                      <div key={bill.id} className=\"flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200\">
                        <div className=\"text-2xl\">💳</div>
                        <div className=\"flex-1\">
                          <div className=\"font-medium text-gray-800\">{bill.name}</div>
                          <div className=\"text-sm text-gray-600\">
                            Due: {moment(bill.due_date).format('MMMM D, YYYY')}
                            {bill.provider && ` • ${bill.provider}`}
                          </div>
                        </div>
                        <div className=\"text-right\">
                          <div className=\"font-bold text-red-600\">€{bill.amount.toLocaleString()}</div>
                          <Badge className=\"bg-red-100 text-red-800 text-xs\">Bill Due</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value=\"events\" className=\"space-y-4 mt-6\">
          <h2 className=\"text-xl font-semibold text-gray-800 flex items-center\">
            <span className=\"mr-2\">📅</span>
            Upcoming Events ({agendaData.events.length})
          </h2>
          {agendaData.events.length === 0 ? (
            <Card>
              <CardContent className=\"flex items-center justify-center h-32\">
                <div className=\"text-center text-gray-500\">
                  <span className=\"text-4xl mb-2 block\">📅</span>
                  <p>No upcoming events in the next {selectedDays} days</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            agendaData.events.map(event => (
              <Card key={event.id}>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center space-x-3\">
                    <div className=\"text-2xl\">📅</div>
                    <div className=\"flex-1\">
                      <div className=\"font-medium text-gray-800\">{event.title}</div>
                      <div className=\"text-sm text-gray-600\">
                        {moment(event.start).format('dddd, MMMM D, YYYY [at] HH:mm')}
                        {event.location && ` • ${event.location}`}
                      </div>
                      {event.notes && (
                        <div className=\"text-sm text-gray-500 mt-1\">{event.notes}</div>
                      )}
                    </div>
                    <div className=\"flex flex-wrap gap-1\">
                      {event.tags?.map(tag => (
                        <Badge key={tag} className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bills" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">💳</span>
            Upcoming Bills ({agendaData.upcoming_bills.length})
          </h2>
          {agendaData.upcoming_bills.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-2 block">💳</span>
                  <p>No bills due in the next {selectedDays} days</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            agendaData.upcoming_bills.map(bill => (
              <Card key={bill.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <div className="font-medium text-gray-800">{bill.name}</div>
                        <div className="text-sm text-gray-600">
                          Due: {moment(bill.due_date).format('dddd, MMMM D, YYYY')}
                          {bill.provider && ` • ${bill.provider}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">€{bill.amount.toLocaleString()}</div>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {moment(bill.due_date).diff(moment(), 'days') === 0 ? 'Due Today' : 
                         moment(bill.due_date).diff(moment(), 'days') === 1 ? 'Due Tomorrow' :
                         `Due in ${moment(bill.due_date).diff(moment(), 'days')} days`}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaView;