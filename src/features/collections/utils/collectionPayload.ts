import type { ModeEnum, TypeEnum, VisibilityEnum } from "@/client";

interface CollectionPayloadValues {
  name: string;
  description?: string;
  visibility: VisibilityEnum;
  mode: ModeEnum;
  type: TypeEnum;
  collaborators: string[];
}

/**
 * Builds the create/update body from the form values. Favorites are per user and set through the dedicated
 * `favorite` endpoints, so the payload never carries `is_favorite`; `collaboratorObjects` is form-only state.
 */
export const buildCollectionPayload = (values: CollectionPayloadValues) => ({
  name: values.name,
  description: values.description,
  visibility: values.visibility,
  mode: values.mode,
  type: values.type,
  collaborators: values.collaborators.map(Number),
});
