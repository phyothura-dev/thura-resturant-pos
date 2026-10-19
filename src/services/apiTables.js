import { pb } from './pocketbase';

export async function getTables() {
  try {
    const data = await pb.collection('tables').getFullList({
      sort: 'table_number',
    });
    return data;
  } catch (error) {
    throw new Error('Tables could not be loaded: ' + error.message);
  }
}

export async function setTableOccupied(tableId, isOccupied) {
  try {
    const data = await pb.collection('tables').update(tableId, {
      is_occupied: isOccupied,
    });
    return data;
  } catch (error) {
    throw new Error('Table status could not be updated: ' + error.message);
  }
}
