// src/console/pages/ConsoleSubscriptionsPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformSubscriptionsService } from '@/services/platform/platformSubscriptions.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditCard, AlertCircle, Clock } from 'lucide-react';

export function ConsoleSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions', activeTab, page],
    queryFn: () =>
      platformSubscriptionsService.listSubscriptions({
        page,
        limit: 20,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trial: { variant: 'secondary', label: 'Trial' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      suspended: { variant: 'outline', label: 'Suspended' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (planName: string) => {
    if (planName.toLowerCase().includes('enterprise')) {
      return <Badge className="bg-purple-600">Enterprise</Badge>;
    }
    if (planName.toLowerCase().includes('premium')) {
      return <Badge className="bg-blue-600">Premium</Badge>;
    }
    return <Badge variant="outline">{planName}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.data.filter((s) => s.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Trial Subscriptions</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.data.filter((s) => s.status === 'trial').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {subscriptions?.data.filter((s) => s.status === 'overdue').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="trial">Trial</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7] mx-auto"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Billing Cycle</TableHead>
                        <TableHead>Current Period</TableHead>
                        <TableHead>Next Billing</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions?.data.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.tenant.name}</div>
                            <div className="text-sm text-gray-500">{subscription.tenant.owner.email}</div>
                          </TableCell>
                          <TableCell>{getPlanBadge(subscription.plan.name)}</TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                          <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {subscription.next_billing_at
                              ? new Date(subscription.next_billing_at).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {subscriptions && subscriptions.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, subscriptions.meta.total)} of{' '}
                        {subscriptions.meta.total} subscriptions
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page >= subscriptions.meta.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
