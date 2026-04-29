package com.kylych.exchange.dto;

import com.kylych.exchange.domain.BookCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateExchangeBookRequest {
    @NotBlank private String title;
    @NotBlank private String author;
    private String description;
    @NotNull private BookCondition condition;
    private String coverImageUrl;
    private String isbn;
    private String genre;
    @Positive private Integer borrowDurationDays = 14;
}
