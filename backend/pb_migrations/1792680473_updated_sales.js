/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")

  // remove field
  collection.fields.removeById("selectkitchenstatus")

  // remove field
  collection.fields.removeById("textcancellationreason")

  // remove field
  collection.fields.removeById("textcancelledby")

  // remove field
  collection.fields.removeById("datecancelledat")

  // remove field
  collection.fields.removeById("datekitchensentat")

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "select2075670528",
    "maxSelect": 0,
    "name": "kitchen_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "sent",
      "preparing",
      "ready",
      "served"
    ]
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "date2196051866",
    "max": "",
    "min": "",
    "name": "kitchen_sent_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2994330062",
    "max": 0,
    "min": 0,
    "name": "cancellation_reason",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1221381883",
    "max": 0,
    "min": 0,
    "name": "cancelled_by",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "help": "",
    "hidden": false,
    "id": "date491839877",
    "max": "",
    "min": "",
    "name": "cancelled_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "selectkitchenstatus",
    "maxSelect": 0,
    "name": "kitchen_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "sent",
      "preparing",
      "ready",
      "served"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "textcancellationreason",
    "max": 500,
    "min": 0,
    "name": "cancellation_reason",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "textcancelledby",
    "max": 0,
    "min": 0,
    "name": "cancelled_by",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "datecancelledat",
    "max": "",
    "min": "",
    "name": "cancelled_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "datekitchensentat",
    "max": "",
    "min": "",
    "name": "kitchen_sent_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // remove field
  collection.fields.removeById("select2075670528")

  // remove field
  collection.fields.removeById("date2196051866")

  // remove field
  collection.fields.removeById("text2994330062")

  // remove field
  collection.fields.removeById("text1221381883")

  // remove field
  collection.fields.removeById("date491839877")

  return app.save(collection)
})
