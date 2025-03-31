import 'styled-components';
import { CSSProp } from 'styled-components';

declare module 'react' {
  interface Attributes {
    css?: CSSProp;
  }
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
  }
} 