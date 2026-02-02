package com.sportscenter.booking.service;

import com.sportscenter.booking.dto.BookingDTO;
import com.sportscenter.booking.entity.Booking;
import com.sportscenter.booking.entity.BookingStatus;
import com.sportscenter.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    /* =========================
       CREATE
    ========================= */

    public BookingDTO createBooking(BookingDTO dto) {
        Booking booking = new Booking();
        booking.setMemberId(dto.getMemberId());
        booking.setActivityId(dto.getActivityId());

        // sécurité : statut forcé backend
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingDate(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    /* =========================
       READ
    ========================= */

    public BookingDTO getBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Réservation non trouvée : " + id)
                );

        return convertToDTO(booking);
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByMember(Long memberId) {
        return bookingRepository.findByMemberId(memberId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByActivity(Long activityId) {
        return bookingRepository.findByActivityId(activityId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /* =========================
       UPDATE
    ========================= */

    public BookingDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Réservation non trouvée : " + id)
                );

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationDate(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);
        return convertToDTO(updated);
    }

    /* =========================
       DELETE
    ========================= */

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Réservation inexistante : " + id);
        }
        bookingRepository.deleteById(id);
    }

    /* =========================
       MAPPING ENTITY → DTO
    ========================= */

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setMemberId(booking.getMemberId());
        dto.setActivityId(booking.getActivityId());
        dto.setStatus(
        	    booking.getStatus() != null
        	        ? booking.getStatus().name()
        	        : "CONFIRMED"
        	);

        return dto;
    }
}
