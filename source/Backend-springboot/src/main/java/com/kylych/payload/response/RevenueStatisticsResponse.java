package com.kylych.payload.response;

import lombok.Data;

@Data
public class RevenueStatisticsResponse {

    public double monthlyRevenue;
    public double lastMonthRevenue;
    public double revenuePercentageChange;
    public String currency;
    public int year;
    public int month;
}
