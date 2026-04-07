import { STYLE_PREVIEW_ART, VIBE_PREVIEW_ART } from './lib/brandArtwork';

export const BUTTON_SPRING = {
  type: 'spring',
  stiffness: 450,
  damping: 25,
};

export const STYLES = [
  { id: 'fade', name: 'Skin Fade', type: 'Short', maintenance: 'High', bestFor: ['Square', 'Oval', 'Round'], preview: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&h=400&auto=format&fit=crop', estimatedCost: '$45 - $65' },
  { id: 'perm', name: 'Modern Perm', type: 'Medium', maintenance: 'Medium', bestFor: ['Diamond', 'Heart', 'Oval'], preview: 'https://images.unsplash.com/photo-1560243563-06dd5cfa28fb?q=80&w=400&h=400&auto=format&fit=crop', estimatedCost: '$120 - $200' },
  { id: 'middle', name: 'Middle Part', type: 'Medium', maintenance: 'Low', bestFor: ['Oval', 'Diamond', 'Square'], preview: 'https://images.unsplash.com/photo-1622281834944-bd380134b21c?q=80&w=400&h=400&auto=format&fit=crop', estimatedCost: '$60 - $90' },
  { id: 'mullet', name: 'Modern Mullet', type: 'Medium', maintenance: 'High', bestFor: ['Oval', 'Heart', 'Diamond'], preview: 'https://images.unsplash.com/photo-1593726852924-f7615b3e648f?q=80&w=400&h=400&auto=format&fit=crop', estimatedCost: '$70 - $110' },
  { id: 'buzz', name: 'Buzz Cut', type: 'Short', maintenance: 'Low', bestFor: ['Square', 'Oval', 'Round'], preview: 'https://images.unsplash.com/photo-1517765108866-990a424cdfb4?q=80&w=400&h=400&auto=format&fit=crop', estimatedCost: '$30 - $50' },
];

export const VIBES = [
  { id: 'street', label: 'Street', img: VIBE_PREVIEW_ART.street, desc: 'Urban & Edgy' },
  { id: 'classic', label: 'Classic', img: VIBE_PREVIEW_ART.classic, desc: 'Clean & Professional' },
  { id: 'flow', label: 'The Flow', img: VIBE_PREVIEW_ART.flow, desc: 'Relaxed & Wavy' },
];
