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
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { useExpenses } from '@/hooks/useExpenses';
import type { ExpenseEntry } from '@/types/expense';

type ViewMode = 'list' | 'add' | 'edit';

/**
 * Category label mapping for delete dialog
 */
const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing',
  transport: 'Transport',
  food: 'Food',
  utilities: 'Utilities',
  insurance: 'Insurance',
  entertainment: 'Entertainment',
  other: 'Other',
};

export function ExpenseSection() {
  const { expenses, isLoading, totalMonthlyExpenses, expensesByCategory, deleteExpense } =
    useExpenses();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseEntry | null>(null);

  const handleAddClick = () => {
    setViewMode('add');
    setEditingExpense(null);
  };

  const handleEditClick = (expense: ExpenseEntry) => {
    setViewMode('edit');
    setEditingExpense(expense);
  };

  const handleDeleteClick = (expense: ExpenseEntry) => {
    setDeletingExpense(expense);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingExpense(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingExpense?.id) {
      const result = await deleteExpense(deletingExpense.id);
      if (result.success) {
        toast.success('Expense deleted');
      } else {
        toast.error('Failed to delete expense');
      }
    }
    setDeletingExpense(null);
  };

  const handleDeleteCancel = () => {
    setDeletingExpense(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading expenses...</span>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{viewMode === 'add' ? 'Add Expense' : 'Edit Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            expense={editingExpense ?? undefined}
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
        <h2 className="text-xl font-semibold">Monthly Expenses</h2>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2 text-center">No expenses added yet.</p>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              Add your monthly expenses (housing, transport, food, utilities, etc.) to help
              calculate your available surplus for debt payments.
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses={totalMonthlyExpenses}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <AlertDialog open={!!deletingExpense} onOpenChange={() => setDeletingExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{' '}
              <span className="font-semibold">
                {deletingExpense ? CATEGORY_LABELS[deletingExpense.category] : ''}
              </span>{' '}
              expense? This action cannot be undone.
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
