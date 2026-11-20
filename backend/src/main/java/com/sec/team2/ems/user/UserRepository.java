package com.sec.team2.ems.user;

import com.sec.team2.ems.common.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 * Provides database queries for user management, unique email checks,
 * employee code queries, and role/status counting without writing manual SQL.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAllByOrderByIdAsc();

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByEmployeeCode(String employeeCode);

    Optional<User> findByEmailIgnoreCase(String email);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, UserStatus status);

    @Query("SELECT u.employeeCode FROM User u WHERE u.employeeCode IS NOT NULL")
    List<String> findAllEmployeeCodes();

    long countByDepartmentIgnoreCase(String department);

    @Modifying
    @Query("UPDATE User u SET u.department = :newName WHERE LOWER(u.department) = LOWER(:oldName)")
    int updateDepartmentName(@Param("oldName") String oldName, @Param("newName") String newName);
}
