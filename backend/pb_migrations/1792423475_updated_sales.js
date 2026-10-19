/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")

  // add field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select3241110846",
    "maxSelect": 0,
    "name": "order_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "dine_in",
      "takeaway"
    ]
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number3772865661",
    "max": null,
    "min": null,
    "name": "discount_amount",
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
    "id": "number182082401",
    "max": null,
    "min": null,
    "name": "received_amount",
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
    "id": "number2257624530",
    "max": null,
    "min": null,
    "name": "change_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3008659311",
    "help": "",
    "hidden": false,
    "id": "relation4129918790",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "table",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "select2069996022",
    "maxSelect": 0,
    "name": "payment_method",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "cash",
      "kpay",
      "wavepay",
      "banking",
      "digital"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")

  // remove field
  collection.fields.removeById("select3241110846")

  // remove field
  collection.fields.removeById("number3772865661")

  // remove field
  collection.fields.removeById("number182082401")

  // remove field
  collection.fields.removeById("number2257624530")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3008659311",
    "help": "",
    "hidden": false,
    "id": "relation4129918790",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "table",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select2069996022",
    "maxSelect": 0,
    "name": "payment_method",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "cash",
      "digital"
    ]
  }))

  return app.save(collection)
})
