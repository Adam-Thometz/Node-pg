/** Routes for invoices */

const express = require("express");
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    // debugger
    const results = await db.query(`SELECT id, comp_code FROM invoices`)
    return res.json({invoices: results.rows})
  } catch (e) {
    return next(e)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    debugger
    const resultInv = await db.query(`SELECT * FROM invoices WHERE id = $1`, [parseInt(id)])
    if (resultInv.rows.length === 0) throw new ExpressError(`No invoice with id: ${id}`, 404)

    const resultComp = await db.query(`SELECT * FROM companies WHERE code = $1`, [resultInv.rows[0].comp_code])
    if (resultComp.rows.length === 0) throw new ExpressError(`Company for invoice not found`, 404)
    
    const {amt, paid, add_date, paid_date} = resultInv.rows[0]
    const {code, name, description} = resultComp.rows[0]
    
    return res.json({
      invoice: {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company: {
          code,
          name,
          description
        }
      }
    })
  } catch (e) {
    return next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const {comp_code, amt} = req.body;
    const result = await db.query(`
      INSERT INTO invoices (comp_code, amt, paid_date)
      VALUES ($1, $2, null)
      RETURNING *
    `, [comp_code, amt]);

    return res.status(201).json({invoice: result.rows[0]});
  } catch (e) {
    return next(e);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const {amt, paid} = req.body;
    let result;
    if (paid === true) {
      result = await db.query(`UPDATE invoices SET amt=$1, paid=true WHERE id=$2 RETURNING *`, [amt, id]);
    } else if (paid === false) {
      result = await db.query(`UPDATE invoices SET amt=$1, paid=false, paid_date=null WHERE id=$2 RETURNING *`, [amt, id]);
    } else {
      result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id]);
    }
    if (result.rows.length === 0) throw new ExpressError(`No invoice with id: ${id}`, 404);
    return res.json({invoice: result.rows[0]});
  } catch (e) {
    return next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
    if (result.rows.length === 0) throw new ExpressError(`No invoice with id: ${id}`, 404);
    return res.send({msg: 'Deleted invoice'});
  } catch (e) {
    return next(e);
  }
})

module.exports = router;