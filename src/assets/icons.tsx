import { default as BooleanIcon } from './BooleanIcon.svg';
import { default as DateIcon } from './DateIcon.svg';
import { default as NumberIcon } from './NumberIcon.svg';
import { default as StringIcon } from './StringIcon.svg';

const icons = {
  BooleanIcon,
  DateIcon,
  NumberIcon,
  StringIcon,
};

export type IconType = keyof typeof icons;

export default icons;
