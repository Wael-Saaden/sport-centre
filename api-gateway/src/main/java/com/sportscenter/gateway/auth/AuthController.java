package com.sportscenter.gateway.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        // ✅ LOGIN SIMPLE (démo / PFE)
        if (!"admin".equals(request.getUsername())
                || !"admin".equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // 🎫 Génération JWT simplifié
        String token = generateFakeJwt(request.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    private String generateFakeJwt(String username) {

        String header = Base64.getEncoder()
                .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"
                .getBytes(StandardCharsets.UTF_8));

        String payload = Base64.getEncoder()
                .encodeToString((
                        "{\"sub\":\"" + username + "\",\"role\":\"USER\"}"
                ).getBytes(StandardCharsets.UTF_8));

        String signature = Base64.getEncoder()
                .encodeToString("signature".getBytes());

        return header + "." + payload + "." + signature;
    }
}
