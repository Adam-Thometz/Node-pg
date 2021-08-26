/** Routes for companies */

const express = require("express");
const ExpressError = require('../expressError')
const router = express.Router();
const db = require('../db')

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
    const resultComp = await db.query('SELECT * FROM companies WHERE code = $1', [code])
    if (resultComp.rows.length === 0) throw new ExpressError(`No company with code: ${code}`, 404)

    const resultInv = await db.query('SELECT * FROM invoices WHERE comp_code = $1', [resultComp.rows[0].code])
    if (resultComp.rows.length === 0) throw new ExpressError(`Invoice for company not found`, 404)
    
    const company = resultComp.rows[0]
    const invoices = resultInv.rows

    company.invoices = invoices.map(inv => inv.id)

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
    if (results.rows.length === 0) throw new ExpressError(`No company with code: ${code}`, 404)
    return res.json({msg: 'Deleted company'})
  } catch (e) {
    return next(e)
  }
})

module.exports = router;