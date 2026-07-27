-- =====================================================
-- CanetaOS - Schema v7: product_events was missing an
-- INSERT policy, so every analytics/content-view event
-- was silently failing under RLS.
-- =====================================================

CREATE POLICY "Anyone can insert events"
  ON product_events FOR INSERT
  WITH CHECK (true);
