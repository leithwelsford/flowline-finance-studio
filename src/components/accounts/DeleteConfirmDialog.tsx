import { toast } from 'sonner';
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
import { useAccounts } from '@/hooks/useAccounts';
import type { DebtAccount } from '@/types/account';

interface DeleteConfirmDialogProps {
  account: DebtAccount | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteConfirmDialog({
  account,
  open,
  onClose,
}: DeleteConfirmDialogProps) {
  const { deleteAccount } = useAccounts();

  const handleConfirm = async () => {
    if (!account?.id) return;

    const result = await deleteAccount(account.id);
    if (result.success) {
      toast.success('Account deleted');
    } else {
      toast.error('Failed to delete account');
    }
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{account?.name}</span>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
