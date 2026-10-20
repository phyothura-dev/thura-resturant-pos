/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")

  collection.fields.addAt(collection.fields.length, new Field({
    "hidden": false,
    "id": "selectkitchenstatus",
    "maxSelect": 0,
    "name": "kitchen_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["sent", "preparing", "ready", "served"]
  }))

  collection.fields.addAt(collection.fields.length, new Field({
    "hidden": false,
    "id": "textcancellationreason",
    "max": 500,
    "min": 0,
    "name": "cancellation_reason",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  collection.fields.addAt(collection.fields.length, new Field({
    "hidden": false,
    "id": "textcancelledby",
    "max": 0,
    "min": 0,
    "name": "cancelled_by",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  collection.fields.addAt(collection.fields.length, new Field({
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

  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 0,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": ["pending", "completed", "cancelled"]
  }))

  collection.fields.addAt(collection.fields.length, new Field({
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2697449135")
  collection.fields.removeById("selectkitchenstatus")
  collection.fields.removeById("datekitchensentat")
  collection.fields.removeById("textcancellationreason")
  collection.fields.removeById("textcancelledby")
  collection.fields.removeById("datecancelledat")
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 0,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": ["pending", "completed"]
  }))
  return app.save(collection)
})
