// lib/fonts.js
import { Poppins, Caveat } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
});
