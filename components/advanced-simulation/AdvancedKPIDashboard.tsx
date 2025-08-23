import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdvancedOrder, ProductionStation } from '@/types/advanced-factory';
import { calculateAdvancedKPIs } from '@/lib/advanced-factory-utils';

interface AdvancedKPIDashboardProps {
  orders: AdvancedOrder[];
  completedOrders: AdvancedOrder[];
  stations: ProductionStation[];
  simulationStartTime: Date;
  onClearData: () => void;
}

export function AdvancedKPIDashboard({
  orders,
  completedOrders,
  stations,
  simulationStartTime,
  onClearData
}: AdvancedKPIDashboardProps) {
  const allOrders = [...orders, ...completedOrders];
  const kpis = calculateAdvancedKPIs(allOrders, stations, new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">KPI Dashboard</h2>
        <Button onClick={onClearData} variant="outline">
          Clear Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Active: {orders.length}, Completed: {completedOrders.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Throughput Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpis.avgThroughputTime)}</div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders per Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ordersPerHour.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">estimated rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Bottleneck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.currentBottleneck}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(kpis.stationUtilization[kpis.currentBottleneck])}% utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Station Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Station Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(kpis.stationUtilization).map(([component, utilization]) => (
              <div key={component} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{component}</span>
                  <span>{Math.round(utilization)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              orders.reduce((acc, order) => {
                acc[order.phase] = (acc[order.phase] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([phase, count]) => (
              <div key={phase} className="flex justify-between items-center">
                <span className="text-sm">{phase}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            Advanced performance charts will be implemented here.
            <br />
            This will include throughput over time, bottleneck analysis, and efficiency trends.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}