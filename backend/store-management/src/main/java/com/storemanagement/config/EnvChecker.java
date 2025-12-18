package com.storemanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class EnvChecker implements CommandLineRunner {

    @Value("${PAYOS_CLIENT_ID:NOT_FOUND}")
    private String clientId;

    @Value("${PAYOS_API_KEY:NOT_FOUND}")
    private String apiKey;

    @Value("${PAYOS_CHECKSUM_KEY:NOT_FOUND}")
    private String checksumKey;

    @Value("${GHN_TOKEN:NOT_FOUND}")
    private String ghnToken;

    @Value("${GHN_SHOP_ID:NOT_FOUND}")
    private String ghnShopId;

    @Override
    public void run(String... args) {
        System.out.println("PAYOS_CLIENT_ID = " + clientId);
        System.out.println("PAYOS_API_KEY = " + apiKey);
        System.out.println("PAYOS_CHECKSUM_KEY = " + checksumKey);
        System.out.println("GHN_TOKEN = " + ghnToken);
        System.out.println("GHN_SHOP_ID = " + ghnShopId);
    }
}
