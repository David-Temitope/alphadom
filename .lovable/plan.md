
# Firecrawl Integration Plan for Alphadom E-Commerce Platform

## Overview

This plan integrates Firecrawl's AI-powered web scraping capabilities into Alphadom to enhance vendor tools, content creation, and market intelligence features. The integration will be built using Supabase Edge Functions to securely handle API calls.

---

## Integration Areas

### 1. Vendor Market Research Tool (High Value)
**Purpose**: Help Nigerian vendors research competitor prices and market trends to price their products competitively.

**Features**:
- Web search for similar products across Nigerian e-commerce sites (Jumia, Konga, etc.)
- Extract pricing data and product information
- Display competitive pricing insights in vendor dashboard

**Location**: New section in Vendor Dashboard → "Market Insights"

---

### 2. Blog Content Generator (Admin Tool)
**Purpose**: Help admins create blog posts by scraping and summarizing relevant content from the web.

**Features**:
- Input a topic or URL to research
- Firecrawl fetches and summarizes content
- Admin can use the summary as inspiration for original blog posts

**Location**: Admin Blog Management page → "Research Content" button

---

### 3. Enhanced Gideon AI with Web Search
**Purpose**: Allow Gideon AI assistant to search the web when users ask questions beyond platform data.

**Features**:
- Detect when user questions need external information
- Use Firecrawl search to find relevant answers
- Combine web results with platform data for comprehensive responses

**Location**: Existing GideonChat component (enhanced)

---

### 4. Product Description Enhancer (Vendor Tool)
**Purpose**: Help vendors improve their product descriptions by analyzing similar products online.

**Features**:
- Analyze successful product listings from competitors
- Suggest SEO-friendly tags and descriptions
- Extract best practices from top-selling products

**Location**: Vendor Product Form → "Enhance Description" button

---

## Technical Implementation

### Phase 1: Connect Firecrawl & Create Edge Functions

**Step 1**: Link Firecrawl connector to project
- Use the Firecrawl connector to make `FIRECRAWL_API_KEY` available

**Step 2**: Create Edge Functions

```text
supabase/functions/
├── firecrawl-scrape/index.ts    (Single URL scraping)
├── firecrawl-search/index.ts    (Web search)
└── firecrawl-map/index.ts       (URL discovery)
```

Each function will:
- Accept requests from authenticated users only
- Use the FIRECRAWL_API_KEY secret
- Return structured data to the frontend

**Step 3**: Create Frontend API Layer
```text
src/lib/api/firecrawl.ts
```
Provides typed functions for calling edge functions from React components.

---

### Phase 2: Vendor Market Research Tool

**New Files**:
- `src/components/vendor/MarketResearch.tsx` - Research UI component
- `src/hooks/useMarketResearch.tsx` - Data fetching hook

**Integration Points**:
- Add "Market Insights" tab to `VendorDashboard.tsx`
- Display competitor prices for similar products
- Show pricing recommendations

**UI Features**:
- Search input for product name/category
- Results showing: product name, price, source site
- Price comparison chart
- Export research data option

---

### Phase 3: Blog Content Research

**Modifications**:
- `src/pages/admin/AdminBlog.tsx` - Add research panel

**New Components**:
- `src/components/admin/ContentResearch.tsx` - Research UI

**Features**:
- Topic search input
- Web search results preview
- One-click content extraction from URLs
- Summary generation for inspiration

---

### Phase 4: Enhanced Gideon AI

**Modifications**:
- `supabase/functions/chat-with-gideon/index.ts` - Add web search capability

**Logic Flow**:
1. Detect if question needs web search (keywords like "how to", "what is", "latest")
2. If yes, call Firecrawl search edge function
3. Include web results in AI context
4. Generate response combining platform + web data

---

### Phase 5: Product Description Enhancer

**New Files**:
- `src/components/vendor/DescriptionEnhancer.tsx`

**Integration**:
- Add to `VendorProductForm.tsx` and `VendorProductEditForm.tsx`
- Button triggers scraping of similar products
- Displays suggestions for:
  - Better product descriptions
  - SEO tags
  - Pricing insights

---

## Database Changes

**New Table**: `market_research_cache`
```sql
CREATE TABLE market_research_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES approved_vendors(id),
  search_query TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);
```

**Purpose**: Cache research results to:
- Reduce API calls
- Speed up repeated searches
- Save vendor research history

---

## Security Considerations

1. **Authentication Required**: All edge functions verify user authentication
2. **Rate Limiting**: Implement per-user rate limits to prevent abuse
3. **Vendor-Only Access**: Market research only available to approved vendors
4. **Admin-Only Blog Research**: Content research restricted to admins
5. **API Key Protection**: Firecrawl key stored as Supabase secret, never exposed to client

---

## User Experience Flow

### Vendor Market Research:
```text
1. Vendor opens Dashboard → "Market Insights"
2. Enters product name or category
3. System searches Nigerian e-commerce sites
4. Results show competitor prices
5. Vendor uses data to price competitively
```

### Blog Content Research:
```text
1. Admin opens Blog Management
2. Clicks "Research Content"
3. Enters topic (e.g., "fashion trends Nigeria 2026")
4. System fetches relevant articles
5. Admin reviews summaries
6. Uses insights to write original blog post
```

### Enhanced Gideon Chat:
```text
1. User asks: "What are the latest fashion trends?"
2. Gideon detects external knowledge needed
3. Searches web for fashion trends
4. Combines with platform products
5. Responds with trends + relevant Alphadom products
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/firecrawl-scrape/index.ts` | Scrape single URLs |
| `supabase/functions/firecrawl-search/index.ts` | Web search |
| `supabase/functions/firecrawl-map/index.ts` | URL discovery |
| `src/lib/api/firecrawl.ts` | Frontend API layer |
| `src/components/vendor/MarketResearch.tsx` | Vendor research UI |
| `src/components/admin/ContentResearch.tsx` | Admin blog research |
| `src/components/vendor/DescriptionEnhancer.tsx` | Product description helper |
| `src/hooks/useMarketResearch.tsx` | Research data hook |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/VendorDashboard.tsx` | Add Market Insights tab |
| `src/pages/admin/AdminBlog.tsx` | Add research panel |
| `src/components/VendorProductForm.tsx` | Add enhance button |
| `src/components/VendorProductEditForm.tsx` | Add enhance button |
| `supabase/functions/chat-with-gideon/index.ts` | Add web search capability |

---

## Benefits for Nigerian Vendors

1. **Competitive Pricing**: Know what others charge before listing products
2. **Better Descriptions**: Learn from successful listings
3. **Time Savings**: AI-powered research instead of manual browsing
4. **SEO Optimization**: Extract winning tags from top products
5. **Market Trends**: Stay updated on what's selling

---

## Implementation Priority

1. **First**: Connect Firecrawl + Create base edge functions
2. **Second**: Vendor Market Research (highest business value)
3. **Third**: Blog Content Research (admin productivity)
4. **Fourth**: Enhanced Gideon AI (user experience)
5. **Fifth**: Description Enhancer (vendor assistance)

---

## Notes

- All features respect Nigerian e-commerce context
- Pricing displayed in Naira (₦)
- Focus on Nigerian marketplaces (Jumia, Konga, Jiji)
- Mobile-responsive UI for all new components
- Firecrawl connector must be linked before implementation begins
