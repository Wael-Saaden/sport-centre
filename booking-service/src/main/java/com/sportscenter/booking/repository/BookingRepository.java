package com.sportscenter.booking.repository;

import com.sportscenter.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByMemberId(Long memberId);
    List<Booking> findByActivityId(Long activityId);
}
