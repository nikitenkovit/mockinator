import { useState } from 'react';

export interface BooleanActions {
  on: () => void;
  off: () => void;
  toggle: () => void;
}

export const useBoolean = (
  initialValue: boolean = false,
): [boolean, BooleanActions] => {
  const [value, setValue] = useState(initialValue);

  const actions: BooleanActions = {
    on: () => setValue(true),
    off: () => setValue(false),
    toggle: () => setValue(!value),
  };

  return [value, actions];
};
