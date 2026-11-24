package com.sec.team2.ems.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Report item representing hiring and join volume for a calendar month formatted as yyyy-MM.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyJoinItem {
    private String month;
    private long count;
}

