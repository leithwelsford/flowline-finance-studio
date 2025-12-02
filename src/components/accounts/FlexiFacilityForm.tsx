import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  flexiFacilityFormSchema,
  formValuesToFlexiFacility,
  flexiFacilityToFormValues,
  type FlexiFacilityFormValues,
} from '@/lib/validation/flexi-facility';
import { useFlexiFacility, type NewFlexiFacilityData } from '@/hooks/useFlexiFacility';
import type { FlexiFacility } from '@/types/flexi-facility';

const FACILITY_TYPE_LABELS: Record<string, string> = {
  fnb_flexi: 'FNB Flexi Option',
  standard_bank_access: 'Standard Bank Access Bond',
};

interface FlexiFacilityFormProps {
  facility?: FlexiFacility;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FlexiFacilityForm({ facility, onSuccess, onCancel }: FlexiFacilityFormProps) {
  const { saveFacility, updateFacility } = useFlexiFacility();
  const isEditMode = !!facility;

  const form = useForm<FlexiFacilityFormValues>({
    resolver: zodResolver(flexiFacilityFormSchema),
    defaultValues: facility
      ? (flexiFacilityToFormValues(facility) as FlexiFacilityFormValues)
      : {
          name: '',
          type: 'fnb_flexi',
          creditLimit: '',
          currentBalance: '',
          interestRate: '',
        },
  });

  const onSubmit = async (values: FlexiFacilityFormValues) => {
    const facilityData = formValuesToFlexiFacility(values) as NewFlexiFacilityData;

    if (isEditMode && facility?.id) {
      const result = await updateFacility(facilityData);
      if (result.success) {
        toast.success('Flexi facility updated');
        onSuccess?.();
      } else {
        toast.error('Failed to update flexi facility');
      }
    } else {
      const result = await saveFacility(facilityData);
      if (result.success) {
        toast.success('Flexi facility saved');
        onSuccess?.();
      } else {
        toast.error(result.error.message || 'Failed to save flexi facility');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Home Bond Flexi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(FACILITY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Limit (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 200000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance/Utilization (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50000 (negative for available credit)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Interest Rate (%) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 11.75"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditMode ? 'Update Facility' : 'Save Facility'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
