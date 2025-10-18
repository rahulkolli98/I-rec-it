# Migration from OpenRouter to Google Gemini API

## Overview
This project has been successfully migrated from OpenRouter API to Google Gemini API for all AI-powered features including:
- Book recommendations
- Movie recommendations  
- Content summaries

## What Changed

### 1. Environment Variables
**Before:**
```
OPENROUTER_API_KEY=your_openrouter_key
BOOK_SUMMARY_MODEL=mistralai/mistral-nemo
MOVIE_SUMMARY_MODEL=mistralai/mistral-nemo
MOVIE_RECOMMENDATION_MODEL=mistralai/mistral-nemo
BOOK_RECOMMENDATION_MODEL=google/gemma-3-27b-it
```

**After:**
```
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Files Updated
- `next.config.js` - Updated environment variable configuration
- `app/api/summarize/route.ts` - Book summary API route
- `app/api/movies/summarize/route.ts` - Movie summary API route
- `app/api/movies/recommend/route.ts` - Movie recommendation API route
- `app/mood/[mood]/page.tsx` - Book recommendation page

### 3. API Endpoint Changes
- **Old:** `https://openrouter.ai/api/v1/chat/completions`
- **New:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

### 4. Request/Response Format Changes

**OpenRouter Format (Old):**
```javascript
{
  model: "mistralai/mistral-nemo",
  messages: [{ role: "user", content: "prompt" }]
}
// Response: data.choices[0].message.content
```

**Gemini Format (New):**
```javascript
{
  contents: [{ parts: [{ text: "prompt" }] }],
  generationConfig: { temperature: 0.9, topP: 0.9 }
}
// Response: data.candidates[0].content.parts[0].text
```

## Setup Instructions

### Step 1: Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### Step 2: Update Environment Variables
1. Create or update your `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. Remove old OpenRouter variables:
   - Remove `OPENROUTER_API_KEY`
   - Remove `BOOK_SUMMARY_MODEL`
   - Remove `MOVIE_SUMMARY_MODEL`
   - Remove `MOVIE_RECOMMENDATION_MODEL`
   - Remove `BOOK_RECOMMENDATION_MODEL`

### Step 3: Restart Development Server
```bash
npm run dev
```

## Benefits of Gemini API

1. **Free Tier:** Generous free tier with 60 requests per minute
2. **Simplified Configuration:** No need to specify different models
3. **Better Performance:** Faster response times
4. **Google Integration:** Easy integration with other Google services
5. **Updated Models:** Access to latest Gemini Pro models

## API Rate Limits

**Gemini Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

If you need higher limits, consider upgrading to a paid plan.

## Troubleshooting

### Error: "Missing GEMINI_API_KEY environment variable"
- Make sure you've created a `.env.local` file
- Verify the API key is correctly set
- Restart your development server after adding the key

### Error: "Invalid API key"
- Double-check your API key from Google AI Studio
- Ensure there are no extra spaces or quotes
- Make sure the key hasn't been revoked

### Error: "Quota exceeded"
- You've hit the rate limit (60 requests/minute)
- Wait a minute and try again
- Consider implementing request caching

## Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [API Quickstart Guide](https://ai.google.dev/tutorials/get_started_web)

## Rollback Instructions

If you need to revert to OpenRouter:
1. Restore the `.bak` files
2. Update environment variables back to OpenRouter
3. Revert the changes in the updated files

## Support

For issues or questions:
1. Check the Gemini API documentation
2. Review the error logs in the browser console
3. Verify all environment variables are set correctly
