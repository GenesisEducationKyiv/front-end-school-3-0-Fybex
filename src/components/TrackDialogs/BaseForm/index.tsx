import { type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { type Genres } from "@/lib/api/genres";
import { type CreateTrackFormData } from "@/lib/api/tracks";

import FormField from "./FormField";
import GenreSelector from "./GenreSelector";

interface BaseFormProps {
  form: UseFormReturn<CreateTrackFormData>;
  isLoading: boolean;
  submitButtonText: string;
  availableGenres: Genres;
  dialogType: "create" | "edit";
  onSubmit: (data: CreateTrackFormData) => void;
  onCancel?: () => void;
}

export default function BaseForm({
  form,
  isLoading,
  submitButtonText,
  availableGenres,
  dialogType,
  onSubmit,
  onCancel,
}: BaseFormProps) {
  return (
    <form
      className="grid gap-4 py-4"
      data-testid="track-form"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit(onSubmit)(e);
      }}
    >
      <FormField
        dataTestId="input-title"
        form={form}
        label="Title"
        name="title"
        placeholder="e.g. Bohemian Rhapsody"
      />
      <FormField
        dataTestId="input-artist"
        form={form}
        label="Artist"
        name="artist"
        placeholder="e.g. Queen"
      />
      <FormField
        dataTestId="input-album"
        form={form}
        label="Album"
        name="album"
        placeholder="e.g. A Night at the Opera"
      />
      <FormField
        dataTestId="input-cover-image"
        form={form}
        label="Cover URL"
        name="coverImage"
        placeholder="https://example.com/image.jpg"
      />

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2" htmlFor="genres-button">
          Genres
        </Label>
        <GenreSelector availableGenres={availableGenres} form={form} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          data-testid="submit-button"
          disabled={
            isLoading ||
            (dialogType === "edit" && !form.formState.isDirty) ||
            (dialogType === "create" && !form.formState.isValid)
          }
          type="submit"
        >
          {isLoading
            ? dialogType === "create"
              ? "Creating..."
              : "Saving..."
            : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
