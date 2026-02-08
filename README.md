Lumi is an AI-powered app that turns a set of photos into a short, story-driven recap that feels like a mini movie rather than a slideshow.

## Problem
People take thousands of photos from trips, weekends, and events, but rarely do anything with them. Creating a recap takes time and editing skill, and most tools either require manual work or produce generic templates that don’t feel personal.

## Solution
Users select a set of photos and Lumi automatically generates a recap with structured pacing, highlights, and a clear beginning-middle-end storyline.

## How It Works
Lumi uses an OpenAI vision-capable model to analyze selected photos and return structured outputs such as:
- scene ordering
- key moments
- overall vibe / theme

This output directly drives recap generation to ensure the final video feels coherent and intentional.

## Tech Stack
- React Native (Expo)
- Serverless backend functions
- OpenAI vision model

## Key Challenge
Early versions produced recaps that felt random and lacked narrative flow. I improved coherence by iterating on prompting and output structure to enforce stronger storytelling and highlight selection.

## Validation
Early MVP testing showed strong sharing intent — users immediately wanted to send recaps to friends because they felt emotionally personal rather than templated.

## Key Takeaway
Building Lumi reinforced that strong AI products depend as much on workflow and UX design as model capability. The product succeeds when the output feels trustworthy and intentional.
