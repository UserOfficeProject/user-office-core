import KeyboardDoubleArrowDown from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import { IconButton, Tooltip } from '@mui/material';
import React, {
  DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export function useExpandCollapseAll(
  tableSelector: string,
  dependencies: DependencyList
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableRef = useRef<any>(null);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  //find position to render button
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = document.querySelector(`${tableSelector} thead tr`);
      if (!container) return;

      const cells = container.querySelectorAll('th, td');
      const cellArray = Array.from(cells);
      const targetCell = cellArray.find(
        (cell) =>
          cell.hasAttribute('data-expand-all-target') ||
          (cell.childElementCount === 0 && cell.textContent?.trim() === '')
      );

      if (targetCell) {
        if (!targetCell.hasAttribute('data-expand-all-target')) {
          targetCell.setAttribute('data-expand-all-target', 'true');
        }
        setPortalTarget(targetCell as HTMLElement);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, dependencies);

  //index each row and expand/collapse them
  const toggleExpandAll = useCallback(() => {
    const nextExpandedState = !isAllExpanded;

    const sortedData = tableRef.current?.dataManager?.sortedData || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortedData.forEach((row: any, index: number) => {
      const isCurrentlyExpanded = !!row.tableData.showDetailPanel;
      if (isCurrentlyExpanded !== nextExpandedState) {
        const detailPanelProp = tableRef.current?.props.detailPanel;
        const detailPanelRenderFunction = Array.isArray(detailPanelProp)
          ? detailPanelProp[0].render
          : detailPanelProp;

        tableRef.current?.onToggleDetailPanel(
          [index],
          detailPanelRenderFunction
        );
      }
    });

    setIsAllExpanded(nextExpandedState);
  }, [isAllExpanded]);

  const expandCollapseAllButton = portalTarget
    ? createPortal(
        <Tooltip title={isAllExpanded ? 'Collapse all' : 'Expand all'}>
          <IconButton onClick={toggleExpandAll} data-cy="expand-collapse-all">
            {isAllExpanded ? (
              <KeyboardDoubleArrowDown />
            ) : (
              <KeyboardDoubleArrowRight />
            )}
          </IconButton>
        </Tooltip>,
        portalTarget
      )
    : null;

  return { tableRef, expandCollapseAllButton };
}
