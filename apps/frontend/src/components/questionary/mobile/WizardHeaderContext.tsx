import React, { createContext, useContext, useMemo, useState } from 'react';

import { CardActionSheetItem } from 'components/common/cards/CardActionSheet';

type WizardHeaderValue = {
  menuItems: CardActionSheetItem[];
  setMenuItems: (items: CardActionSheetItem[]) => void;
  errorCount: number;
  setErrorCount: (count: number) => void;
};

const WizardHeaderContext = createContext<WizardHeaderValue | null>(null);

export function useWizardHeader() {
  return useContext(WizardHeaderContext);
}

export function WizardHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuItems, setMenuItems] = useState<CardActionSheetItem[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  const value = useMemo(
    () => ({ menuItems, setMenuItems, errorCount, setErrorCount }),
    [menuItems, errorCount]
  );

  return <WizardHeaderContext value={value}>{children}</WizardHeaderContext>;
}
