// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/admin/user/getUserInfo', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/admin/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function getUserList(options?: { [key: string]: any }) {
  // @ts-ignore
  const { page = 1, pageSize = 10, state = 'ACTIVE', telephone } = options;

  const defaultParams = {
    state,
    pageSize: pageSize,
    currentPage: page,
    keyWord: telephone
  }

  return request('/admin/user/userList', {
    method: 'GET',
    params: defaultParams
  });
}

export async function freezeUser(body: any) {
  return request('/admin/user/freeze', {
    method: 'GET',
    params: body
  });
}

export async function unfreezeUser(body: any) {
  return request('/admin/user/unfreeze', {
    method: 'GET',
    params: body
  });
}

export async function getCollectionList(options?: { [key: string]: any }) {
  const { page, pageSize, state, keyWord } = options;
  const defaultParams = {
    state: state || null,
    pageSize: pageSize ?? 10,
    currentPage: page ?? 1,
    keyWord: keyWord,
  }

  return request('/admin/collection/collectionList', {
    method: 'GET',
    params: defaultParams
  });
}

export async function addCollection(body: any, options?: any) {
  return request('/admin/collection/createCollection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function uploadCollection(body: any, options?: any) {
  return request('/admin/collection/uploadCollection', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function removeCollection(body: any, options?: any) {
  return request('/admin/collection/removeCollection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateQuantity(body: any, options?: any) {
  return request('/admin/collection/modifyInventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updatePrice(body: any, options?: any) {
  return request('/admin/collection/modifyPrice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 藏品空投 POST /admin/collection/airDrop */
export async function airDropCollection(params: {
  collectionId: number;
  recipientUserId: string;
  quantity: number;
  bizType: string;
}) {
  return request('/admin/collection/airDrop', {
    method: 'POST',
    data: params,
  });
}

/** 获取空投记录列表 GET /admin/collection/airDropList */
export async function getAirDropList(params: {
  collectionId?: number;
  userId?: string;
  pageSize?: number;
  currentPage?: number;
}) {
  return request('/admin/collection/airDropList', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
