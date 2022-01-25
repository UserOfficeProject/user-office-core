import { useEffect, useState } from 'react';

import { GetTemplatesQuery, TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

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
  const api = useDataApi();

  const [templates, setTemplates] = useState<
    GetTemplatesQuery['templates'] | null
  >(null);

  useEffect(() => {
    api()
      .getTemplates({ filter: { group: groupId, isArchived: false } })
      .then((data) => {
        // if we need to include an extra template
        if (includeTemplate) {
          api()
            .getTemplate({ templateId: includeTemplate })
            .then(({ template }) => {
              if (template && data.templates) {
                const alreadyContainsExtraTemplate = data.templates.find(
                  (t) => t.templateId === template.templateId
                );
                if (alreadyContainsExtraTemplate) {
                  setTemplates(data.templates);
                } else {
                  setTemplates([...data.templates, template]);
                }
              }
            });
        } else {
          setTemplates(data.templates);
        }
      });
  }, [groupId, includeTemplate, api]);

  return { templates, setTemplates };
}
