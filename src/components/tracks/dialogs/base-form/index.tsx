import { UseFormReturn } from 'react-hook-form';

import { FormField } from '@/components/tracks/dialogs/base-form/field';
import { GenreSelector } from '@/components/tracks/dialogs/base-form/genres-selector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreateTrackFormData, GenresResponse } from '@/lib/schemas';

interface BaseFormProps {
  form: UseFormReturn<CreateTrackFormData>;
  onSubmit: (data: CreateTrackFormData) => void;
  isLoading: boolean;
  submitButtonText: string;
  availableGenres: GenresResponse;
  onCancel?: () => void;
  dialogType: 'create' | 'edit';
}

export function BaseForm({
  form,
  onSubmit,
  isLoading,
  submitButtonText,
  availableGenres = [],
  onCancel,
  dialogType,
}: BaseFormProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='grid gap-4 py-4'
      data-testid='track-form'
    >
      <FormField
        name='title'
        label='Title'
        form={form}
        placeholder='e.g. Bohemian Rhapsody'
        dataTestId='input-title'
      />
      <FormField
        name='artist'
        label='Artist'
        form={form}
        placeholder='e.g. Queen'
        dataTestId='input-artist'
      />
      <FormField
        name='album'
        label='Album'
        form={form}
        placeholder='e.g. A Night at the Opera'
        dataTestId='input-album'
      />
      <FormField
        name='coverImage'
        label='Cover URL'
        form={form}
        placeholder='https://example.com/image.jpg'
        dataTestId='input-cover-image'
      />

      <div className='grid grid-cols-4 items-start gap-4'>
        <Label htmlFor='genres-button' className='text-right pt-2'>
          Genres
        </Label>
        <GenreSelector form={form} availableGenres={availableGenres} />
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          disabled={
            isLoading ||
            (dialogType === 'edit' && !form.formState.isDirty) ||
            (dialogType === 'create' && !form.formState.isValid)
          }
          data-testid='submit-button'
        >
          {isLoading
            ? dialogType === 'create'
              ? 'Creating...'
              : 'Saving...'
            : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
