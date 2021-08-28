/** Routes for industries */

const express = require("express");
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT * FROM industries`
    );
    
    for (let ind of results.rows) {
      const result = await db.query(`
        SELECT c.code
          FROM companies as c
          LEFT JOIN industries_companies as ic
          ON ic.company_code = c.code
          LEFT JOIN industries as i
          ON ic.industry_code = i.code
        WHERE i.code = $1
      `, [ind.code])
      
      const companies = result.rows.map(c => c.code)
      ind.companies = companies
    }
    return res.json({industries: results.rows});
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const {code, industry} = req.body
    const results = await db.query(
      'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]
    )
    return res.status(201).json({industry: results.rows[0]})
  } catch (e) {
    return next(e)
  }
})

// this route accepts the industry code in the params and an array of companies in the body
router.post('/:ind_code', async (req, res, next) => {
  try {
    const {ind_code} = req.params
    const industryResult = await db.query(`
      SELECT * FROM industries WHERE code = $1
    `, [ind_code])

    const {company} = req.body
    const companyResult = await db.query(`
      SELECT * FROM companies WHERE name = $1
    `, [company])

    const result = await db.query(`
      INSERT INTO industries_companies (industry_code, company_code)
        VALUES ($1, $2)
    `, [ind_code, companyResult.rows[0].code])

    res.status(201).json(companyResult.rows[0])
  } catch (e) {
    next(e)
  }
})

module.exports = router;