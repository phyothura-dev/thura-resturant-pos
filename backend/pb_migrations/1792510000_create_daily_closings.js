/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "name": "daily_closings",
    "type": "base",
    "listRule": "@request.auth.role = \"admin\"",
    "viewRule": "@request.auth.role = \"admin\"",
    "createRule": "@request.auth.role = \"admin\"",
    "updateRule": null,
    "deleteRule": null,
    "fields": [
      new Field({ "id": "dcbizdate", "name": "business_date", "type": "text", "required": true, "min": 10, "max": 10 }),
      new Field({ "id": "dcsalescount", "name": "sales_count", "type": "number", "required": true }),
      new Field({ "id": "dccancelcount", "name": "cancelled_count", "type": "number", "required": false }),
      new Field({ "id": "dctotalsales", "name": "total_sales", "type": "number", "required": true }),
      new Field({ "id": "dccashsales", "name": "cash_sales", "type": "number", "required": true }),
      new Field({ "id": "dckpaysales", "name": "kpay_sales", "type": "number", "required": false }),
      new Field({ "id": "dcwavepaysales", "name": "wavepay_sales", "type": "number", "required": false }),
      new Field({ "id": "dcbanksales", "name": "banking_sales", "type": "number", "required": false }),
      new Field({ "id": "dcotherdigital", "name": "other_digital_sales", "type": "number", "required": false }),
      new Field({ "id": "dcexpectedcash", "name": "expected_cash", "type": "number", "required": true }),
      new Field({ "id": "dccountedcash", "name": "counted_cash", "type": "number", "required": true }),
      new Field({ "id": "dccashdiff", "name": "cash_difference", "type": "number", "required": true }),
      new Field({ "id": "dcclosedby", "name": "closed_by", "type": "text", "required": true })
    ],
    "indexes": ["CREATE UNIQUE INDEX idx_daily_closings_business_date ON daily_closings (business_date)"]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("daily_closings")
  return app.delete(collection)
})
