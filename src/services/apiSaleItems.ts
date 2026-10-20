import { pb } from './pocketbase';

export async function upsertSaleItems(saleId, items) {
  try {
    // Fetch all existing sale items for this sale
    let existingList = [];
    try {
      existingList = await pb.collection('sale_items').getFullList({
        filter: `sale = "${saleId}"`,
      });
    } catch {
      existingList = [];
    }

    const currentProductIds = new Set(items.map((i) => i.id));

    // Delete items that were removed from the cart
    for (const ex of existingList) {
      if (!currentProductIds.has(ex.product)) {
        await pb.collection('sale_items').delete(ex.id);
      }
    }

    // Upsert items
    for (const item of items) {
      const existing = existingList.find((ex) => ex.product === item.id);
      if (existing) {
        await pb.collection('sale_items').update(existing.id, {
          quantity: item.quantity,
          notes: item.notes || '',
        });
      } else {
        await pb.collection('sale_items').create({
          sale: saleId,
          product: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
        });
      }
    }
  } catch (error) {
    throw new Error('Sale items could not be updated: ' + error.message);
  }
}

export async function insertSaleItems(saleId, items) {
  try {
    for (const item of items) {
      await pb.collection('sale_items').create({
        sale: saleId,
        product: item.id,
        quantity: item.quantity,
        notes: item.notes || '',
      });
    }
  } catch (error) {
    throw new Error('Sale items could not be created: ' + error.message);
  }
}

export async function deleteSaleItem(saleItemId) {
  try {
    await pb.collection('sale_items').delete(saleItemId);
  } catch (error) {
    throw new Error('Sale item could not be removed: ' + error.message);
  }
}
