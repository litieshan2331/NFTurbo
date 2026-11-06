package cn.hollis.nft.turbo.gateway;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author 11522
 * @since 2024/1/20 16:09
 */
@SpringBootApplication(scanBasePackages = "cn.hollis.nft.turbo.gateway")
public class NfTurboGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(NfTurboGatewayApplication.class, args);
    }

}
