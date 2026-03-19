INSERT INTO public.suppliers (
  supplier_code, 
  supplier_name, 
  email_primary, 
  email_secondary, 
  email_escalation, 
  contact_person, 
  contact_number, 
  country_of_origin, 
  shipping_location
) VALUES
('SUP001', 'Alpha Tech Components', 'contact@alphatech.com', 'sales@alphatech.com', 'escalation@alphatech.com', 'Rahul Mehta', '9876543210', 'India', 'Bangalore'),
('SUP002', 'Global Industrial Supplies', 'info@globalind.com', 'support@globalind.com', 'escalation@globalind.com', 'Anita Sharma', '9123456780', 'India', 'Mumbai'),
('SUP003', 'NextGen Electronics', 'hello@nextgenelec.com', 'sales@nextgenelec.com', 'escalation@nextgenelec.com', 'David Wilson', '9988776655', 'USA', 'New York'),
('SUP004', 'Prime Steel Industries', 'contact@primesteel.com', 'support@primesteel.com', 'escalation@primesteel.com', 'Arjun Reddy', '9012345678', 'India', 'Hyderabad'),
('SUP005', 'Zenith Packaging Ltd', 'info@zenithpack.com', 'sales@zenithpack.com', 'escalation@zenithpack.com', 'Pooja Nair', '9090909090', 'India', 'Kochi'),
('SUP006', 'Vertex Automotive Parts', 'contact@vertexauto.com', 'support@vertexauto.com', 'escalation@vertexauto.com', 'Rohit Verma', '9345678901', 'India', 'Chennai'),
('SUP007', 'BlueWave Chemicals', 'info@bluewavechem.com', 'sales@bluewavechem.com', 'escalation@bluewavechem.com', 'Sneha Iyer', '9871234560', 'India', 'Pune'),
('SUP008', 'Orion Textiles Pvt Ltd', 'contact@oriontextiles.com', 'support@oriontextiles.com', 'escalation@oriontextiles.com', 'Manoj Kumar', '9786543210', 'India', 'Tiruppur'),
('SUP009', 'Evergreen Agro Products', 'info@evergreenagro.com', 'sales@evergreenagro.com', 'escalation@evergreenagro.com', 'Sunita Patel', '9654321780', 'India', 'Ahmedabad'),
('SUP010', 'Delta Logistics Solutions', 'contact@deltalogistics.com', 'support@deltalogistics.com', 'escalation@deltalogistics.com', 'Vikram Singh', '9567890123', 'India', 'Delhi')
ON CONFLICT (supplier_code) DO NOTHING;
