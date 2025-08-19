import { Poppins, Caveat } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-poppins',
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400','700'],
  variable: '--font-caveat',
});
