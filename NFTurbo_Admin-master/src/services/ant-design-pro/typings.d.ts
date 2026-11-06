// @ts-ignore
/* eslint-disable */

interface IResponseWrap {
  code: number;
  message?: string;
  errorMessage?: string;
  success: boolean;
}

declare namespace API {
  type CurrentUser = {
      userId: string;
      nickName?: string;
      telephone?: string;
      state?: string;
      profilePhotoUrl?: string;
      blockChainUrl?: string;
      blockChainPlatform?: string;
      certification?: number;  
  };

  interface LoginResult extends IResponseWrap {
    data: {
      token: string;
      tokenExpiration: number;
      userId: number;
    }
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type CollectionListItem = {
    id?: number;
    classId?: string;
    cover?: string;
    createTime?: string;
    goodsName?: string;
    goodsPicUrl?: string;
    inventory?: number;
    name?: string;
    price?: number;
    quantity?: number;
    saleTime?: string;
    sellerId?: string;
    state?: string;
    syncChainTime?: string;
    version?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    telephone?: string;
    password?: string;
    remeberMe?: boolean;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type AirDropListItem = {
    id: number;
    collectionId: number;
    recipientUserId: string;
    quantity: number;
    airDropTime: string;
  };
}
