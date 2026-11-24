-- Nightly demo reset (runs at 3 AM via pg_cron job "reset-demo-data").
-- Wipes the demo account and rebuilds it from the data below.
-- Anything added to the demo outside this function is erased each night,
-- so permanent demo content (like product photos) must live here.

CREATE OR REPLACE FUNCTION public.reset_demo_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  demo_uid uuid := 'de7e6738-4ae7-472e-81cc-feb94a5cc5fa';
BEGIN
  -- Clear existing demo data
  DELETE FROM gift_products WHERE gift_id IN (SELECT id FROM gifts WHERE user_id = demo_uid);
  DELETE FROM gift_recipients WHERE gift_id IN (SELECT id FROM gifts WHERE user_id = demo_uid);
  DELETE FROM holiday_recipients WHERE holiday_id IN (SELECT id FROM holidays WHERE user_id = demo_uid);
  DELETE FROM gifts WHERE user_id = demo_uid;
  DELETE FROM occasions WHERE user_id = demo_uid;
  DELETE FROM products WHERE user_id = demo_uid;
  DELETE FROM recipients WHERE user_id = demo_uid;
  DELETE FROM holidays WHERE user_id = demo_uid;

  -- Recipients
  INSERT INTO recipients (id, user_id, name, emoji, group_tag, budget, gift_prompt) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000001', demo_uid, 'Luke', '👦', 'Family', 75, 'Loves cooking, coffee, and outdoor gear.'),
    ('aaaaaaaa-dddd-0000-0000-000000000002', demo_uid, 'Mom', '👩', 'Family', 100, 'Enjoys gardening, reading, and cozy home things.'),
    ('aaaaaaaa-dddd-0000-0000-000000000003', demo_uid, 'Lucky', '🐶', 'Pets', 30, 'Energetic dog who loves toys and treats.'),
    ('aaaaaaaa-dddd-0000-0000-000000000004', demo_uid, 'Arden', '👧', 'Friends', 60, 'Into art, stationery, and indie music.');

  -- Products (every product has a real link + photo so the demo shows thumbnails)
  INSERT INTO products (id, user_id, name, price, link, photo_url, description) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000011', demo_uid, 'Rocker Garlic Press', 14.99,
      'https://www.amazon.com/Zulay-Kitchen-Stainless-Garlic-Rocker/dp/B0FWTX6TKY/',
      'https://m.media-amazon.com/images/I/81riZdj84nL._AC_SL1500_.jpg',
      'Stainless steel rocker-style press — no peeling needed.'),
    ('aaaaaaaa-dddd-0000-0000-000000000012', demo_uid, 'Ember Mug', 99.95,
      'https://www.amazon.com/dp/B07NQPYGYD/',
      'https://m.media-amazon.com/images/I/41LylpkJX2L._AC_SL1500_.jpg',
      'Temperature-controlled mug, keeps coffee at exactly the right temp.'),
    ('aaaaaaaa-dddd-0000-0000-000000000013', demo_uid, 'Kindle Paperwhite', 139.99,
      'https://www.amazon.com/dp/B0CFPJYX7P/',
      'https://m.media-amazon.com/images/I/71YwNBmu+aL._AC_SL1500_.jpg',
      'Waterproof, glare-free screen, weeks of battery life.'),
    ('aaaaaaaa-dddd-0000-0000-000000000014', demo_uid, 'Milk-Bone Biscuits', 12.49,
      'https://www.amazon.com/dp/B000I82DTU/',
      'https://m.media-amazon.com/images/I/81IfJLJtCDL._AC_SL1500_.jpg',
      'Classic dog treat, bulk box.'),
    ('aaaaaaaa-dddd-0000-0000-000000000015', demo_uid, 'Leuchtturm Notebook', 24.00,
      'https://www.amazon.com/dp/B0095FFUM4/',
      'https://m.media-amazon.com/images/I/512HJgPlChL._AC_SL1181_.jpg',
      'Dotted hardcover, beloved by journalers.');

  -- Holidays
  INSERT INTO holidays (id, user_id, name, icon, date_logic, is_system) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000021', demo_uid, 'Christmas', '🎄', '{"type":"fixed","month":12,"day":25}', false),
    ('aaaaaaaa-dddd-0000-0000-000000000022', demo_uid, 'Birthday — Luke', '🎂', '{"type":"fixed","month":3,"day":14}', false),
    ('aaaaaaaa-dddd-0000-0000-000000000023', demo_uid, 'Birthday — Mom', '🎂', '{"type":"fixed","month":7,"day":22}', false);

  -- Holiday recipients
  INSERT INTO holiday_recipients (holiday_id, recipient_id) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000021', 'aaaaaaaa-dddd-0000-0000-000000000001'),
    ('aaaaaaaa-dddd-0000-0000-000000000021', 'aaaaaaaa-dddd-0000-0000-000000000002'),
    ('aaaaaaaa-dddd-0000-0000-000000000021', 'aaaaaaaa-dddd-0000-0000-000000000003'),
    ('aaaaaaaa-dddd-0000-0000-000000000021', 'aaaaaaaa-dddd-0000-0000-000000000004'),
    ('aaaaaaaa-dddd-0000-0000-000000000022', 'aaaaaaaa-dddd-0000-0000-000000000001'),
    ('aaaaaaaa-dddd-0000-0000-000000000023', 'aaaaaaaa-dddd-0000-0000-000000000002');

  -- Occasions
  INSERT INTO occasions (id, user_id, holiday_id, date, name) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000031', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000021', '2025-12-25', 'Christmas 2025'),
    ('aaaaaaaa-dddd-0000-0000-000000000032', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000021', '2026-12-25', 'Christmas 2026'),
    ('aaaaaaaa-dddd-0000-0000-000000000033', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000021', '2027-12-25', 'Christmas 2027'),
    ('aaaaaaaa-dddd-0000-0000-000000000034', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000022', '2025-03-14', 'Birthday — Luke 2025'),
    ('aaaaaaaa-dddd-0000-0000-000000000035', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000022', '2026-03-14', 'Birthday — Luke 2026'),
    ('aaaaaaaa-dddd-0000-0000-000000000036', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000022', '2027-03-14', 'Birthday — Luke 2027'),
    ('aaaaaaaa-dddd-0000-0000-000000000037', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000023', '2025-07-22', 'Birthday — Mom 2025'),
    ('aaaaaaaa-dddd-0000-0000-000000000038', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000023', '2026-07-22', 'Birthday — Mom 2026'),
    ('aaaaaaaa-dddd-0000-0000-000000000039', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000023', '2027-07-22', 'Birthday — Mom 2027');

  -- Gifts
  INSERT INTO gifts (id, user_id, occasion_id, name, physical_status) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000041', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000034', 'Garlic press for Luke', 'purchased'),
    ('aaaaaaaa-dddd-0000-0000-000000000042', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000034', 'Coffee mug for Luke', 'idea'),
    ('aaaaaaaa-dddd-0000-0000-000000000043', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000037', 'Kindle for Mom', 'wrapped'),
    ('aaaaaaaa-dddd-0000-0000-000000000044', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000031', 'Treats for Lucky', 'idea'),
    ('aaaaaaaa-dddd-0000-0000-000000000045', demo_uid, 'aaaaaaaa-dddd-0000-0000-000000000031', 'Notebook for Arden', 'idea');

  -- Gift recipients
  INSERT INTO gift_recipients (gift_id, recipient_id) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000041', 'aaaaaaaa-dddd-0000-0000-000000000001'),
    ('aaaaaaaa-dddd-0000-0000-000000000042', 'aaaaaaaa-dddd-0000-0000-000000000001'),
    ('aaaaaaaa-dddd-0000-0000-000000000043', 'aaaaaaaa-dddd-0000-0000-000000000002'),
    ('aaaaaaaa-dddd-0000-0000-000000000044', 'aaaaaaaa-dddd-0000-0000-000000000003'),
    ('aaaaaaaa-dddd-0000-0000-000000000045', 'aaaaaaaa-dddd-0000-0000-000000000004');

  -- Gift products
  INSERT INTO gift_products (gift_id, product_id) VALUES
    ('aaaaaaaa-dddd-0000-0000-000000000041', 'aaaaaaaa-dddd-0000-0000-000000000011'),
    ('aaaaaaaa-dddd-0000-0000-000000000042', 'aaaaaaaa-dddd-0000-0000-000000000012'),
    ('aaaaaaaa-dddd-0000-0000-000000000043', 'aaaaaaaa-dddd-0000-0000-000000000013'),
    ('aaaaaaaa-dddd-0000-0000-000000000044', 'aaaaaaaa-dddd-0000-0000-000000000014'),
    ('aaaaaaaa-dddd-0000-0000-000000000045', 'aaaaaaaa-dddd-0000-0000-000000000015');
END;
$function$;
