import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountCard } from './AccountCard';
import { AccountForm } from './AccountForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useAccounts } from '@/hooks/useAccounts';
import type { DebtAccount } from '@/types/account';

type ViewMode = 'list' | 'add' | 'edit';

export function AccountList() {
  const { accounts, isLoading } = useAccounts();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingAccount, setEditingAccount] = useState<DebtAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<DebtAccount | null>(null);

  const handleAddClick = () => {
    setViewMode('add');
    setEditingAccount(null);
  };

  const handleEditClick = (account: DebtAccount) => {
    setEditingAccount(account);
    setViewMode('edit');
  };

  const handleDeleteClick = (account: DebtAccount) => {
    setDeletingAccount(account);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingAccount(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingAccount(null);
  };

  const handleDeleteClose = () => {
    setDeletingAccount(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading accounts...</span>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'add' ? 'Add Debt Account' : 'Edit Debt Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm
            account={editingAccount ?? undefined}
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
        <h2 className="text-xl font-semibold">Debt Accounts</h2>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Debt Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No debt accounts yet. Add your first account to get started.
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        account={deletingAccount}
        open={!!deletingAccount}
        onClose={handleDeleteClose}
      />
    </div>
  );
}
