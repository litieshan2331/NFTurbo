package cn.hollis.nft.turbo.api.user.service;

import cn.hollis.nft.turbo.api.user.request.UserRegisterRequest;
import cn.hollis.nft.turbo.api.user.response.UserOperatorResponse;

/**
 * @author Hollis
 */
public interface UserManageFacadeService {

    /**
     * 用户冻结
     *
     * @param userId
     * @return
     */
    UserOperatorResponse freeze(Long userId);

    /**
     * 用户解冻
     *
     * @param userId
     * @return
     */
    UserOperatorResponse unfreeze(Long userId);

}
