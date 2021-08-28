\c biztime_test

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS industries_companies;

CREATE TABLE companies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid BOOLEAN DEFAULT false NOT NULL,
  add_date DATE DEFAULT CURRENT_DATE NOT NULL,
  paid_date DATE,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code TEXT PRIMARY KEY,
  industry TEXT NOT NULL
);

CREATE TABLE industries_companies (
  industry_code TEXT NOT NULL REFERENCES industries ON DELETE CASCADE,
  company_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  PRIMARY KEY (industry_code, company_code)
);

-- INSERT INTO companies
--   VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
--          ('ibm', 'IBM', 'Big blue.');

-- INSERT INTO invoices (comp_Code, amt, paid, paid_date)
--   VALUES ('apple', 100, false, null),
--          ('apple', 200, false, null),
--          ('apple', 300, true, '2018-01-01'),
--          ('ibm', 400, false, null);

-- INSERT INTO industries
--   VALUES ('tech', 'Technology'),
--          ('mobile', 'Mobile Development'),
--          ('ai', 'Artificial Intelligence');

-- INSERT INTO industries_companies
--   VALUES ('tech', 'apple'),
--          ('tech', 'ibm'),
--          ('mobile', 'apple'),
--          ('ai', 'ibm');