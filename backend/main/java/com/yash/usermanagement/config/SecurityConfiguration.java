package com.yash.usermanagement.config;

import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.core.annotation.NonNull;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties("micronaut.security")
public class SecurityConfiguration {

    @NonNull
    @NotBlank
    private String jwtSecret;

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }
}