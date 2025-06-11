In summary, the “hardcoded” pieces are:
Sample reviews (the ten reviews and ratings for your own product).

Market products (names A/B/C/D, with hardcoded avg_rating/price/units_sold).

Review counts array ([120, 85, 180, 110]) for those market products.

Our product’s price (69.99) and units_sold (600) inside our_metrics.

“Key Findings” bullets (except the interpolated rank), which never change.

“Improvement Areas” list (four fixed issue statements).

“Strategic Recommendations” list (five fixed action items).

All static template labels/icons/headers in dashboard.html.



perf.csv
value_score = avg_rating / (price / 10)
feature_gap_score = missing_features / total_desired_features
 
sentiment_analysis to be done using NLTK Vader.


# AI Actionable Insights:
-------------------------
The function currently provides insights based on these key metrics and their thresholds:

Overall Market Rank:
    Top 3 (Leader)
    Top 50% (Mid-Market)
Bottom 50% (Challenged)
    Pricing Position:
    Price higher than 75% of competitors (Premium)
    Price lower than 25% of competitors AND good rating (Competitive Advantage)
    Price lower than 25% of competitors (Competitive Pricing)
Average Rating (Quality):
    Below 3.5 (Quality Concerns)
    At or above 4.5 (Excellent Quality)
Sentiment:
    More than 20% negative reviews (Sentiment Alert)
    More than 75% positive reviews (Strong Positive Sentiment)
Market Share:
    Less than 5% (Market Share Opportunity)
    Greater than 20% (Strong Market Share)
