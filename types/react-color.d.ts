declare module "react-color" {
  import * as React from "react";

  export type ColorResult = {
    hex: string;
  };

  export type ChromePickerProps = {
    color?: string;
    onChange?: (color: ColorResult) => void;
  };

  export const ChromePicker: React.ComponentType<ChromePickerProps>;
}
