import { pb } from './pocketbase';

function formatUser(u) {
  return {
    ...u,
    full_name: u.name || '',
    role: u.role || 'staff',
  };
}

export async function getUsers() {
  try {
    const data = await pb.collection('users').getFullList({
      sort: '-created',
    });
    return data.map(formatUser);
  } catch (error) {
    throw new Error('Users could not be loaded: ' + error.message);
  }
}

export async function createUser({ full_name, email, password, role }) {
  try {
    const data = await pb.collection('users').create({
      name: full_name,
      email,
      password,
      passwordConfirm: password,
      role: role || 'staff',
      emailVisibility: true,
    });
    return formatUser(data);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateUser({ id, full_name, role }) {
  try {
    const data = await pb.collection('users').update(id, {
      name: full_name,
      role: role || 'staff',
    });
    return formatUser(data);
  } catch (error) {
    throw new Error('User could not be updated: ' + error.message);
  }
}

export async function deleteUser(id) {
  try {
    const data = await pb.collection('users').delete(id);
    return data;
  } catch (error) {
    throw new Error('User could not be deleted: ' + error.message);
  }
}
