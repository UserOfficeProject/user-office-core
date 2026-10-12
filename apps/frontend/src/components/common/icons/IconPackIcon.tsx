import { SvgIconProps } from '@mui/material';
import React, { forwardRef, PropsWithRef, useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

import defaultIconPack from './default';
import eliIconPack from './eli';

// Icon pack definitions, set the ICON_PACK app setting to the keys of this object to switch between icon packs
const ICON_PACKS = {
  default: defaultIconPack,
  eli: eliIconPack,
} satisfies Record<string, IconPack>;

export const IconPackIcon = forwardRef<
  SVGSVGElement | null,
  { icon: Icons } & IconProps
>(function IconPackIconComponent({ icon, ...props }, ref) {
  const { settingsMap } = useContext(SettingsContext);
  const settingsValue =
    settingsMap?.get(SettingsId.ICON_PACK)?.settingsValue ?? 'default';

  const currentIconPack: IconPackName =
    settingsValue in ICON_PACKS ? (settingsValue as IconPackName) : 'default';

  const Icon = ICON_PACKS[currentIconPack][icon] ?? ICON_PACKS.default[icon];

  return <Icon {...props} ref={ref} />;
});

// Helper types

type Icons = keyof typeof defaultIconPack;

type IconProps = PropsWithRef<SvgIconProps>;

type IconPackName = keyof typeof ICON_PACKS;

export type IconComponent = (props: IconProps) => JSX.Element | null;

export type IconPack = Partial<Record<Icons, IconComponent>>;
