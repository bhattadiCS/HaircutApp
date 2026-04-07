import { STYLE_PREVIEW_ART, VIBE_PREVIEW_ART } from './lib/brandArtwork';

export const BUTTON_SPRING = {
  type: 'spring',
  stiffness: 450,
  damping: 25,
};

export const STYLES = [
  { id: 'fade', name: 'Skin Fade', type: 'Short', maintenance: 'High', bestFor: ['Square', 'Oval', 'Round'], preview: STYLE_PREVIEW_ART.fade },
  { id: 'perm', name: 'Modern Perm', type: 'Medium', maintenance: 'Medium', bestFor: ['Diamond', 'Heart', 'Oval'], preview: STYLE_PREVIEW_ART.perm },
  { id: 'middle', name: 'Middle Part', type: 'Medium', maintenance: 'Low', bestFor: ['Oval', 'Diamond', 'Square'], preview: STYLE_PREVIEW_ART.middle },
  { id: 'mullet', name: 'Modern Mullet', type: 'Medium', maintenance: 'High', bestFor: ['Oval', 'Heart', 'Diamond'], preview: STYLE_PREVIEW_ART.mullet },
  { id: 'buzz', name: 'Buzz Cut', type: 'Short', maintenance: 'Low', bestFor: ['Square', 'Oval', 'Round'], preview: STYLE_PREVIEW_ART.buzz },
];

export const VIBES = [
  { id: 'street', label: 'Street', img: VIBE_PREVIEW_ART.street, desc: 'Urban & Edgy' },
  { id: 'classic', label: 'Classic', img: VIBE_PREVIEW_ART.classic, desc: 'Clean & Professional' },
  { id: 'flow', label: 'The Flow', img: VIBE_PREVIEW_ART.flow, desc: 'Relaxed & Wavy' },
];
