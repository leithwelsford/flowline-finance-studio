import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IncomeList } from './IncomeList';
import { IncomeForm } from './IncomeForm';
import { useIncome } from '@/hooks/useIncome';
import type { IncomeEntry } from '@/types/income';

type ViewMode = 'list' | 'add' | 'edit';

export function IncomeSection() {
  const { incomeEntries, isLoading, totalMonthlyIncome, deleteIncome } = useIncome();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<IncomeEntry | null>(null);

  const handleAddClick = () => {
    setViewMode('add');
    setEditingIncome(null);
  };

  const handleEditClick = (income: IncomeEntry) => {
    setViewMode('edit');
    setEditingIncome(income);
  };

  const handleDeleteClick = (income: IncomeEntry) => {
    setDeletingIncome(income);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingIncome(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingIncome(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingIncome?.id) {
      const result = await deleteIncome(deletingIncome.id);
      if (result.success) {
        toast.success('Income source deleted');
      } else {
        toast.error('Failed to delete income source');
      }
    }
    setDeletingIncome(null);
  };

  const handleDeleteCancel = () => {
    setDeletingIncome(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading income sources...</span>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'add' ? 'Add Income Source' : 'Edit Income Source'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm
            income={editingIncome ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Income Sources</h2>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Income Source
        </Button>
      </div>

      {incomeEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2 text-center">
              No income sources added yet.
            </p>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              Add your monthly income sources (salary, side business, rental income, etc.) to help
              calculate how much surplus you have available for debt payments.
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <IncomeList
          incomeEntries={incomeEntries}
          totalMonthlyIncome={totalMonthlyIncome}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <AlertDialog open={!!deletingIncome} onOpenChange={() => setDeletingIncome(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deletingIncome?.source}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
