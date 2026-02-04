import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { MilkingSession, updateSession, deleteSession } from '@/lib/api';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface EditSessionDialogProps {
  session: MilkingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: MilkingSession) => void;
  onDelete: (id: string) => void;
}

export function EditSessionDialog({
  session,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditSessionDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    milk_quantity: session?.milk_quantity || 0,
    start_time: session?.start_time || '',
    end_time: session?.end_time || '',
  });

  const [errors, setErrors] = useState<{
    milk_quantity?: string;
    start_time?: string;
    end_time?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (formData.milk_quantity < 0) {
      newErrors.milk_quantity = t.milkCantBeNegative || 'Milk cannot be negative';
    }
    if (formData.milk_quantity > 100) {
      newErrors.milk_quantity = t.milkTooHigh || 'Maximum 100L per session';
    }
    if (!formData.milk_quantity || formData.milk_quantity === 0) {
      newErrors.milk_quantity = t.milkRequired || 'Milk quantity is required';
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = t.endTimeError || 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!session || !validateForm()) return;

    setIsSaving(true);
    try {
      const updated = await updateSession(session._id, {
        start_time: formData.start_time,
        end_time: formData.end_time,
        milk_quantity: formData.milk_quantity,
        duration: Math.floor(
          (new Date(formData.end_time).getTime() - new Date(formData.start_time).getTime()) /
            1000
        ),
      });

      toast({
        title: t.sessionUpdated || 'Session Updated',
        description: t.changesApplied || 'Your changes have been saved.',
      });

      onSave(updated);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update session';
      toast({
        variant: 'destructive',
        title: t.updateFailed || 'Update Failed',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    setIsDeleting(true);
    try {
      await deleteSession(session._id);

      toast({
        title: t.sessionDeleted || 'Session Deleted',
        description: t.sessionRemoved || 'The session has been removed.',
      });

      onDelete(session._id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete session';
      toast({
        variant: 'destructive',
        title: t.deleteFailed || 'Delete Failed',
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <Dialog open={isOpen && !showDeleteDialog} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <Edit2 className="h-4 w-4" />
              {t.editSession || 'Edit Session'}
            </DialogTitle>
            <DialogDescription>
              {t.editSessionDesc || 'Modify the details of this milking session.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.startTime}</label>
              <Input
                type="datetime-local"
                value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })}
                className={errors.start_time ? 'border-destructive' : ''}
              />
              {errors.start_time && (
                <p className="text-xs text-destructive">{errors.start_time}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.endTime}</label>
              <Input
                type="datetime-local"
                value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
                className={errors.end_time ? 'border-destructive' : ''}
              />
              {errors.end_time && <p className="text-xs text-destructive">{errors.end_time}</p>}
            </div>

            {/* Milk Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t.milkQuantity || 'Milk Quantity (L)'}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.milk_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, milk_quantity: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className={errors.milk_quantity ? 'border-destructive' : ''}
              />
              {errors.milk_quantity && (
                <p className="text-xs text-destructive">{errors.milk_quantity}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                {t.delete || 'Delete'}
              </Button>
            </motion.div>
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? t.saving : t.saveChanges || 'Save Changes'}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <AlertDialog open={showDeleteDialog}>
            <AlertDialogContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AlertDialogTitle className="flex gap-2 items-center text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {t.confirmDelete || 'Delete Session?'}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-4">
                  {t.deleteConfirmation ||
                    'This action cannot be undone. The session will be permanently deleted.'}
                </AlertDialogDescription>
              </motion.div>
              <div className="flex gap-3 mt-6">
                <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                  {t.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? t.deleting || 'Deleting...' : t.delete || 'Delete'}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </>
  );
}
