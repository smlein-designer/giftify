-- Product photo uploads go to the "product-photos" bucket (see ProductForm.jsx
-- and the storage upload/delete policies). The bucket had been created as
-- "product-photo", so every upload failed. This creates the correctly named one.
-- The old, empty "product-photo" bucket is left in place and unused.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;
