package com.sec.team2.ems.profile;

import com.sec.team2.ems.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Privacy-safe projection of active department colleagues for employee workspace display.
 * Omits email, phone, compensation, address, and other sensitive personal details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColleagueResponse {

    private Long id;
    private String fullName;
    private String designation;
    private String workLocation;

    public static ColleagueResponse fromEntity(User user) {
        return ColleagueResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .designation(user.getDesignation())
                .workLocation(user.getWorkLocation())
                .build();
    }
}

