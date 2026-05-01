
export const SAFETY_KEYWORDS = [
  'starve', 'starving', 'starvation', 'purge', 'purging', 'vomit', 'laxative', 
  'anorexia', 'bulimia', 'binge', 'thinspo', 'restriction', 'restrictive',
  'fasting for days', 'compensate', 'punish myself', 'body dysmorphia'
];

export function checkSafety(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export const SAFETY_RESOURCES = [
  {
    name: "NEDA Helpline",
    desc: "National Eating Disorders Association",
    link: "https://www.nationaleatingdisorders.org/",
    contact: "Text 'NEDA' to 741741"
  },
  {
    name: "Beat Eating Disorders",
    desc: "UK-based support and helplines",
    link: "https://www.beateatingdisorders.org.uk/",
    contact: "0808 801 0677"
  },
  {
    name: "Crisis Text Line",
    desc: "24/7 free, confidential support",
    link: "https://www.crisistextline.org/",
    contact: "Text HOME to 741741"
  }
];
