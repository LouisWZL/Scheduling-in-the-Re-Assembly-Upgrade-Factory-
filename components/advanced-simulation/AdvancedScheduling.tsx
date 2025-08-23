import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ScheduleItem {
  id: string;
  orderId: string;
  customerName: string;
  productVariant: string;
  scheduledStart: Date;
  estimatedEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedLine: 1 | 2;
}

const mockScheduleData: ScheduleItem[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    customerName: 'Max Mustermann',
    productVariant: 'Porsche 911 Carrera',
    scheduledStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    estimatedEnd: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    actualStart: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedLine: 1
  },
  {
    id: '2',
    orderId: 'ORD-002',
    customerName: 'Anna Schmidt',
    productVariant: 'Porsche 911 Turbo',
    scheduledStart: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    estimatedEnd: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
    status: 'SCHEDULED',
    priority: 'MEDIUM',
    assignedLine: 2
  },
  {
    id: '3',
    orderId: 'ORD-003',
    customerName: 'Thomas Weber',
    productVariant: 'Porsche 911 GT3',
    scheduledStart: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    estimatedEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    actualStart: new Date(Date.now() - 0.5 * 60 * 60 * 1000), // 30 min ago (delayed)
    status: 'DELAYED',
    priority: 'HIGH',
    assignedLine: 1
  },
  {
    id: '4',
    orderId: 'ORD-004',
    customerName: 'Julia Fischer',
    productVariant: 'Porsche 911 Carrera',
    scheduledStart: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    estimatedEnd: new Date(Date.now() + 9 * 60 * 60 * 1000), // 9 hours from now
    status: 'SCHEDULED',
    priority: 'LOW',
    assignedLine: 1
  },
  {
    id: '5',
    orderId: 'ORD-005',
    customerName: 'Michael Meyer',
    productVariant: 'Porsche 911 Turbo',
    scheduledStart: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    estimatedEnd: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    actualStart: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actualEnd: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assignedLine: 2
  }
];

export function AdvancedScheduling() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-500 text-red-700';
      case 'MEDIUM':
        return 'border-orange-500 text-orange-700';
      case 'LOW':
        return 'border-green-500 text-green-700';
      default:
        return 'border-gray-500 text-gray-700';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('de-DE', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDelay = (item: ScheduleItem) => {
    if (!item.actualStart) return 0;
    return Math.max(0, item.actualStart.getTime() - item.scheduledStart.getTime()) / (1000 * 60); // in minutes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Production Scheduling</h2>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Optimizer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockScheduleData.filter(item => item.status === 'SCHEDULED').length}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockScheduleData.filter(item => item.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockScheduleData.filter(item => item.status === 'DELAYED').length}
            </div>
            <div className="text-sm text-muted-foreground">Delayed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockScheduleData.filter(item => item.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Production Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockScheduleData
              .sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime())
              .map((item) => {
                const delay = calculateDelay(item);
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">{item.orderId}</div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">
                            Line {item.assignedLine}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {item.customerName} • {item.productVariant}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Scheduled</div>
                              <div className="text-muted-foreground">
                                {formatTime(item.scheduledStart)} - {formatTime(item.estimatedEnd)}
                              </div>
                            </div>
                          </div>
                          
                          {item.actualStart && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <div>
                                <div className="font-medium">Actual</div>
                                <div className="text-muted-foreground">
                                  {formatTime(item.actualStart)}
                                  {item.actualEnd && ` - ${formatTime(item.actualEnd)}`}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {delay > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Delayed by {Math.round(delay)} minutes</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Line Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Production Line Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((lineNumber) => {
              const lineItems = mockScheduleData.filter(item => item.assignedLine === lineNumber);
              const activeItems = lineItems.filter(item => item.status === 'IN_PROGRESS');
              const scheduledItems = lineItems.filter(item => item.status === 'SCHEDULED');
              
              return (
                <div key={lineNumber} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Production Line {lineNumber}</h3>
                    <div className="text-sm text-muted-foreground">
                      {activeItems.length} active, {scheduledItems.length} scheduled
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {activeItems.map((item) => (
                      <div key={item.id} className="text-sm p-2 bg-green-50 rounded">
                        <span className="font-medium">{item.orderId}</span> - {item.customerName}
                        <span className="float-right text-muted-foreground">
                          Until {formatTime(item.estimatedEnd)}
                        </span>
                      </div>
                    ))}
                    
                    {scheduledItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="text-sm p-2 bg-blue-50 rounded">
                        <span className="font-medium">{item.orderId}</span> - {item.customerName}
                        <span className="float-right text-muted-foreground">
                          Starts {formatTime(item.scheduledStart)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}