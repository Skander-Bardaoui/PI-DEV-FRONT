// src/console/pages/ConsolePlansPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformSubscriptionsService } from '@/services/platform/platformSubscriptions.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ConsolePlansPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price_monthly: '',
    price_annual: '',
    max_users: '',
    max_businesses: '',
    features: '',
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => platformSubscriptionsService.listPlans(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => platformSubscriptionsService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan created successfully');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      platformSubscriptionsService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
      setEditingPlan(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformSubscriptionsService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted');
    },
    onError: () => {
      toast.error('Failed to delete plan');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price_monthly: '',
      price_annual: '',
      max_users: '',
      max_businesses: '',
      features: '',
      is_active: true,
    });
  };

  const handleSubmit = () => {
    const planData = {
      ...formData,
      price_monthly: parseFloat(formData.price_monthly),
      price_annual: parseFloat(formData.price_annual),
      max_users: formData.max_users ? parseInt(formData.max_users) : null,
      max_businesses: formData.max_businesses ? parseInt(formData.max_businesses) : null,
      features: formData.features.split('\n').filter((f) => f.trim()),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price_monthly: plan.price_monthly.toString(),
      price_annual: plan.price_annual.toString(),
      max_users: plan.max_users?.toString() || '',
      max_businesses: plan.max_businesses?.toString() || '',
      features: plan.features.join('\n'),
      is_active: plan.is_active,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plans & Pricing</h2>
          <p className="text-gray-500 mt-1">Manage subscription plans</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-[#534AB7] hover:bg-[#6B5BC7]">
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7] mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.slug}</CardDescription>
                  </div>
                  {!plan.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">${plan.price_monthly}</div>
                  <div className="text-sm text-gray-500">per month</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${plan.price_annual}/year (save ${(plan.price_monthly * 12 - plan.price_annual).toFixed(0)})
                  </div>
                </div>

                {(plan.max_users || plan.max_businesses) && (
                  <div className="text-sm space-y-1">
                    {plan.max_users && <div>• Up to {plan.max_users} users</div>}
                    {plan.max_businesses && <div>• Up to {plan.max_businesses} businesses</div>}
                  </div>
                )}

                <div className="space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this plan?')) {
                        deleteMutation.mutate(plan.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingPlan} onOpenChange={() => {
        setIsCreateOpen(false);
        setEditingPlan(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details' : 'Add a new subscription plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="enterprise"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                  placeholder="99.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_annual">Annual Price ($)</Label>
                <Input
                  id="price_annual"
                  type="number"
                  value={formData.price_annual}
                  onChange={(e) => setFormData({ ...formData, price_annual: e.target.value })}
                  placeholder="999.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_users">Max Users (optional)</Label>
                <Input
                  id="max_users"
                  type="number"
                  value={formData.max_users}
                  onChange={(e) => setFormData({ ...formData, max_users: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_businesses">Max Businesses (optional)</Label>
                <Input
                  id="max_businesses"
                  type="number"
                  value={formData.max_businesses}
                  onChange={(e) => setFormData({ ...formData, max_businesses: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Unlimited invoices&#10;Advanced reporting&#10;Priority support"
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingPlan(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-[#534AB7] hover:bg-[#6B5BC7]"
            >
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
