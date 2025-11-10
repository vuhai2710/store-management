package com.storemanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Cấu hình global cho Jackson ObjectMapper
 *
 * Định dạng ngày tháng chuẩn cho toàn bộ dự án:
 * - LocalDate: dd/MM/yyyy
 * - LocalDateTime: dd/MM/yyyy HH:mm:ss
 *
 * Định dạng số:
 * - BigDecimal: Không dùng scientific notation, hiển thị đầy đủ số
 * - Double: Không dùng scientific notation, hiển thị đầy đủ số
 *
 * Áp dụng cho tất cả JSON response/request
 */
@Configuration
public class JacksonConfig {

    // Format chuẩn cho LocalDate
    private static final String DATE_FORMAT = "dd/MM/yyyy";

    // Format chuẩn cho LocalDateTime
    private static final String DATETIME_FORMAT = "dd/MM/yyyy HH:mm:ss";

    @Bean
    public ObjectMapper objectMapper() {
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // Cấu hình serializer (Entity -> JSON)
        javaTimeModule.addSerializer(LocalDate.class,
                new LocalDateSerializer(DateTimeFormatter.ofPattern(DATE_FORMAT)));
        javaTimeModule.addSerializer(LocalDateTime.class,
                new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));

        // Cấu hình deserializer (JSON -> Entity)
        javaTimeModule.addDeserializer(LocalDate.class,
                new LocalDateDeserializer(DateTimeFormatter.ofPattern(DATE_FORMAT)));
        javaTimeModule.addDeserializer(LocalDateTime.class,
                new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));

        // Cấu hình format số để tránh scientific notation
        SimpleModule numberModule = new SimpleModule();
        
        // Custom serializer cho BigDecimal - không dùng scientific notation
        numberModule.addSerializer(BigDecimal.class, new com.fasterxml.jackson.databind.JsonSerializer<BigDecimal>() {
            @Override
            public void serialize(BigDecimal value, com.fasterxml.jackson.core.JsonGenerator gen, 
                                 com.fasterxml.jackson.databind.SerializerProvider serializers) throws java.io.IOException {
                if (value == null) {
                    gen.writeNull();
                } else {
                    // Sử dụng toPlainString() để tránh scientific notation, sau đó write raw value
                    gen.writeRawValue(value.toPlainString());
                }
            }
        });
        
        // Custom serializer cho Double - không dùng scientific notation
        numberModule.addSerializer(Double.class, new com.fasterxml.jackson.databind.JsonSerializer<Double>() {
            @Override
            public void serialize(Double value, com.fasterxml.jackson.core.JsonGenerator gen, 
                                 com.fasterxml.jackson.databind.SerializerProvider serializers) throws java.io.IOException {
                if (value == null) {
                    gen.writeNull();
                } else {
                    // Convert Double sang BigDecimal để tránh scientific notation
                    BigDecimal bd = BigDecimal.valueOf(value);
                    gen.writeRawValue(bd.toPlainString());
                }
            }
        });

        return Jackson2ObjectMapperBuilder.json()
                .modules(javaTimeModule, numberModule)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
}

