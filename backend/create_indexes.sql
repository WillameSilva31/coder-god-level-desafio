-- Sales (tabela principal)
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(sale_status_desc);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_channel ON sales(channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);

-- Índice composto para filtros comuns
CREATE INDEX IF NOT EXISTS idx_sales_status_date ON sales(sale_status_desc, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status_store_date ON sales(sale_status_desc, store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status_channel_date ON sales(sale_status_desc, channel_id, created_at);

-- Product Sales
CREATE INDEX IF NOT EXISTS idx_product_sales_sale ON product_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_product ON product_sales(product_id);

-- Item Product Sales (customizações)
CREATE INDEX IF NOT EXISTS idx_item_product_sales_product_sale ON item_product_sales(product_sale_id);
CREATE INDEX IF NOT EXISTS idx_item_product_sales_item ON item_product_sales(item_id);

-- Delivery
CREATE INDEX IF NOT EXISTS idx_delivery_sales_sale ON delivery_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_sale ON delivery_addresses(sale_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_sale ON payments(sale_id);

-- Analyze tables to update statistics
ANALYZE sales;
ANALYZE product_sales;
ANALYZE item_product_sales;
ANALYZE delivery_sales;
ANALYZE payments;