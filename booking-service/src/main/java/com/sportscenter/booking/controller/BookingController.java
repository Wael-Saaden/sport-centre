package com.sportscenter.booking.controller;

import com.sportscenter.booking.dto.BookingDTO;
import com.sportscenter.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody BookingDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingService.createBooking(dto));
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByMember(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(
                bookingService.getBookingsByMember(memberId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByActivity(
            @PathVariable Long activityId) {
        return ResponseEntity.ok(
                bookingService.getBookingsByActivity(activityId));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
