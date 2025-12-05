import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
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
  strategyConfigFormSchema,
  formValuesToStrategyConfig,
  strategyConfigToFormValues,
} from '@/lib/validation/strategy-config';
import { useStrategyConfig } from '@/hooks/useStrategyConfig';
import { useAccounts } from '@/hooks/useAccounts';

type FormValues = z.infer<typeof strategyConfigFormSchema>;

const PAYMENT_FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Monthly (12 payments/year)',
  'bi-weekly': 'Bi-Weekly (26 payments/year)',
  weekly: 'Weekly (52 payments/year)',
};

interface StrategyConfigFormProps {
  onSuccess?: () => void;
}

/**
 * Strategy Configuration Form
 *
 * Allows users to configure strategy parameters:
 * - Chunk amount: Custom amount for flexi strategies (optional)
 * - Payment frequency: How often extra payments are made
 * - Target account: Manual override for debt targeting priority
 *
 * AC-4.7.9: Form with validation for strategy configuration
 */
export function StrategyConfigForm({ onSuccess }: StrategyConfigFormProps) {
  const { config, updateConfig, isLoading: configLoading } = useStrategyConfig();
  const { accounts, isLoading: accountsLoading } = useAccounts();

  const form = useForm({
    resolver: zodResolver(strategyConfigFormSchema),
    defaultValues: strategyConfigToFormValues(config),
  });

  // Reset form when config loads
  useEffect(() => {
    if (!configLoading) {
      form.reset(strategyConfigToFormValues(config));
    }
  }, [config, configLoading, form]);

  const onSubmit = async (values: FormValues) => {
    const configData = formValuesToStrategyConfig(values);
    const result = await updateConfig(configData);

    if (result.success) {
      toast.success('Strategy configuration saved');
      onSuccess?.();
    } else {
      toast.error('Failed to save configuration');
    }
  };

  const handleReset = async () => {
    // Reset to default configuration values
    const result = await updateConfig({
      chunkAmount: null,
      paymentFrequency: 'monthly',
      targetAccountId: null,
    });

    if (result.success) {
      toast.success('Configuration reset to defaults');
      form.reset(strategyConfigToFormValues({
        chunkAmount: null,
        paymentFrequency: 'monthly',
        targetAccountId: null,
      }));
    }
  };

  if (configLoading || accountsLoading) {
    return <div className="text-muted-foreground">Loading configuration...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="chunkAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunk Amount (ZAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Leave empty to use full surplus"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Custom amount for periodic lump sum payments. Leave empty to use your full available surplus.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PAYMENT_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How often you make extra debt payments. Bi-weekly and weekly increase your annual contribution.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Account Override</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'default' ? null : parseInt(value, 10))}
                value={field.value === null ? 'default' : String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="default">Use Strategy Default</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Override which debt to prioritize. Leave as &quot;Use Strategy Default&quot; for automatic targeting (smallest balance for snowball, highest rate for avalanche).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Save Configuration
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </form>
    </Form>
  );
}
