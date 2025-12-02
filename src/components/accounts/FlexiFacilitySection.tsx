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
import { FlexiFacilityCard } from './FlexiFacilityCard';
import { FlexiFacilityForm } from './FlexiFacilityForm';
import { useFlexiFacility } from '@/hooks/useFlexiFacility';

type ViewMode = 'view' | 'add' | 'edit';

export function FlexiFacilitySection() {
  const { facility, isLoading, hasExistingFacility, availableCredit, deleteFacility } =
    useFlexiFacility();
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAddClick = () => {
    setViewMode('add');
  };

  const handleEditClick = () => {
    setViewMode('edit');
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleFormSuccess = () => {
    setViewMode('view');
  };

  const handleFormCancel = () => {
    setViewMode('view');
  };

  const handleDeleteConfirm = async () => {
    const result = await deleteFacility();
    if (result.success) {
      toast.success('Flexi facility deleted');
    } else {
      toast.error('Failed to delete flexi facility');
    }
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading flexi facility...</span>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'add' ? 'Add Flexi Facility' : 'Edit Flexi Facility'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlexiFacilityForm
            facility={viewMode === 'edit' && facility ? facility : undefined}
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
        <h2 className="text-xl font-semibold">Flexi Facility</h2>
        {!hasExistingFacility ? (
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Flexi Facility
          </Button>
        ) : (
          <Button variant="outline" onClick={handleEditClick}>
            Edit
          </Button>
        )}
      </div>

      {!hasExistingFacility ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2 text-center">
              No flexi facility configured yet.
            </p>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              A flexi facility (like FNB Flexi or Standard Bank Access Bond) allows you to
              use velocity banking and flexi chunking strategies for debt repayment.
            </p>
            <p className="text-muted-foreground text-xs mb-4">
              You can only have one flexi facility.
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Flexi Facility
            </Button>
          </CardContent>
        </Card>
      ) : (
        facility && (
          <FlexiFacilityCard
            facility={facility}
            availableCredit={availableCredit}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flexi Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{facility?.name}</span>? This action
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
