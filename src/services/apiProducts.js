import { pb } from './pocketbase';

// format product record
function formatProduct(p) {
  const imageUrl = p.image ? pb.files.getURL(p, p.image, { thumb: '400x300' }) : '';
  return {
    ...p,
    image_url: imageUrl,
    category_id: p.category,
    categories: p.expand?.category
      ? { id: p.expand.category.id, name: p.expand.category.name }
      : null,
  };
}

export async function getProducts() {
  try {
    const data = await pb.collection('products').getFullList({
      expand: 'category',
      sort: '-created',
    });
    return data.map(formatProduct);
  } catch (error) {
    try {
      const fallbackData = await pb.collection('products').getFullList({
        expand: 'category',
      });
      return fallbackData.map(formatProduct);
    } catch {
      throw new Error('Products could not be loaded: ' + error.message);
    }
  }
}

// create product with image file
export async function createProduct(newProduct) {
  try {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', String(newProduct.price));
    if (newProduct.category_id || newProduct.category) {
      formData.append('category', newProduct.category_id || newProduct.category);
    }
    if (newProduct.image instanceof File) {
      formData.append('image', newProduct.image);
    }
    const data = await pb.collection('products').create(formData, {
      expand: 'category',
    });
    return formatProduct(data);
  } catch (error) {
    throw new Error('Product could not be created: ' + error.message);
  }
}

// update product
export async function updateProduct({ id, ...updatedProduct }) {
  try {
    const formData = new FormData();
    if (updatedProduct.name !== undefined) formData.append('name', updatedProduct.name);
    if (updatedProduct.price !== undefined) formData.append('price', String(updatedProduct.price));
    const cat = updatedProduct.category_id !== undefined ? updatedProduct.category_id : updatedProduct.category;
    if (cat !== undefined) formData.append('category', cat || '');
    if (updatedProduct.image instanceof File) {
      formData.append('image', updatedProduct.image);
    } else if (updatedProduct.remove_image) {
      formData.append('image', '');
    }
    const data = await pb.collection('products').update(id, formData, {
      expand: 'category',
    });
    return formatProduct(data);
  } catch (error) {
    throw new Error('Product could not be updated: ' + error.message);
  }
}

export async function deleteProduct(id) {
  try {
    const data = await pb.collection('products').delete(id);
    return data;
  } catch (error) {
    throw new Error('Product could not be deleted: ' + error.message);
  }
}
