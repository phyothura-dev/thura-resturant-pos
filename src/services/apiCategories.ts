import { pb } from './pocketbase';

export async function getCategories() {
  try {
    const data = await pb.collection('categories').getFullList({
      sort: 'name',
    });
    return data;
  } catch (error) {
    throw new Error('Categories could not be loaded: ' + error.message);
  }
}

export async function createCategory(name) {
  try {
    const data = await pb.collection('categories').create({ name });
    return data;
  } catch (error) {
    throw new Error('Category could not be created: ' + error.message);
  }
}

export async function updateCategory({ id, name }) {
  try {
    const data = await pb.collection('categories').update(id, { name });
    return data;
  } catch (error) {
    throw new Error('Category could not be updated: ' + error.message);
  }
}

export async function deleteCategory(id) {
  try {
    const data = await pb.collection('categories').delete(id);
    return data;
  } catch (error) {
    throw new Error('Category could not be deleted: ' + error.message);
  }
}
