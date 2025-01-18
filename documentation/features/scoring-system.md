## Features Documentation
`/docs/features/scoring-system.md`

### Supported Scoring Systems

#### NFL Fantasy Scoring
- PPR (Point Per Reception)
- Standard (non-PPR)
- Custom rule configurations supported
- Points awarded for:
  - Passing yards and touchdowns
  - Rushing yards and touchdowns
  - Receptions and receiving yards
  - Various other stat categories

#### NBA Fantasy Scoring
- Points system
- Custom multipliers for different stats
- Categories include:
  - Points scored
  - Rebounds
  - Assists
  - Steals
  - Blocks
  - Turnovers (negative points)

### Future Enhancements
1. Add support for:
   - NFL half-PPR scoring
   - NBA category-based scoring
   - Additional sports leagues
2. Implement scoring history tracking
3. Add league scoring rule modification with retroactive recalculation
4. Performance optimizations:
   - Score caching
   - Materialized views for commonly accessed totals