import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

const autodateFields = [
  { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
  { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
];

async function setup() {
  try {
    console.log('Connecting as superuser...');
    await pb.collection('_superusers').authWithPassword('admin@pos.com', '1234567890');
    console.log('Superuser authenticated successfully.');

    // users collection
    const usersCollection = await pb.collections.getOne('users');
    const existingUserFields = usersCollection.fields || usersCollection.schema || [];
    const hasRole = existingUserFields.some((f) => f.name === 'role');
    const hasName = existingUserFields.some((f) => f.name === 'name');

    const updatedFields = [...existingUserFields];
    if (!hasName) {
      updatedFields.push({
        name: 'name',
        type: 'text',
        required: false,
      });
    }
    if (!hasRole) {
      updatedFields.push({
        name: 'role',
        type: 'select',
        required: false,
        values: ['admin', 'staff'],
      });
    }

    await pb.collections.update('users', {
      fields: updatedFields,
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    });
    console.log('Updated `users` collection.');

    // upsert collection
    async function upsertCollection(name, data) {
      try {
        const existing = await pb.collections.getOne(name);
        const mergedFields = [...data.fields];
        for (const adf of autodateFields) {
          if (!mergedFields.some((f) => f.name === adf.name)) {
            mergedFields.push(adf);
          }
        }
        await pb.collections.update(existing.id, { ...data, fields: mergedFields });
        console.log(`Updated collection: ${name}`);
        return await pb.collections.getOne(name);
      } catch {
        const fields = [...data.fields, ...autodateFields];
        const created = await pb.collections.create({ name, ...data, fields });
        console.log(`Created collection: ${name}`);
        return created;
      }
    }

    // tables collection
    const tablesCol = await upsertCollection('tables', {
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'table_number', type: 'number', required: true },
        { name: 'is_occupied', type: 'bool', required: false },
      ],
    });

    // categories collection
    const categoriesCol = await upsertCollection('categories', {
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'name', type: 'text', required: true },
      ],
    });

    // products collection
    const productsCol = await upsertCollection('products', {
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'category', type: 'relation', collectionId: categoriesCol.id, maxSelect: 1, required: false },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          thumbs: ['100x100', '300x300', '400x300'],
          required: false,
        },
      ],
    });

    // sales collection
    const salesCol = await upsertCollection('sales', {
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'table', type: 'relation', collectionId: tablesCol.id, maxSelect: 1, required: false },
        { name: 'order_type', type: 'select', values: ['dine_in', 'takeaway'], required: false },
        { name: 'total_amount', type: 'number', required: true },
        { name: 'status', type: 'select', values: ['pending', 'completed', 'cancelled'], required: true },
        { name: 'payment_method', type: 'select', values: ['cash', 'kpay', 'wavepay', 'banking', 'digital'], required: false },
        { name: 'discount_amount', type: 'number', required: false },
        { name: 'received_amount', type: 'number', required: false },
        { name: 'change_amount', type: 'number', required: false },
        { name: 'kitchen_status', type: 'select', values: ['sent', 'preparing', 'ready', 'served'], required: false },
        { name: 'kitchen_sent_at', type: 'date', required: false },
        { name: 'cancellation_reason', type: 'text', required: false },
        { name: 'cancelled_by', type: 'text', required: false },
        { name: 'cancelled_at', type: 'date', required: false },
      ],
    });

    // sale_items collection
    await upsertCollection('sale_items', {
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        { name: 'sale', type: 'relation', collectionId: salesCol.id, maxSelect: 1, required: true, cascadeDelete: true },
        { name: 'product', type: 'relation', collectionId: productsCol.id, maxSelect: 1, required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'notes', type: 'text', required: false },
      ],
    });

    await upsertCollection('daily_closings', {
      type: 'base',
      listRule: '@request.auth.role = "admin"',
      viewRule: '@request.auth.role = "admin"',
      createRule: '@request.auth.role = "admin"',
      updateRule: null,
      deleteRule: null,
      indexes: ['CREATE UNIQUE INDEX idx_daily_closings_business_date ON daily_closings (business_date)'],
      fields: [
        { name: 'business_date', type: 'text', required: true, min: 10, max: 10 },
        { name: 'sales_count', type: 'number', required: true },
        { name: 'cancelled_count', type: 'number', required: false },
        { name: 'total_sales', type: 'number', required: true },
        { name: 'cash_sales', type: 'number', required: true },
        { name: 'kpay_sales', type: 'number', required: false },
        { name: 'wavepay_sales', type: 'number', required: false },
        { name: 'banking_sales', type: 'number', required: false },
        { name: 'other_digital_sales', type: 'number', required: false },
        { name: 'expected_cash', type: 'number', required: true },
        { name: 'counted_cash', type: 'number', required: true },
        { name: 'cash_difference', type: 'number', required: true },
        { name: 'closed_by', type: 'text', required: true },
      ],
    });

    // seed data
    console.log('Seeding initial data...');

    // seed tables
    const existingTables = await pb.collection('tables').getFullList();
    if (existingTables.length === 0) {
      for (let i = 1; i <= 10; i++) {
        await pb.collection('tables').create({
          table_number: i,
          is_occupied: false,
        });
      }
      console.log('Created 10 tables.');
    }

    // seed categories
    const existingCats = await pb.collection('categories').getFullList();
    let catFood = existingCats.find((c) => c.name === 'အစားအစာ');
    let catDrink = existingCats.find((c) => c.name === 'အအေးနှင့် ဖျော်ရည်');
    if (!catFood) {
      catFood = await pb.collection('categories').create({ name: 'အစားအစာ' });
    }
    if (!catDrink) {
      catDrink = await pb.collection('categories').create({ name: 'အအေးနှင့် ဖျော်ရည်' });
    }

    // seed products
    const existingProducts = await pb.collection('products').getFullList();
    if (existingProducts.length === 0) {
      await pb.collection('products').create({
        name: 'ကြက်သားကြော် ထမင်း',
        price: 4500,
        category: catFood.id,
      });
      await pb.collection('products').create({
        name: 'ဝက်သားကြော် ထမင်း',
        price: 5000,
        category: catFood.id,
      });
      await pb.collection('products').create({
        name: 'ကြက်ဆီထမင်း',
        price: 4000,
        category: catFood.id,
      });
      await pb.collection('products').create({
        name: 'လက်ဖက်ရည်',
        price: 1500,
        category: catDrink.id,
      });
      await pb.collection('products').create({
        name: 'သံပုရာရည်',
        price: 2000,
        category: catDrink.id,
      });
      console.log('Created sample products.');
    }

    // seed users
    const existingUsers = await pb.collection('users').getFullList();
    const adminUser = existingUsers.find((u) => u.email === 'admin@pos.com');
    if (!adminUser) {
      await pb.collection('users').create({
        email: 'admin@pos.com',
        password: 'admin12345',
        passwordConfirm: 'admin12345',
        name: 'Admin သူရ',
        role: 'admin',
        emailVisibility: true,
      });
      console.log('Created admin user: admin@pos.com / admin12345');
    }
    const staffUser = existingUsers.find((u) => u.email === 'staff@pos.com');
    if (!staffUser) {
      await pb.collection('users').create({
        email: 'staff@pos.com',
        password: 'staff12345',
        passwordConfirm: 'staff12345',
        name: 'Staff မောင်မောင်',
        role: 'staff',
        emailVisibility: true,
      });
      console.log('Created staff user: staff@pos.com / staff12345');
    }

    console.log('PocketBase setup completed successfully!');
  } catch (err) {
    console.error('PocketBase setup error:', err);
    process.exit(1);
  }
}

setup();
