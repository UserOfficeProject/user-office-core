import { useEffect, useState } from 'react';

import { TemplateGroupId } from 'generated/sdk';
import { useTemplates } from 'hooks/template/useTemplates';
/**
 * Gets all active templates based on given parameters
 * @param groupId The group id for templates
 * @param includeTemplate Template ID to include even if inactive in the return, specify `falsy` value if not needed
 * @returns list of templates
 */
export function useActiveTemplates(
  groupId: TemplateGroupId,
  includeTemplate?: number | null
) {
  const [loading, setLoading] = useState(true);

  const { templates: activeTemplates } = useTemplates({
    isArchived: false,
    group: groupId,
  });

  const { templates, setTemplates } = useTemplates(
    activeTemplates
      ? {
          templateIds: activeTemplates
            .map((t) => t.templateId)
            .concat(includeTemplate ? includeTemplate : []),
        }
      : undefined
  );

  useEffect(() => {
    if (templates) {
      setLoading(false);
    }
  }, [templates]);

  return { templates, setTemplates, loading };
}
