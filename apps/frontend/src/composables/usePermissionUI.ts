import { computed } from "vue";
import { Action, Resource, usePermissions } from "./usePermissions.js";

/**
 * Composable for UI elements that depend on permissions
 * Provides computed properties for showing/hiding buttons, sections, etc.
 *
 * @example
 * const { canShowDeleteButton, canShowEditSection } = usePermissionUI(Resource.PROJECTS)
 *
 * // In template:
 * <button v-if="canShowDeleteButton" @click="deleteProject">Delete</button>
 */
export function usePermissionUI(resource: Resource) {
  const { can, canCreate, canRead, canUpdate, canDelete, canExport, isAdmin } =
    usePermissions();

  const canShowCreateButton = computed(() => canCreate(resource));
  const canShowReadContent = computed(() => canRead(resource));
  const canShowEditButton = computed(() => canUpdate(resource));
  const canShowDeleteButton = computed(() => canDelete(resource));
  const canShowExportButton = computed(() => canExport(resource));
  const canShowAdminSection = computed(() => isAdmin.value);

  /**
   * Get CSS classes based on permissions
   */
  const getPermissionClasses = () => {
    const classes: Record<string, boolean> = {
      "has-read": canRead(resource),
      "has-create": canCreate(resource),
      "has-update": canUpdate(resource),
      "has-delete": canDelete(resource),
      "has-export": canExport(resource),
      "is-admin": isAdmin.value,
    };

    return Object.keys(classes)
      .filter((key) => classes[key])
      .join(" ");
  };

  /**
   * Get a list of available actions
   */
  const getAvailableActions = () => {
    const actions: Action[] = [];

    if (canRead(resource)) actions.push(Action.READ);
    if (canCreate(resource)) actions.push(Action.CREATE);
    if (canUpdate(resource)) actions.push(Action.UPDATE);
    if (canDelete(resource)) actions.push(Action.DELETE);
    if (canExport(resource)) actions.push(Action.EXPORT);

    return actions;
  };

  /**
   * Check if user can perform specific action
   */
  const canPerform = (action: Action) => can(resource, action);

  return {
    // Computed properties
    canShowCreateButton,
    canShowReadContent,
    canShowEditButton,
    canShowDeleteButton,
    canShowExportButton,
    canShowAdminSection,

    // Methods
    canPerform,
    getAvailableActions,
    getPermissionClasses,
  };
}
