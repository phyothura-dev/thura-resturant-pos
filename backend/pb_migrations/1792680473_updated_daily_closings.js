/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1253267510")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX idx_daily_closings_business_date ON daily_closings (business_date)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text4194645367",
    "max": 10,
    "min": 10,
    "name": "business_date",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "number1939731924",
    "max": null,
    "min": null,
    "name": "sales_count",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number927287668",
    "max": null,
    "min": null,
    "name": "cancelled_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number2834556534",
    "max": null,
    "min": null,
    "name": "total_sales",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number1488972648",
    "max": null,
    "min": null,
    "name": "cash_sales",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number266624130",
    "max": null,
    "min": null,
    "name": "kpay_sales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "number2671018190",
    "max": null,
    "min": null,
    "name": "wavepay_sales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number3527573807",
    "max": null,
    "min": null,
    "name": "banking_sales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "number3149707714",
    "max": null,
    "min": null,
    "name": "other_digital_sales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "number1839410104",
    "max": null,
    "min": null,
    "name": "expected_cash",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "number2629557592",
    "max": null,
    "min": null,
    "name": "counted_cash",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "help": "",
    "hidden": false,
    "id": "number1742226308",
    "max": null,
    "min": null,
    "name": "cash_difference",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text143617537",
    "max": 0,
    "min": 0,
    "name": "closed_by",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "autodate2990389176",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "autodate3332085495",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1253267510")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // remove field
  collection.fields.removeById("text4194645367")

  // remove field
  collection.fields.removeById("number1939731924")

  // remove field
  collection.fields.removeById("number927287668")

  // remove field
  collection.fields.removeById("number2834556534")

  // remove field
  collection.fields.removeById("number1488972648")

  // remove field
  collection.fields.removeById("number266624130")

  // remove field
  collection.fields.removeById("number2671018190")

  // remove field
  collection.fields.removeById("number3527573807")

  // remove field
  collection.fields.removeById("number3149707714")

  // remove field
  collection.fields.removeById("number1839410104")

  // remove field
  collection.fields.removeById("number2629557592")

  // remove field
  collection.fields.removeById("number1742226308")

  // remove field
  collection.fields.removeById("text143617537")

  // remove field
  collection.fields.removeById("autodate2990389176")

  // remove field
  collection.fields.removeById("autodate3332085495")

  return app.save(collection)
})
