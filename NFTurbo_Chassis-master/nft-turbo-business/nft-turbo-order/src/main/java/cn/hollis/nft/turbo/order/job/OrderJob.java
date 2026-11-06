package cn.hollis.nft.turbo.order.job;

import com.xxl.job.core.biz.model.ReturnT;
import com.xxl.job.core.handler.annotation.XxlJob;
import org.springframework.stereotype.Component;

/**
 * @author Hollis
 */
@Component
public class OrderJob {

    @XxlJob("orderTimeOutExecute")
    public ReturnT<String> orderTimeOutExecute() {
        return ReturnT.SUCCESS;
    }

    @XxlJob("orderConfirmExecute")
    public ReturnT<String> orderConfirmExecute() {

        return ReturnT.SUCCESS;
    }
}
