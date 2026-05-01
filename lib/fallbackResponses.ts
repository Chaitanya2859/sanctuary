// =============================================================================
// SANCTUARY — FALLBACK RESPONSE LIBRARY
// =============================================================================

export type Mood =
  | 'Joy' | 'Trust' | 'Anticipation' | 'Surprise'
  | 'Fear' | 'Sadness' | 'Disgust' | 'Anger'
  | 'Anxious' | 'Overwhelmed' | 'Lonely' | 'Bored' | 'Calm' | 'Stressed'

export type Trigger =
  | 'Stressed' | 'Bored' | 'Lonely' | 'Anxious'
  | 'Celebrating' | 'Tired' | 'Habit' | 'Procrastinating' | "I don't know"

export type HungerBand = 'low' | 'mid' | 'high'

export interface FallbackInput {
  mood?:    Mood
  trigger?: Trigger
  hunger?:  number   // 1–10
}

export const MOOD_RESPONSES: Record<string, string[]> = {
  Joy: [
    "Something light is in the air right now. That feeling is real and worth sitting with for a moment — joy can be easy to rush past.",
    "You're feeling good right now, and that matters. What's making this moment feel good — is it something you can name?",
  ],
  Trust: [
    "There's a steadiness in trust — a sense that things are okay, that you're okay. That's a grounding place to eat from.",
    "Feeling trust is quieter than joy but often more sustaining. You're not eating to chase a feeling or escape one.",
  ],
  Anticipation: [
    "There's something buzzing under the surface. Anticipation can make us rush. See if you can slow down just slightly.",
    "When we're anticipating something, our mind is already in the future. Your body is still here, though. Take three breaths.",
  ],
  Surprise: [
    "Something unexpected landed today. Surprise can knock us slightly off our rhythm. Are you hungry, or just looking to feel settled?",
    "A surprised nervous system sometimes reaches for food as a way of restoring the familiar. Notice whether hunger is actually part of this.",
  ],
  Fear: [
    "Fear lives in the chest, the gut, the shoulders. Before you eat, take a slow breath. Food can soothe briefly, but the fear usually waits.",
    "When we're afraid, eating can feel like immediate comfort. Will eating make the situation more manageable, or are you hoping it will disappear?",
  ],
  Sadness: [
    "Sadness has weight. It makes sense that you'd want something warm and grounding. Are you seeking nourishment, or for the sadness to stop?",
    "Being sad and eating is very human. Are you giving yourself permission to feel, or is eating a way of outrunning the feeling?",
  ],
  Disgust: [
    "Disgust is a signal that your system is rejecting something. Is the disgust about food, or something happening in your day?",
    "Something feels 'off' right now. Your body is saying no to something. What is the disgust actually about?",
  ],
  Anger: [
    "Anger is energy looking for somewhere to go. What are you actually angry about? Eating won't answer the anger, but naming it might help.",
    "There's a fire in you. Anger usually means a boundary was crossed. Acknowledge its existence before you begin to eat.",
  ],
  Anxious: [
    "Anxiety creates a restlessness. Is there actual hunger there, or is it a buzzing energy looking for an outlet?",
    "When anxiety is high, the urge to eat can feel physical and urgent. Try to hear whether hunger is actually part of this moment.",
  ],
  Overwhelmed: [
    "When everything is too much, eating can feel like a reset button. Am I overwhelmed by too much, or by not enough of what I need?",
    "Overwhelm means your nervous system has hit a ceiling. Food feels simple and manageable. Be kind to yourself here.",
  ],
  Lonely: [
    "Loneliness is a powerful trigger. Food is companionship when others aren't available. Is there a person you could reach out to?",
    "Eating can hold the space, but it can't fill the gap. What kind of connection are you actually missing right now?",
  ],
  Bored: [
    "Boredom often mimics hunger. Try giving yourself two minutes of doing nothing. If the urge fades, it was likely boredom.",
    "The brain runs on novelty. When it's missing, it goes looking for glucose. Notice that stimulation-seeking as you eat.",
  ],
  Calm: [
    "Eating from a place of calm is a beautiful thing. You're tuned in, and your system isn't shouting.",
    "Take your time with this meal. When you're calm, your digestion works better and your taste is clearer."
  ],
  Stressed: [
    "Stress tightens the body. Before you reach for food, notice where that stress lives. Food softens the sensation briefly, but the stressor remains.",
    "Your choice to pause right now is a powerful counter-signal to emergency. You're reclaiming a moment of peace."
  ]
};

export const TRIGGER_RESPONSES: Record<string, string[]> = {
  Stressed: [
    "Stress tightens the body. Notice where it lives right now. Food can soften the physical sensation briefly.",
    "In stress, the body is in a state of emergency. Notice that signal. Is food what this moment actually needs?"
  ],
  Bored: [
    "Boredom mimics hunger. Does this urge have a specific craving, or just a general restlessness?",
    "Are you eating because your body needs fuel, or because your mind needs a task? Both are honest answers."
  ],
  Lonely: [
    "Loneliness has a physical dimension. Eating activates reward systems, but it won't resolve the loneliness itself.",
    "When we're lonely, food becomes a reliable comfort. Use this meal as a small act of self-care."
  ],
  Anxious: [
    "Anxiety can create a compulsive urge to eat. Try grounding your feet and taking a breath to hear your body clearly.",
    "Anxious eating often happens fast. Slowing down, even slightly, helps you hear what your body actually needs."
  ],
  Celebrating: [
    "Eating as celebration is an ancient tradition. Let yourself fully taste and enjoy this moment. You earned it.",
    "When you eat now, let it be intentional. Acknowledge whatever you're marking today."
  ],
  Tired: [
    "Fatigue lowers glucose, causing cravings. If you're tired, food might help briefly, but the real need is rest.",
    "Self-regulation is lower when we're exhausted. If you're reaching for food, give yourself grace and seek rest soon."
  ],
  Habit: [
    "Habit eating is routine running on autopilot. If this habit didn't exist, would you be eating right now?",
    "Notice whether your hunger cue is internal (physical) or external (the clock, the location, the routine)."
  ],
  Procrastinating: [
    "Eating as procrastination is remarkably common. Take 60 seconds to name the task you're avoiding.",
    "Food gives the illusion of a skip without the guilt of doing nothing. What's one tiny step you could take after this?"
  ],
  "I don't know": [
    "Not knowing is an honest answer. Try scanning your body to see where the sensation of 'wanting' lives.",
    "Sometimes the urge just pulls. Eat slowly, and notice whether the feeling changes afterward."
  ]
};

export const HUNGER_BAND_RESPONSES: Record<string, string[]> = {
  low: [
    "Your hunger is low. Something other than physical need is likely driving this. What's the feeling underneath?",
    "At this level, your body hasn't sent a strong signal. Is it emotion, habit, or boredom leading the way?"
  ],
  mid: [
    "Your hunger is in the middle range. Your body is talking, but not shouting. This is a good time to eat mindfully.",
    "Mid-range hunger is the sweet spot. You have a real need, but room to be thoughtful about your choices."
  ],
  high: [
    "Your hunger is high. Your body genuinely needs fuel. Try to start with a few bites, then pause slightly.",
    "At this level, the signal is clear. Honor that and eat. Presence, not restraint, is the practice here."
  ]
};

export const HUNGER_BAND_CONTEXT: Record<string, string> = {
  low:  "Your hunger is low — notice whether the body is asking for food or whether the emotional state is doing most of the asking.",
  mid:  "Your hunger is in the middle range — your body has a real need, and this is a good moment to eat with presence.",
  high: "Your hunger is high — your body has a clear physical need right now, so eat. The emotional noticing can happen alongside.",
};

export const GENERIC_FALLBACKS: string[] = [
  "Before you eat, take one slow breath and check in with your stomach. Is there hunger there, or is the urge coming from elsewhere?",
  "The fact that you paused before eating is already the practice. You're bringing awareness to this moment.",
  "Every check-in is data. Eat slowly enough that you can hear your body's feedback as you go."
];

export function getHungerBand(hunger: number): HungerBand {
  if (hunger <= 3) return 'low'
  if (hunger <= 6) return 'mid'
  return 'high'
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getFallbackResponse(input: FallbackInput): string {
  const { mood, trigger, hunger } = input
  const band = hunger !== undefined ? getHungerBand(hunger) : undefined

  // Priority: Mood, then Trigger, then Hunger, then Generic
  if (mood && MOOD_RESPONSES[mood]) {
    let resp = pickRandom(MOOD_RESPONSES[mood]);
    if (band) resp += " " + HUNGER_BAND_CONTEXT[band];
    return resp;
  }

  if (trigger && TRIGGER_RESPONSES[trigger]) {
    let resp = pickRandom(TRIGGER_RESPONSES[trigger]);
    if (band) resp += " " + HUNGER_BAND_CONTEXT[band];
    return resp;
  }

  if (band) {
    return pickRandom(HUNGER_BAND_RESPONSES[band]);
  }

  return pickRandom(GENERIC_FALLBACKS);
}
