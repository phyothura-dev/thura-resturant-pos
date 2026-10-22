import { pb } from './pocketbase';
import { insertSaleItems, upsertSaleItems } from './apiSaleItems';
import { setTableOccupied } from './apiTables';

export async function getPendingSaleByTable(tableId) {
  if (!tableId || tableId === 'takeaway') return null;

  try {
    const sale = await pb
      .collection('sales')
      .getFirstListItem(`table = "${tableId}" && status = "pending"`);

    if (!sale) return null;

    const saleItems = await pb.collection('sale_items').getFullList({
      filter: `sale = "${sale.id}"`,
      expand: 'product',
    });

    const formattedSaleItems = saleItems.map((si) => ({
      id: si.id,
      product_id: si.product,
      quantity: si.quantity,
      notes: si.notes || '',
      products: si.expand?.product
        ? {
            id: si.expand.product.id,
            name: si.expand.product.name,
            price: si.expand.product.price,
            image_url: si.expand.product.image_url,
          }
        : null,
    }));

    return {
      ...sale,
      sale_items: formattedSaleItems,
    };
  } catch (error) {
    if (error.status === 404) return null;
    throw new Error('Could not fetch pending sale: ' + error.message);
  }
}

export async function getPendingSaleById(saleId) {
  if (!saleId) return null;

  try {
    const sale = await pb.collection('sales').getOne(saleId, {
      expand: 'table',
    });

    if (!sale || sale.status !== 'pending') return null;

    const saleItems = await pb.collection('sale_items').getFullList({
      filter: `sale = "${sale.id}"`,
      expand: 'product',
    });

    const formattedSaleItems = saleItems.map((si) => ({
      id: si.id,
      product_id: si.product,
      quantity: si.quantity,
      notes: si.notes || '',
      products: si.expand?.product
        ? {
            id: si.expand.product.id,
            name: si.expand.product.name,
            price: si.expand.product.price,
            image_url: si.expand.product.image_url,
          }
        : null,
    }));

    return {
      ...sale,
      sale_items: formattedSaleItems,
    };
  } catch (error) {
    if (error.status === 404) return null;
    throw new Error('Could not fetch pending sale: ' + error.message);
  }
}

export async function getPendingTakeawaySales() {
  try {
    const records = await pb.collection('sales').getFullList({
      filter: 'order_type = "takeaway" && status = "pending"',
      sort: '-created',
      expand: 'sale_items_via_sale.product',
    });
    return records;
  } catch (error) {
    throw new Error('Could not fetch takeaway sales: ' + error.message);
  }
}

export async function createPendingSale({ tableId, orderType = 'dine_in', items, totalAmount, sendToKitchen = false }) {
  try {
    const isTakeaway = orderType === 'takeaway' || tableId === 'takeaway' || !tableId;
    const saleData = {
      table: isTakeaway ? null : tableId,
      order_type: isTakeaway ? 'takeaway' : 'dine_in',
      total_amount: totalAmount,
      status: 'pending',
      payment_method: 'cash',
      ...(sendToKitchen ? { kitchen_status: 'sent', kitchen_sent_at: new Date().toISOString() } : {}),
    };

    const sale = await pb.collection('sales').create(saleData);

    await insertSaleItems(sale.id, items);

    if (!isTakeaway && tableId) {
      await setTableOccupied(tableId, true);
    }

    return { ...sale, items };
  } catch (error) {
    throw new Error('Sale could not be created: ' + error.message);
  }
}

export async function updatePendingSale({ saleId, items, totalAmount, sendToKitchen = false }) {
  try {
    await pb.collection('sales').update(saleId, {
      total_amount: totalAmount,
      ...(sendToKitchen ? { kitchen_status: 'sent', kitchen_sent_at: new Date().toISOString() } : {}),
    });

    await upsertSaleItems(saleId, items);
  } catch (error) {
    throw new Error('Sale total could not be updated: ' + error.message);
  }
}

export async function getKitchenOrders() {
  const records = await pb.collection('sales').getFullList({
    filter: 'status = "pending"',
    sort: 'created',
    expand: 'table,sale_items_via_sale.product',
  });

  return records
    .filter((sale) => (sale.kitchen_status || 'sent') !== 'served')
    .map((sale) => ({
      ...sale,
      kitchen_status: sale.kitchen_status || 'sent',
      items: (sale.expand?.sale_items_via_sale || []).map((item) => ({
        id: item.id,
        name: item.expand?.product?.name || 'ပစ္စည်းမရှိတော့ပါ',
        quantity: item.quantity,
        notes: item.notes || '',
      })),
    }));
}

export async function updateKitchenOrderStatus(saleId, kitchenStatus) {
  return pb.collection('sales').update(saleId, { kitchen_status: kitchenStatus });
}

export async function cancelPendingSale({ saleId, tableId, reason, cancelledBy }) {
  const sale = await pb.collection('sales').update(saleId, {
    status: 'cancelled',
    cancellation_reason: reason.trim(),
    cancelled_by: cancelledBy || 'ဝန်ထမ်း',
    cancelled_at: new Date().toISOString(),
  });

  if (tableId && tableId !== 'takeaway') {
    await setTableOccupied(tableId, false);
  }

  return sale;
}

export async function completeSale({
  saleId,
  tableId,
  totalAmount,
  paymentMethod = 'cash',
  discountAmount = 0,
  receivedAmount = 0,
  changeAmount = 0,
}) {
  try {
    const sale = await pb.collection('sales').update(saleId, {
      status: 'completed',
      total_amount: totalAmount,
      payment_method: paymentMethod,
      discount_amount: discountAmount,
      received_amount: receivedAmount,
      change_amount: changeAmount,
    });

    if (tableId && tableId !== 'takeaway') {
      await setTableOccupied(tableId, false);
    }

    return sale;
  } catch (error) {
    throw new Error('Sale could not be completed: ' + error.message);
  }
}

export async function moveTable({ fromTableId, toTableId, saleId }) {
  try {
    await pb.collection('sales').update(saleId, {
      table: toTableId,
    });

    if (fromTableId) {
      await setTableOccupied(fromTableId, false);
    }
    if (toTableId) {
      await setTableOccupied(toTableId, true);
    }

    return true;
  } catch (error) {
    throw new Error('Table could not be moved: ' + error.message);
  }
}

export async function mergeTables({ fromTableId, toTableId, fromSaleId, toSaleId }) {
  try {
    const sourceItems = await pb.collection('sale_items').getFullList({
      filter: `sale = "${fromSaleId}"`,
    });

    for (const item of sourceItems) {
      await pb.collection('sale_items').update(item.id, {
        sale: toSaleId,
      });
    }

    const allTargetItems = await pb.collection('sale_items').getFullList({
      filter: `sale = "${toSaleId}"`,
      expand: 'product',
    });

    const newSubtotal = allTargetItems.reduce(
      (sum, item) => sum + (item.expand?.product?.price || 0) * item.quantity,
      0
    );

    await pb.collection('sales').update(toSaleId, {
      total_amount: newSubtotal,
    });

    await pb.collection('sales').update(fromSaleId, {
      status: 'cancelled',
      cancellation_reason: 'စားပွဲသို့ ပေါင်းစည်းထားပါသည်',
      cancelled_by: 'စနစ်',
      cancelled_at: new Date().toISOString(),
    });

    if (fromTableId && fromTableId !== 'takeaway') {
      await setTableOccupied(fromTableId, false);
    }

    return true;
  } catch (error) {
    throw new Error('Table could not be merged: ' + error.message);
  }
}
