/** Routes for companies */

const express = require("express");
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT code, name FROM companies`)
    return res.json({companies: results.rows})
  } catch (e) {
    return next(e)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const {code} = req.params
    const companyRes = await db.query('SELECT * FROM companies WHERE code = $1', [code])
    if (companyRes.rows.length === 0) throw new ExpressError(`No company with code: ${code}`, 404)
    
    const invoiceRes = await db.query('SELECT * FROM invoices WHERE comp_code = $1', [companyRes.rows[0].code])
    
    const industryRes = await db.query(`
    SELECT i.industry
      FROM industries AS i
      LEFT JOIN industries_companies as ic
      ON i.code = ic.industry_code
      LEFT JOIN companies AS c
      ON ic.company_code = c.code
    WHERE c.code = $1
    `, [code])

    const company = companyRes.rows[0]
    const invoices = invoiceRes.rows
    const industries = industryRes.rows

    company.invoices = invoices.map(inv => inv.id)
    company.industries = industries.map(ind => ind.industry)

    return res.json({"company": company})
  } catch (e) {
    return next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const {code, name, description} = req.body
    const results = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]
    )
    return res.status(201).json({company: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    const {code} = req.params
    const {name, description} = req.body
    const results = await db.query(
      'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *', [name, description, code]
    )
    if (results.rows.length === 0) throw new ExpressError(`No company with code: ${code}`, 404)
    return res.json({company: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const {code} = req.params
    const results = await db.query(
      'DELETE FROM companies WHERE code = $1', [code]
    )
    return res.json({msg: 'Deleted company'})
  } catch (e) {
    return next(e)
  }
})

module.exports = router;